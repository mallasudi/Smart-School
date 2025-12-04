// backend/src/controllers/parentController.js
import { prisma } from "../utils/prisma.js";
import bcrypt from "bcrypt";

/* ============================================================
   1. PARENT SELF-REGISTRATION (Student ID + DOB verification)
============================================================ */
export const registerParent = async (req, res) => {
  const {
    username,
    email,
    password,
    first_name,
    last_name,
    phone,
    address,
    linkedStudentId,  // from UI
    dob,              // YYYY-MM-DD
  } = req.body;

  try {
    const studentId = Number(linkedStudentId);

    // Find student by ID
    const student = await prisma.student.findUnique({
      where: { student_id: studentId },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Verify DOB
    if (student.dob && dob) {
      const savedDOB = student.dob.toISOString().split("T")[0];
      if (savedDOB !== dob) {
        return res
          .status(400)
          .json({ message: "Student DOB does not match" });
      }
    }

    // Check if parent email already exists
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create parent user + parent profile
    const createdUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: "parent",
        parent: {
          create: {
            first_name,
            last_name,
            phone,
            address,
          },
        },
      },
      include: { parent: true },
    });

    // Link student → parent
    await prisma.student.update({
      where: { student_id: studentId },
      data: { parent_id: createdUser.parent.parent_id },
    });

    return res.status(201).json({
      message: "Parent registered successfully!",
    });
  } catch (err) {
    console.error("PARENT REGISTER ERROR:", err);
    return res.status(500).json({ message: "Registration failed" });
  }
};

/* ============================================================
   2. GET LOGGED-IN PARENT PROFILE
============================================================ */
export const getParentProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const parent = await prisma.parent.findUnique({
      where: { user_id: userId },
      include: { user: true },
    });

    if (!parent) {
      return res.status(404).json({ message: "Parent profile not found" });
    }

    const profile = {
      user_id: userId,
      email: parent.user.email,
      first_name: parent.first_name || "",
      last_name: parent.last_name || "",
      phone: parent.phone || "",
      address: parent.address || "",
    };

    return res.json({ profile });
  } catch (err) {
    console.error("GET PARENT PROFILE ERROR:", err);
    return res.status(500).json({ message: "Failed to load parent profile" });
  }
};

/* ============================================================
   3. UPDATE LOGGED-IN PARENT PROFILE
============================================================ */
export const updateParentProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, phone, address } = req.body;

    const updated = await prisma.parent.update({
      where: { user_id: userId },
      data: {
        first_name,
        last_name,
        phone,
        address,
      },
    });

    return res.json({
      message: "Parent profile updated",
      parent: updated,
    });
  } catch (err) {
    console.error("UPDATE PARENT PROFILE ERROR:", err);
    res.status(500).json({ message: "Failed to update parent profile" });
  }
};

/* ============================================================
   4. CHANGE PARENT PASSWORD
============================================================ */
export const changeParentPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { user_id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { user_id: userId },
      data: { password: hashed },
    });

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("CHANGE PARENT PASSWORD ERROR:", err);
    res.status(500).json({ message: "Failed to change password" });
  }
};


