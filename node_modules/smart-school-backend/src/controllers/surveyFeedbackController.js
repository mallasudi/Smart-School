// backend/src/controllers/surveyFeedbackController.js
import { prisma } from "../utils/prisma.js";

/* ==========================================================
   PARENT → SUBMIT SURVEY FEEDBACK
========================================================== */
export const parentSubmitSurveyFeedback = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthenticated" });

    const data = await prisma.parentSurveyFeedback.create({
      data: {
        parent_id: userId,
        quality_education: req.body.qualityEducation ?? null,
        extracurricular: req.body.extracurricular ?? null,
        teaching_methods: req.body.teachingMethods ?? null,
        campus_safety: req.body.campusSafety ?? null,
        homework_load: req.body.homeworkLoad ?? null,
        teacher_attention: req.body.teacherAttention ?? null,
        social_support: req.body.socialSupport ?? null,
        child_safety: req.body.childSafety ?? null,
        extracurricular_level: req.body.extracurricularLevel ?? null,
        teaching_effective: req.body.teachingEffective ?? null,
        suggestions: req.body.suggestions ?? null,
        additional_feedback: req.body.additionalFeedback ?? null,
        created_at: new Date(),   // 🔥 FIX ADDED
      },
    });

    return res.json({
      success: true,
      message: "Survey feedback submitted successfully",
      item: data,
    });
  } catch (err) {
    console.error("PARENT SURVEY FEEDBACK ERROR:", err);
    return res.status(500).json({ message: "Failed to submit survey" });
  }
};

/* ==========================================================
   ADMIN → VIEW ALL SURVEY FEEDBACK
========================================================== */
export const adminListSurveyFeedback = async (req, res) => {
  try {
    const feedbacks = await prisma.parentSurveyFeedback.findMany({
      include: {
        parent: {
          select: {
            user_id: true,
            email: true,
            username: true,
          }
        },
      },
      orderBy: { created_at: "desc" }, // works now because default exists
    });

    return res.json({ success: true, feedbacks });
  } catch (err) {
    console.error("ADMIN SURVEY FEEDBACK ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load survey feedback.",
    });
  }
};

