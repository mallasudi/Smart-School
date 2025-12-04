import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import parentRoutes from "./routes/parentRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import morgan from "morgan";




// ⭐ NEW — Teacher Exam Management routes
//import teacherExamRoutes from "./routes/teacherExamRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
/* ---------------------------------------
   PUBLIC ROUTES
--------------------------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/parent", parentRoutes);

/* ---------------------------------------
   EXAM ROUTES (ADMIN ONLY)
--------------------------------------- */
app.use("/api/admin/exams", examRoutes);

/* ---------------------------------------
   STUDENT ROUTES 
--------------------------------------- */
app.use("/api/student", studentRoutes);

/* ---------------------------------------
   ADMIN ROUTES
--------------------------------------- */
app.use("/api/admin", adminRoutes);

/* ---------------------------------------
   TEACHER ROUTES
--------------------------------------- */
app.use("/api/teacher", teacherRoutes);

app.use("/api/notices", noticeRoutes);

app.use("/api/subjects", subjectRoutes);


//  NEW — Teacher Exam System
//app.use("/api/teacher/exams", teacherExamRoutes);

/* ---------------------------------------
   404 HANDLER
--------------------------------------- */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* ---------------------------------------
   GLOBAL ERROR HANDLER
--------------------------------------- */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`[BACKEND] API running at http://localhost:${PORT}`);
});
