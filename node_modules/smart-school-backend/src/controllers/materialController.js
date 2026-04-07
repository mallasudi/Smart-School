import { prisma } from "../utils/prisma.js";

// UPLOAD MATERIAL
export const uploadMaterial = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT
    const { title, subject_id } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    //  Fetch teacher_id using user_id
    const teacher = await prisma.teacher.findUnique({
      where: { user_id: userId },
    });

    if (!teacher) {
      return res.status(400).json({ message: "Teacher not found" });
    }

    const file_url = `/uploads/${req.file.filename}`;

    const material = await prisma.material.create({
      data: {
        title,
        subject_id: Number(subject_id),
        teacher_id: teacher.teacher_id, 
        file_url,
      },
    });

    return res.json({ message: "Material uploaded", material });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: "Upload failed" });
  }
};

// GET MATERIALS FOR TEACHER
export const getTeacherMaterials = async (req, res) => {
  try {
    const userId = req.user.id;

    const teacher = await prisma.teacher.findUnique({
      where: { user_id: userId },
    });

    if (!teacher) {
      return res.status(400).json({ message: "Teacher not found" });
    }

    const materials = await prisma.material.findMany({
      where: { teacher_id: teacher.teacher_id },
      orderBy: { uploaded_at: "desc" },
    });

    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: "Error loading materials" });
  }
};

// DELETE MATERIAL
export const deleteMaterial = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.material.delete({ where: { material_id: id } });

    res.json({ message: "Material deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};

export const getStudentMaterials = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { user_id: req.user.id },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const materials = await prisma.material.findMany({
      where: { subject_id: student.subject_id },
      include: { teacher: true },
      orderBy: { uploaded_at: "desc" },
    });

    res.json(materials);
  } catch (err) {
    console.error("STUDENT MATERIALS ERROR:", err);
    return res.status(500).json({ message: "Failed to load materials" });
  }
};
