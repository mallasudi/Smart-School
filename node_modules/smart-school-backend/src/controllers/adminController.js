// backend/src/controllers/adminController.js
import { prisma } from "../utils/prisma.js";
import bcrypt from "bcrypt";

function generatePassword(roleLower) {
  const prefix = roleLower === "teacher" ? "teach" : "stud";
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${rand}`;
}

/* ------------------ GET USERS ------------------ */
export const getUsers = async (req, res) => {
  try {
    const rawUsers = await prisma.user.findMany({
      orderBy: { user_id: "asc" },
      select: {
        user_id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        created_at: true,
      },
    });

    // admin लाई table बाट लुकाउने (manage users मा नदेखाउन)
    const filtered = rawUsers.filter(
      (u) => (u.role || "").toLowerCase() !== "admin"
    );

    const users = filtered.map((u) => ({
      ...u,
      role: (u.role || "").toLowerCase(),
      status: u.status || "Active",
    }));

    res.json({ users });
  } catch (err) {
    console.error("getUsers error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/* ------------------ ADD USER (teacher/student) ------------------ */
// POST /api/admin/users
export const addUser = async (req, res) => {
  try {
    const {
      username,
      email,
      role,

      // optional profile fields (mainly for students)
      first_name,
      last_name,
      dob,
      gender,
      phone,
      address,
      class_id,
    } = req.body;

    const roleLower = (role || "").toLowerCase();

    if (!username || !email || !roleLower) {
      return res
        .status(400)
        .json({ message: "username, email and role are required" });
    }

    if (!["teacher", "student"].includes(roleLower)) {
      return res
        .status(400)
        .json({ message: "Admin can only create Teacher or Student" });
    }

    // ✅ Student create गर्दा class_id अनिवार्य
    if (roleLower === "student" && !class_id) {
      return res
        .status(400)
        .json({ message: "class_id is required when creating a student" });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ message: "Email exists" });

    const pwd = generatePassword(roleLower);
    const hashed = await bcrypt.hash(pwd, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashed,
        role: roleLower,
      },
    });

    // --- Create profile by role ---
    if (roleLower === "teacher") {
      await prisma.teacher.create({
        data: {
          user_id: newUser.user_id,
          first_name: first_name || null,
          last_name: last_name || null,
          subject: null,
          phone: phone || null,
          address: address || null,
        },
      });
    } else if (roleLower === "student") {
      let dobDate = null;
      if (dob) {
        const parsed = new Date(dob);
        if (!isNaN(parsed.getTime())) {
          dobDate = parsed;
        }
      }

      await prisma.student.create({
        data: {
          user_id: newUser.user_id,
          first_name: first_name || null,
          last_name: last_name || null,
          dob: dobDate,
          gender: gender || null,
          phone: phone || null,
          address: address || null,
          // 🔥 MAIN POINT: class_id DB मा save हुन्छ
          class_id: class_id ? Number(class_id) : null,
          parent_id: null,
        },
      });
    }

    res.status(201).json({
      message: "User created successfully",
      user: {
        user_id: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status || "Active",
      },
      rawPassword: pwd,
    });
  } catch (err) {
    console.error("addUser error:", err);
    res.status(500).json({ message: "Failed to create user" });
  }
};

/* ------------------ UPDATE USER ------------------ */
export const updateUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { username, email } = req.body;

    const updated = await prisma.user.update({
      where: { user_id: id },
      data: { username, email },
    });

    res.json({
      message: "User updated",
      user: {
        user_id: updated.user_id,
        username: updated.username,
        email: updated.email,
        role: (updated.role || "").toLowerCase(),
        status: updated.status || "Active",
      },
    });
  } catch (err) {
    console.error("updateUser error:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

/* ------------------ DELETE USER ------------------ */
export const deleteUser = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const user = await prisma.user.findUnique({ where: { user_id: id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    if ((user.role || "").toLowerCase() === "admin")
      return res.status(400).json({ message: "Cannot delete admin" });

    await prisma.parent.deleteMany({ where: { user_id: id } });
    await prisma.teacher.deleteMany({ where: { user_id: id } });
    await prisma.student.deleteMany({ where: { user_id: id } });

    await prisma.user.delete({ where: { user_id: id } });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("deleteUser error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};

/* ------------------ GET USER FULL DETAILS ------------------ */
// GET /api/admin/users/:id/details
export const getUserDetails = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await prisma.user.findUnique({
      where: { user_id: id },
      include: {
        teacher: true,
        student: true,
        parent: {
          include: {
            students: {
              select: { student_id: true },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const roleLower = (user.role || "").toLowerCase();

    const baseUser = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: roleLower,
      status: user.status || "Active",
      created_at: user.created_at,
    };

    let detail = null;

    if (roleLower === "teacher" && user.teacher) {
      detail = {
        type: "teacher",
        teacher_id: user.teacher.teacher_id,
        first_name: user.teacher.first_name,
        last_name: user.teacher.last_name,
        subject: user.teacher.subject,
        phone: user.teacher.phone,
        address: user.teacher.address,
      };
    } else if (roleLower === "student" && user.student) {
      detail = {
        type: "student",
        student_id: user.student.student_id,
        first_name: user.student.first_name,
        last_name: user.student.last_name,
        dob: user.student.dob,
        gender: user.student.gender,
        phone: user.student.phone,
        address: user.student.address,
        parent_id: user.student.parent_id,
        class_id: user.student.class_id,
      };
    } else if (roleLower === "parent" && user.parent) {
      detail = {
        type: "parent",
        parent_id: user.parent.parent_id,
        first_name: user.parent.first_name,
        last_name: user.parent.last_name,
        phone: user.parent.phone,
        address: user.parent.address,
        linkedStudentIds: (user.parent.students || []).map(
          (s) => s.student_id
        ),
      };
    } else {
      detail = { type: roleLower || "unknown" };
    }

    return res.json({ user: baseUser, detail });
  } catch (err) {
    console.error("getUserDetails error:", err);
    res.status(500).json({ message: "Failed to fetch user details" });
  }
};

/* ------------------ LIST CLASSES (for dropdown) ------------------ */
// GET /api/admin/classes
export const listClasses = async (req, res) => {
  try {
    const classes = await prisma.class.findMany({
      orderBy: { class_id: "asc" },
      select: {
        class_id: true,
        class_name: true, 
      },
    });

    res.json({ classes });
  } catch (err) {
    console.error("listClasses error:", err);
    res.status(500).json({ message: "Failed to fetch classes" });
  }
};
