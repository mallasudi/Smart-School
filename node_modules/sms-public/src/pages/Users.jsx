// frontend/src/pages/Users.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Edit,
  Trash2,
  Search,
  Users as UsersIcon,
  UserCheck,
  UserX,
  Clipboard,
  Check,
  Eye,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Users() {
  const { token } = useAuth();

  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const [classes, setClasses] = useState([]); // ✅ class list

  const [showFormModal, setShowFormModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [createdUser, setCreatedUser] = useState(null);

  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "teacher",

    first_name: "",
    last_name: "",
    dob: "",
    gender: "",
    phone: "",
    address: "",
    class_id: "",
  });

  const [copied, setCopied] = useState(false);
  const [detailsData, setDetailsData] = useState(null);

  // ------------- FETCH USERS -------------
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to load users");
        return;
      }

      const normalized = (data.users || []).map((u) => ({
        ...u,
        username: u.username || "",
        email: u.email || "",
        role: (u.role || "").toLowerCase(),
        status: u.status || "Active",
      }));

      setUsers(normalized);
      setFiltered(normalized);
    } catch (err) {
      console.error("Fetch users error:", err);
      alert("Could not fetch users");
    }
  };

  // ------------- FETCH CLASSES -------------
  const fetchClasses = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/admin/classes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Failed to load classes", data.message);
        return;
      }
      setClasses(data.classes || []);
    } catch (err) {
      console.error("Fetch classes error:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchClasses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ------------- SEARCH FILTER -------------
  useEffect(() => {
    const term = search.toLowerCase();

    const f = users.filter(
      (u) =>
        (u.username || "").toLowerCase().includes(term) ||
        (u.email || "").toLowerCase().includes(term) ||
        (u.role || "").toLowerCase().includes(term)
    );
    setFiltered(f);
  }, [search, users]);

  // ------------- OPEN MODALS -------------
  const openAddModal = () => {
    setEditingUser(null);
    setForm({
      username: "",
      email: "",
      role: "teacher",
      first_name: "",
      last_name: "",
      dob: "",
      gender: "",
      phone: "",
      address: "",
      class_id: "",
    });
    setShowFormModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setForm((f) => ({
      ...f,
      username: user.username,
      email: user.email,
      role: (user.role || "").toLowerCase(),
      // editing मा student extra fields change नगर्ने
    }));
    setShowFormModal(true);
  };

  const openDetailsModal = async (user) => {
    const role = (user.role || "").toLowerCase();
    if (role === "admin") return;

    try {
      const res = await fetch(
        `http://localhost:4000/api/admin/users/${user.user_id}/details`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to load user details");
        return;
      }

      setDetailsData(data);
      setShowDetailsModal(true);
    } catch (err) {
      console.error("Fetch details error:", err);
      alert("Could not fetch user details");
    }
  };

  // ------------- HANDLE SUBMIT -------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingUser) {
        // UPDATE (username + email only)
        const res = await fetch(
          `http://localhost:4000/api/admin/users/${editingUser.user_id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              username: form.username,
              email: form.email,
            }),
          }
        );

        const data = await res.json();
        if (!res.ok) {
          alert(data.message || "Failed to update user");
          return;
        }

        alert("User updated successfully");
        setShowFormModal(false);
        fetchUsers();
      } else {
        // ADD (teacher / student)
        const payload = { ...form };
        payload.role = (payload.role || "").toLowerCase();

        // यदि teacher हो भने student extra fields clear गरेर पठाउनू
        if (payload.role !== "student") {
          delete payload.first_name;
          delete payload.last_name;
          delete payload.dob;
          delete payload.gender;
          delete payload.phone;
          delete payload.address;
          delete payload.class_id;
        }

        const res = await fetch("http://localhost:4000/api/admin/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          alert(data.message || "Failed to create user");
          return;
        }

        setCreatedUser(data.user);
        setGeneratedPassword(data.rawPassword || "");
        setShowFormModal(false);
        setShowPasswordModal(true);
        fetchUsers();
      }
    } catch (err) {
      console.error("Save user error:", err);
      alert("Something went wrong");
    }
  };

  // ------------- DELETE USER -------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(
        `http://localhost:4000/api/admin/users/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to delete user");
        return;
      }

      alert("User deleted successfully");
      fetchUsers();
    } catch (err) {
      console.error("Delete user error:", err);
      alert("Something went wrong");
    }
  };

  // ------------- COPY GENERATED PASSWORD -------------
  const copyToClipboard = () => {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const totalActive = filtered.filter(
    (u) => (u.status || "Active") === "Active"
  ).length;
  const totalInactive = filtered.length - totalActive;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <UsersIcon className="w-6 h-6 text-blue-500" />
          Manage Users
        </h1>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow hover:from-orange-400 hover:to-blue-500 transition-transform transform hover:scale-[1.02]"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Users"
          value={filtered.length}
          icon={<UsersIcon className="w-10 h-10 text-blue-400" />}
        />
        <StatCard
          title="Active Users"
          value={totalActive}
          icon={<UserCheck className="w-10 h-10 text-green-400" />}
        />
        <StatCard
          title="Inactive Users"
          value={totalInactive}
          icon={<UserX className="w-10 h-10 text-red-400" />}
        />
      </div>

      {/* Table */}
      <motion.div
        className="bg-white rounded-xl shadow overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <table className="w-full text-left border-collapse">
          <thead className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
            <tr>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, idx) => {
              const roleLower = (user.role || "").toLowerCase();
              return (
                <tr
                  key={user.user_id}
                  className={`border-t ${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {user.username}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3 capitalize">{roleLower}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        (user.status || "Active") === "Active"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {user.status || "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2 justify-center">
                    {roleLower !== "admin" && (
                      <button
                        className="p-2 rounded-full hover:bg-indigo-100 text-indigo-600"
                        onClick={() => openDetailsModal(user)}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      className="p-2 rounded-full hover:bg-blue-100 text-blue-600"
                      onClick={() => openEditModal(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-full hover:bg-red-100 text-red-600"
                      onClick={() => handleDelete(user.user_id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showFormModal && (
          <FormModal
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            onClose={() => setShowFormModal(false)}
            editing={!!editingUser}
            classes={classes}
          />
        )}
      </AnimatePresence>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <PasswordModal
            createdUser={createdUser}
            password={generatedPassword}
            onCopy={copyToClipboard}
            copied={copied}
            onClose={() => setShowPasswordModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && detailsData && (
          <UserDetailsModal
            data={detailsData}
            onClose={() => {
              setShowDetailsModal(false);
              setDetailsData(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Small Components ---------- */

function StatCard({ title, value, icon }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="p-5 bg-white rounded-xl shadow flex items-center justify-between"
    >
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h3 className="text-2xl font-semibold">{value}</h3>
      </div>
      {icon}
    </motion.div>
  );
}

function FormModal({ form, setForm, onSubmit, onClose, editing, classes }) {
  const isStudent = (form.role || "").toLowerCase() === "student";

  const handleRoleChange = (e) => {
    const value = e.target.value.toLowerCase();
    setForm((f) => ({
      ...f,
      role: value,
      ...(value === "student"
        ? {}
        : {
            first_name: "",
            last_name: "",
            dob: "",
            gender: "",
            phone: "",
            address: "",
            class_id: "",
          }),
    }));
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
      >
        <h2 className="text-xl font-bold mb-4">
          {editing ? "Edit User" : "Add New User"}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* basic auth fields */}
          <input
            className="w-full px-4 py-2 border rounded-lg focus:ring-2"
            placeholder="Username"
            value={form.username}
            onChange={(e) =>
              setForm((f) => ({ ...f, username: e.target.value }))
            }
            required
          />

          <input
            className="w-full px-4 py-2 border rounded-lg focus:ring-2"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm((f) => ({ ...f, email: e.target.value }))
            }
            required
          />

          <select
            className="w-full px-4 py-2 border rounded-lg"
            value={form.role}
            onChange={handleRoleChange}
          >
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>

          {/* Student extra fields */}
          {isStudent && (
            <div className="mt-2 space-y-3 border-t pt-3">
              <p className="text-sm font-semibold text-gray-700">
                Student Details
              </p>

              <div className="flex gap-2">
                <input
                  className="w-1/2 px-3 py-2 border rounded-lg text-sm"
                  placeholder="First Name"
                  value={form.first_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, first_name: e.target.value }))
                  }
                />
                <input
                  className="w-1/2 px-3 py-2 border rounded-lg text-sm"
                  placeholder="Last Name"
                  value={form.last_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, last_name: e.target.value }))
                  }
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="date"
                  className="w-1/2 px-3 py-2 border rounded-lg text-sm"
                  value={form.dob}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dob: e.target.value }))
                  }
                />
                <select
                  className="w-1/2 px-3 py-2 border rounded-lg text-sm"
                  value={form.gender}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, gender: e.target.value }))
                  }
                >
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  className="w-1/2 px-3 py-2 border rounded-lg text-sm"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
                <select
                  className="w-1/2 px-3 py-2 border rounded-lg text-sm"
                  value={form.class_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, class_id: e.target.value }))
                  }
                  required={isStudent}
                >
                  <option value="">Select Class</option>
                  {classes.map((c) => (
                    <option key={c.class_id} value={c.class_id}>
                      {c.class_name}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="Address"
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
              />
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              {editing ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function PasswordModal({ createdUser, password, onCopy, copied, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
      >
        <h2 className="text-xl font-bold mb-2">User Created</h2>

        <p>
          <strong>Username:</strong> {createdUser?.username}
        </p>
        <p>
          <strong>Email:</strong> {createdUser?.email}
        </p>

        <div className="mt-4 p-3 bg-gray-100 rounded-lg flex items-center justify-between">
          <span className="font-mono text-lg">{password}</span>
          <button onClick={onCopy} className="text-blue-600">
            {copied ? <Check /> : <Clipboard />}
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}

function UserDetailsModal({ data, onClose }) {
  const { user, detail } = data || {};
  if (!user) return null;

  const role = (user.role || "").toLowerCase();

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      const dateObj = typeof d === "string" ? new Date(d) : d;
      return dateObj.toISOString().split("T")[0];
    } catch {
      return String(d);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg"
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.88, opacity: 0 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            User Details{" "}
            <span className="text-sm text-gray-500 capitalize">({role})</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Base info */}
        <div className="mb-4 border-b pb-3 space-y-1">
          <p>
            <span className="font-semibold">Username:</span> {user.username}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {user.email}
          </p>
          <p>
            <span className="font-semibold">Status:</span>{" "}
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                (user.status || "Active") === "Active"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {user.status || "Active"}
            </span>
          </p>
          <p className="text-sm text-gray-500">
            Created at: {formatDate(user.created_at)}
          </p>
        </div>

        {/* Role-specific details */}
        {detail?.type === "teacher" && (
          <div className="space-y-2">
            <h3 className="font-semibold mb-1">Teacher Information</h3>
            <p>
              <span className="font-semibold">Name:</span>{" "}
              {detail.first_name || detail.last_name
                ? `${detail.first_name || ""} ${detail.last_name || ""}`.trim()
                : "—"}
            </p>
            <p>
              <span className="font-semibold">Subject:</span>{" "}
              {detail.subject || "—"}
            </p>
            <p>
              <span className="font-semibold">Phone:</span>{" "}
              {detail.phone || "—"}
            </p>
            <p>
              <span className="font-semibold">Address:</span>{" "}
              {detail.address || "—"}
            </p>
          </div>
        )}

        {detail?.type === "student" && (
          <div className="space-y-2">
            <h3 className="font-semibold mb-1">Student Information</h3>
            <p>
              <span className="font-semibold">Name:</span>{" "}
              {detail.first_name || detail.last_name
                ? `${detail.first_name || ""} ${detail.last_name || ""}`.trim()
                : "—"}
            </p>
            <p>
              <span className="font-semibold">DOB:</span>{" "}
              {formatDate(detail.dob)}
            </p>
            <p>
              <span className="font-semibold">Gender:</span>{" "}
              {detail.gender || "—"}
            </p>
            <p>
              <span className="font-semibold">Phone:</span>{" "}
              {detail.phone || "—"}
            </p>
            <p>
              <span className="font-semibold">Address:</span>{" "}
              {detail.address || "—"}
            </p>
            <p>
              <span className="font-semibold">Parent ID:</span>{" "}
              {detail.parent_id || "—"}
            </p>
            <p>
              <span className="font-semibold">Class ID:</span>{" "}
              {detail.class_id || "—"}
            </p>
          </div>
        )}

        {detail?.type === "parent" && (
          <div className="space-y-2">
            <h3 className="font-semibold mb-1">Parent Information</h3>
            <p>
              <span className="font-semibold">Name:</span>{" "}
              {detail.first_name || detail.last_name
                ? `${detail.first_name || ""} ${detail.last_name || ""}`.trim()
                : "—"}
            </p>
            <p>
              <span className="font-semibold">Phone:</span>{" "}
              {detail.phone || "—"}
            </p>
            <p>
              <span className="font-semibold">Address:</span>{" "}
              {detail.address || "—"}
            </p>
            <p>
              <span className="font-semibold">Linked Student IDs:</span>{" "}
              {detail.linkedStudentIds && detail.linkedStudentIds.length > 0
                ? detail.linkedStudentIds.join(", ")
                : "None"}
            </p>
          </div>
        )}

        {!detail?.type ||
          (detail?.type !== "teacher" &&
            detail?.type !== "student" &&
            detail?.type !== "parent" && (
              <p className="text-sm text-gray-500">
                No extra profile details saved yet for this role.
              </p>
            ))}

        <button
          onClick={onClose}
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}
