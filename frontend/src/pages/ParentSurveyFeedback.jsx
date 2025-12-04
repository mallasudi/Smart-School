// src/pages/ParentSurveyFeedback.jsx
import { useState } from "react";
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

const likertOptions = [
  { label: "Not Satisfied", value: 1 },
  { label: "Somewhat Satisfied", value: 2 },
  { label: "Satisfied", value: 3 },
  { label: "Very Satisfied", value: 4 },
];

export default function ParentSurveyFeedback() {
  const [form, setForm] = useState({
    qualityEducation: 3,
    extracurricular: 3,
    teachingMethods: 3,
    campusSafety: 3,
    homeworkLoad: "",
    teacherAttention: "",
    socialSupport: "",
    childSafety: "",
    extracurricularLevel: "",
    teachingEffective: "",
    suggestions: "",
    additionalFeedback: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const update = (name, value) =>
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You are not logged in. Please log in again.");
      return;
    }

    try {
      setSubmitting(true);

      await axios.post(`${API_BASE}/parent/feedback/survey`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSubmitting(false);
      setSuccess("Thank you! Your feedback has been recorded.");
    } catch (err) {
      console.error("Survey submit error:", err);
      setSubmitting(false);
      setError(
        err.response?.data?.message ||
          "Failed to submit feedback. Please try again."
      );
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Parent Satisfaction Survey
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Help us improve teaching, safety, and overall experience for your
          child.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <form
        onSubmit={submit}
        className="rounded-2xl bg-white/90 dark:bg-slate-800 p-6 shadow ring-1 ring-slate-100 dark:ring-slate-700 space-y-6"
      >
        {/* Likert table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2 px-2 text-slate-600 dark:text-slate-300">
                  Please rate us on the following metrics
                </th>
                {likertOptions.map((opt) => (
                  <th
                    key={opt.value}
                    className="text-center py-2 px-2 text-slate-500 dark:text-slate-400"
                  >
                    {opt.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {[
                ["qualityEducation", "Quality of Education"],
                ["extracurricular", "Extracurricular activities"],
                ["teachingMethods", "Teaching methods"],
                ["campusSafety", "Campus safety"],
              ].map(([key, label]) => (
                <tr key={key} className="bg-white dark:bg-slate-800">
                  <td className="py-2 px-2 text-slate-700 dark:text-slate-200">
                    {label}
                  </td>
                  {likertOptions.map((opt) => (
                    <td key={opt.value} className="text-center py-2 px-2">
                      <input
                        type="radio"
                        name={key}
                        value={opt.value}
                        checked={form[key] === opt.value}
                        onChange={() => update(key, opt.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Some key single-choice questions */}
        <div className="space-y-4 text-sm text-slate-700 dark:text-slate-200">
          <div>
            <p className="font-medium mb-1">
              1. How much homework does your child receive?
            </p>
            {["Too much", "Slightly too much", "About the right amount", "Too little"].map(
              (label) => (
                <label key={label} className="flex items-center gap-2 mb-0.5">
                  <input
                    type="radio"
                    name="homeworkLoad"
                    value={label}
                    checked={form.homeworkLoad === label}
                    onChange={(e) => update("homeworkLoad", e.target.value)}
                  />
                  {label}
                </label>
              )
            )}
          </div>

          <div>
            <p className="font-medium mb-1">
              2. How much attention does your child get from teachers?
            </p>
            {["A lot", "A moderate amount", "A little", "None"].map((label) => (
              <label key={label} className="flex items-center gap-2 mb-0.5">
                <input
                  type="radio"
                  name="teacherAttention"
                  value={label}
                  checked={form.teacherAttention === label}
                  onChange={(e) => update("teacherAttention", e.target.value)}
                />
                {label}
              </label>
            ))}
          </div>

          <div>
            <p className="font-medium mb-1">
              3. Do you feel your child is safe at school?
            </p>
            {["Extremely safe", "Very safe", "Moderately safe", "Not safe at all"].map(
              (label) => (
                <label key={label} className="flex items-center gap-2 mb-0.5">
                  <input
                    type="radio"
                    name="childSafety"
                    value={label}
                    checked={form.childSafety === label}
                    onChange={(e) => update("childSafety", e.target.value)}
                  />
                  {label}
                </label>
              )
            )}
          </div>

          <div>
            <p className="font-medium mb-1">
              4. Are the extracurricular activities we provide enough?
            </p>
            {["Too much", "Slightly too much", "About the right amount", "Too little"].map(
              (label) => (
                <label key={label} className="flex items-center gap-2 mb-0.5">
                  <input
                    type="radio"
                    name="extracurricularLevel"
                    value={label}
                    checked={form.extracurricularLevel === label}
                    onChange={(e) =>
                      update("extracurricularLevel", e.target.value)
                    }
                  />
                  {label}
                </label>
              )
            )}
          </div>

          <div>
            <p className="font-medium mb-1">
              5. Do you find the teaching methods effective?
            </p>
            {["Yes", "No"].map((label) => (
              <label key={label} className="flex items-center gap-2 mb-0.5">
                <input
                  type="radio"
                  name="teachingEffective"
                  value={label}
                  checked={form.teachingEffective === label}
                  onChange={(e) =>
                    update("teachingEffective", e.target.value)
                  }
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">
              6. How can teaching methods be improved? Please give some
              suggestions.
            </label>
            <textarea
              rows={4}
              className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-slate-700 dark:border-slate-600 text-sm"
              value={form.suggestions}
              onChange={(e) => update("suggestions", e.target.value)}
              placeholder="Type here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">
              7. Is there any other feedback you would like to provide?
            </label>
            <textarea
              rows={4}
              className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-slate-700 dark:border-slate-600 text-sm"
              value={form.additionalFeedback}
              onChange={(e) =>
                update("additionalFeedback", e.target.value)
              }
              placeholder="Type here..."
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className={`w-full md:w-auto px-6 py-2.5 rounded-lg text-white text-sm font-medium shadow
              ${
                submitting
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
