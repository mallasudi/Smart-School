// backend/src/controllers/feeController.js
import { prisma } from "../utils/prisma.js";

/* ======================================================
   ADMIN → Create Fee
====================================================== */
export const createFee = async (req, res) => {
  try {
    const { student_id, amount, due_date } = req.body;

    if (!student_id || !amount || !due_date) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const fee = await prisma.fee.create({
      data: {
        student_id: Number(student_id),
        amount: Number(amount),
        due_date: new Date(due_date),
        status: "Unpaid",
      },
    });

    res.json({ message: "Fee assigned", fee });
  } catch (err) {
    console.error("CREATE FEE ERROR:", err);
    res.status(500).json({ message: "Failed to assign fee" });
  }
};

/* ======================================================
   ADMIN → List all fees
====================================================== */
export const adminListFees = async (req, res) => {
  try {
    const fees = await prisma.fee.findMany({
      include: { student: true },
      orderBy: { due_date: "desc" },
    });

    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: "Failed to load fees" });
  }
};

/* ======================================================
   PARENT → View child fees
====================================================== */
export const parentListFees = async (req, res) => {
  try {
    const parent = await prisma.parent.findUnique({
      where: { user_id: req.user.id },
    });

    const fees = await prisma.fee.findMany({
      where: { student_id: parent.student_id },
      orderBy: { due_date: "asc" },
    });

    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: "Failed to load parent fees" });
  }
};

/* ======================================================
   PARENT → Mock Pay Fee
====================================================== */
export const parentPayFee = async (req, res) => {
  try {
    const fee_id = Number(req.params.fee_id);

    const fee = await prisma.fee.update({
      where: { fee_id },
      data: {
        status: "Paid",
        paid_at: new Date(),
      },
    });

    res.json({ message: "Mock payment successful!", fee });
  } catch (err) {
    res.status(500).json({ message: "Payment failed" });
  }
};

/* ======================================================
   STUDENT → View fees
====================================================== */
export const studentListFees = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { user_id: req.user.id },
    });

    const fees = await prisma.fee.findMany({
      where: { student_id: student.student_id },
      orderBy: { due_date: "asc" },
    });

    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: "Failed to load student fees" });
  }
};
