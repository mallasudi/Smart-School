// backend/src/controllers/studentController.js
import { prisma } from "../utils/prisma.js";

/* ==========================================================
   GET LOGGED-IN STUDENT PROFILE
========================================================== */
export const getStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const student = await prisma.student.findUnique({
      where: { user_id: userId },
      include: {
        user: true,
        class: true,
      },
    });

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    return res.json({
      user_id: userId,
      email: student.user.email,
      first_name: student.first_name || "",
      last_name: student.last_name || "",
      dob: student.dob ? student.dob.toISOString().split("T")[0] : "",
      gender: student.gender || "",
      phone: student.phone || "",
      address: student.address || "",
      class_id: student.class_id || "",
      class_name: student.class?.class_name || "",
    });
  } catch (err) {
    console.error("GET STUDENT PROFILE ERROR:", err);
    return res.status(500).json({ message: "Failed to load student profile" });
  }
};

/* ==========================================================
   UPDATE LOGGED-IN STUDENT PROFILE  
========================================================== */
export const updateStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      first_name,
      last_name,
      dob,
      gender,
      phone,
      address,
      class_id,   
    } = req.body;

    let dobDate = null;
    if (dob) {
      const parsed = new Date(dob);
      if (!isNaN(parsed.getTime())) {
        dobDate = parsed;
      }
    }

    const updated = await prisma.student.update({
      where: { user_id: userId },
      data: {
        first_name,
        last_name,
        dob: dobDate,
        gender,
        phone,
        address,
        class_id: class_id ? Number(class_id) : null,   
      },
    });

    return res.json({
      message: "Student profile updated",
      student: updated,
    });
  } catch (err) {
    console.error("UPDATE STUDENT PROFILE ERROR:", err);
    return res.status(500).json({ message: "Failed to update student profile" });
  }
};
