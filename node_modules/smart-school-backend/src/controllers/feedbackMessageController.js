// backend/src/controllers/feedbackMessageController.js
import { prisma } from "../utils/prisma.js";

/* ----------------------------------------------------------
   HELPERS
---------------------------------------------------------- */
const normalizeReceiver = (val) => {
  if (!val) return "CLASS_TEACHER";
  const v = String(val).toLowerCase();
  if (v.includes("admin")) return "ADMIN";
  if (v.includes("account")) return "ACCOUNTS";
  return "CLASS_TEACHER";
};

/* ============================================================
   PARENT → SEND FEEDBACK MESSAGE
============================================================ */
export const parentSendFeedbackMessage = async (req, res) => {
  try {
    const senderId = req.user.id;

    const {
      childLabel,
      child_label,
      recipient,
      receiver,
      subject,
      message,
      priority,
      sendCopy,
      send_copy,
    } = req.body || {};

    if (!subject || !message) {
      return res.status(400).json({
        message: "Subject and message are required.",
      });
    }

    const finalChildLabel = child_label ?? childLabel ?? null;
    const finalReceiver = normalizeReceiver(receiver ?? recipient ?? "Class Teacher");
    const finalPriority = priority || "Normal";
    const finalSendCopy =
      typeof send_copy === "boolean"
        ? send_copy
        : typeof sendCopy === "boolean"
        ? sendCopy
        : true;

    const saved = await prisma.feedbackMessage.create({
      data: {
        sender_id: senderId,
        child_label: finalChildLabel,
        receiver: finalReceiver,
        subject,
        message,
        priority: finalPriority,
        send_copy: finalSendCopy,
      },
    });

    return res.json({
      success: true,
      data: saved,
      message: "Feedback sent successfully!",
    });
  } catch (err) {
    console.error("parentSendFeedbackMessage ERROR:", err);
    return res.status(500).json({ message: "Failed to send feedback" });
  }
};

/* ============================================================
   TEACHER → FEEDBACK INBOX
============================================================ */
export const teacherListFeedbackMessages = async (req, res) => {
  try {
    const data = await prisma.feedbackMessage.findMany({
      where: { receiver: "CLASS_TEACHER" },
      orderBy: { created_at: "desc" },
      include: {
        sender: { select: { username: true, email: true } },
      },
    });

    return res.json({ success: true, data });
  } catch (err) {
    console.error("teacherListFeedbackMessages ERROR:", err);
    return res.status(500).json({ message: "Failed to load feedback" });
  }
};

/* ============================================================
   OPTIONAL GENERIC TEACHER INBOX
============================================================ */
export const teacherGetFeedbackInbox = async (req, res) => {
  try {
    const messages = await prisma.feedbackMessage.findMany({
      orderBy: { created_at: "desc" },
      include: { sender: true },
    });

    return res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (err) {
    console.error("teacherGetFeedbackInbox ERROR:", err);
    return res.status(500).json({ message: "Failed to load inbox" });
  }
};

/* ============================================================
   ADMIN → LIST ALL MESSAGES
============================================================ */
export const adminListFeedbackMessages = async (req, res) => {
  try {
    const data = await prisma.feedbackMessage.findMany({
      orderBy: { created_at: "desc" },
      include: { sender: true },
    });

    return res.json({ success: true, data });
  } catch (err) {
    console.error("adminListFeedbackMessages ERROR:", err);
    return res.status(500).json({ message: "Failed to load feedback" });
  }
};
