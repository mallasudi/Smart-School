// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

// Dashboards
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ParentDashboard from "./pages/ParentDashboard";

// Auth pages
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ParentRegister from "./pages/ParentRegister";

// Exam pages
import StudentExamList from "./pages/StudentExamList";
import StudentTakeExam from "./pages/StudentTakeExam";
import StudentResults from "./pages/StudentResults";

import TeacherMyExams from "./pages/TeacherMyExams";
import TeacherExamQuestions from "./pages/TeacherExamQuestions";
import TeacherExamResults from "./pages/TeacherExamResults";
import TeacherExamMarks from "./pages/TeacherExamMarks";

import ParentResults from "./pages/ParentResults";
import ParentTermResults from "./pages/ParentTermResults";

import PrivateRoute from "./components/PrivateRoute";
import TeacherGrades from "./pages/TeacherGrades";

import ExamsResults from "./pages/ExamsResults.jsx";
import AdminClassResults from "./pages/AdminClassResults.jsx";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/register-parent" element={<ParentRegister />} />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      {/* FIXED — removed AdminLayout */}
      <Route
        path="/admin/class-results"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminClassResults />
          </PrivateRoute>
        }
      />

      {/* Teacher */}
      <Route
        path="/teacher"
        element={
          <PrivateRoute allowedRoles={["teacher", "admin"]}>
            <TeacherDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/teacher/dashboard"
        element={
          <PrivateRoute allowedRoles={["teacher", "admin"]}>
            <TeacherDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/teacher/exams"
        element={
          <PrivateRoute allowedRoles={["teacher", "admin"]}>
            <TeacherMyExams />
          </PrivateRoute>
        }
      />
      

      <Route
        path="/teacher/exams/:examId/questions"
        element={
          <PrivateRoute allowedRoles={["teacher", "admin"]}>
            <TeacherExamQuestions />
          </PrivateRoute>
        }
      />
      <Route
        path="/teacher/exams/:examId/results"
        element={
          <PrivateRoute allowedRoles={["teacher", "admin"]}>
            <TeacherExamResults />
          </PrivateRoute>
        }
      />
      <Route
        path="/teacher/exams/:examId/marks"
        element={
          <PrivateRoute allowedRoles={["teacher", "admin"]}>
            <TeacherExamMarks />
          </PrivateRoute>
        }
      />
      <Route
        path="/teacher/grades"
        element={
          <PrivateRoute allowedRoles={["teacher", "admin"]}>
          <TeacherGrades />
        </PrivateRoute>
        }
      />


      {/* Student */}
      <Route
        path="/student"
        element={
          <PrivateRoute allowedRoles={["student", "admin"]}>
            <StudentDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/student/dashboard"
        element={
          <PrivateRoute allowedRoles={["student", "admin"]}>
            <StudentDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/exams"
        element={
          <PrivateRoute allowedRoles={["student", "admin"]}>
            <StudentExamList />
          </PrivateRoute>
        }
      />
      <Route
        path="/student/exams/:examId"
        element={
          <PrivateRoute allowedRoles={["student", "admin"]}>
            <StudentTakeExam />
          </PrivateRoute>
        }
      />
      <Route
        path="/student/results"
        element={
          <PrivateRoute allowedRoles={["student", "admin"]}>
            <StudentResults />
          </PrivateRoute>
        }
      />

      {/* Parent */}
      <Route
        path="/parent"
        element={
          <PrivateRoute allowedRoles={["parent", "admin"]}>
            <ParentDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/parent/dashboard"
        element={
          <PrivateRoute allowedRoles={["parent", "admin"]}>
            <ParentDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/parent/results"
        element={
          <PrivateRoute allowedRoles={["parent", "admin"]}>
            <ParentResults />
          </PrivateRoute>
        }
      />
      <Route
        path="/parent/results/term/:term"
        element={
          <PrivateRoute allowedRoles={["parent", "admin"]}>
            <ParentTermResults />
          </PrivateRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
