// src/components/UserDetailsModal.jsx
import { motion, AnimatePresence } from "framer-motion";

export default function UserDetailsModal({ open, onClose, user }) {
  if (!open || !user) return null;

  const role = (user.role || "").toLowerCase();

  const profile =
    role === "student"
      ? user.student
      : role === "teacher"
      ? user.teacher
      : role === "parent"
      ? user.parent
      : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl p-6"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-4">
              User Details –{" "}
              <span className="capitalize">{role}</span>
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">User ID</span>
                <span className="font-medium">{user.user_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Username</span>
                <span className="font-medium">{user.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Role</span>
                <span className="font-medium capitalize">
                  {role}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-medium text-emerald-600">
                  {user.status || "Active"}
                </span>
              </div>
            </div>

            {/* EXTRA PROFILE */}
            {profile && (
              <div className="mt-5 border-t pt-4 text-sm">
                <h3 className="font-semibold mb-2">
                  {role === "student"
                    ? "Student Profile"
                    : role === "teacher"
                    ? "Teacher Profile"
                    : "Parent Profile"}
                </h3>
                <div className="space-y-2">
                  {profile.first_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">First Name</span>
                      <span className="font-medium">
                        {profile.first_name}
                      </span>
                    </div>
                  )}
                  {profile.last_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Name</span>
                      <span className="font-medium">
                        {profile.last_name}
                      </span>
                    </div>
                  )}
                  {profile.subject && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subject</span>
                      <span className="font-medium">
                        {profile.subject}
                      </span>
                    </div>
                  )}
                  {profile.gender && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Gender</span>
                      <span className="font-medium">
                        {profile.gender}
                      </span>
                    </div>
                  )}
                  {profile.dob && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">DOB</span>
                      <span className="font-medium">
                        {new Date(profile.dob).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone</span>
                      <span className="font-medium">
                        {profile.phone}
                      </span>
                    </div>
                  )}
                  {profile.address && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Address</span>
                      <span className="font-medium">
                        {profile.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!profile && (
              <p className="mt-4 text-xs text-gray-400">
                No extra profile details found for this user yet.
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
