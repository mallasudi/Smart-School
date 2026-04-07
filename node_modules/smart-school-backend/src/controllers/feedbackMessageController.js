// backend/src/controllers/feedbackMessageController.js
import { prisma } from "../utils/prisma.js";

/* ----------------------------------------------------------
   HELPER – map UI "Send To" → DB receiver code
   CLASS_TEACHER  = goes to teacher inbox
   ADMIN          = goes to admin / school office
---------------------------------------------------------- */
const normalizeReceiver = (val) => {
  if (!val) return "CLASS_TEACHER";

  const v = String(val).toLowerCase();

  // Class teacher
  if (v.includes("teacher")) return "CLASS_TEACHER";

  // "School Office (Fees)" etc. → ADMIN
  if (v.includes("office") || v.includes("fees")) return "ADMIN";

  // Admin / Principal / Administration → ADMIN
  if (v.includes("admin") || v.includes("principal")) return "ADMIN";

  // Default
  return "CLASS_TEACHER";
};

/* ============================================================
   PARENT → SEND FEEDBACK MESSAGE
   POST /api/parent/feedback/message
============================================================ */
export const parentSendFeedbackMessage = async (req, res) => {
  try {
    const senderId = req.user?.id;
    if (!senderId) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

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
      return res
        .status(400)
        .json({ message: "Subject and message are required." });
    }

    const finalChildLabel = child_label ?? childLabel ?? null;
    const rawReceiver = receiver ?? recipient ?? "Class Teacher";
    const finalReceiver = normalizeReceiver(rawReceiver);
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
      message: "Feedback sent successfully.",
      data: saved,
    });
  } catch (err) {
    console.error("parentSendFeedbackMessage ERROR:", err);
    return res.status(500).json({ message: "Failed to send feedback" });
  }
};

/* ============================================================
   TEACHER → FEEDBACK INBOX
   GET /api/teacher/feedback/messages
   (Currently: all messages sent to CLASS_TEACHER)
============================================================ */
export const teacherListFeedbackMessages = async (req, res) => {
  try {
    // If later you want: filter by teacher's classes here.
    const data = await prisma.feedbackMessage.findMany({
      where: { receiver: "CLASS_TEACHER" },
      orderBy: { created_at: "desc" },
      include: {
        sender: {
          select: {
            user_id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return res.json({ success: true, data });
  } catch (err) {
    console.error("teacherListFeedbackMessages ERROR:", err);
    return res.status(500).json({ message: "Failed to load feedback" });
  }
};

/* ============================================================
   OPTIONAL – generic teacher inbox (currently unused)
============================================================ */
export const teacherGetFeedbackInbox = async (req, res) => {
  try {
    const messages = await prisma.feedbackMessage.findMany({
      orderBy: { created_at: "desc" },
      include: {
        sender: {
          select: { user_id: true, email: true, username: true },
        },
      },
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
   ADMIN → LIST ALL PARENT FEEDBACK MESSAGES
   GET /api/admin/feedback/messages
============================================================ */
export const adminListFeedbackMessages = async (req, res) => {
  try {
    const data = await prisma.feedbackMessage.findMany({
      orderBy: { created_at: "desc" },
      include: {
        sender: {
          select: {
            user_id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return res.json({ success: true, data });
  } catch (err) {
    console.error("adminListFeedbackMessages ERROR:", err);
    return res.status(500).json({ message: "Failed to load feedback" });
  }
};
/* ============================================================
   TEACHER → REPLY TO A PARENT MESSAGE
============================================================ */
export const teacherReplyFeedbackMessage = async (req, res) => {
  try {
    const teacherUserId = req.user.id;
    const { messageId } = req.params;
    const { replyText } = req.body;

    if (!replyText || replyText.trim().length === 0) {
      return res.status(400).json({ message: "Reply cannot be empty." });
    }

    const existing = await prisma.feedbackMessage.findUnique({
      where: { id: Number(messageId) },
    });

    if (!existing) {
      return res.status(404).json({ message: "Message not found." });
    }

    // Store teacher reply
    const updated = await prisma.feedbackMessage.update({
      where: { id: Number(messageId) },
      data: {
        teacher_reply: replyText,
        reply_at: new Date(),
        status: "CLOSED",
      },
    });

    return res.json({
      success: true,
      message: "Reply sent successfully.",
      data: updated,
    });
  } catch (err) {
    console.error("teacherReplyFeedbackMessage ERROR:", err);
    return res.status(500).json({ message: "Failed to send reply." });
  }
};
