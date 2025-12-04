import { useEffect, useState } from "react";

export default function AdminFeedback() {
  const [tab, setTab] = useState("survey");
  const [surveyItems, setSurveyItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // ============================
  // FETCH SURVEY FEEDBACK
  // ============================
  const loadSurveyFeedback = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:4000/api/admin/feedback/surveys", {
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });

      const data = await res.json();
      setSurveyItems(data.items || []);
    } catch (err) {
      console.error("Survey fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSurveyFeedback();
  }, []);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => setTab("messages")}
          className={`px-4 py-2 rounded-lg ${tab==="messages" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Parent Messages
        </button>

        <button
          onClick={() => setTab("survey")}
          className={`px-4 py-2 rounded-lg ${tab==="survey" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Survey Feedback
        </button>
      </div>

      {/* Survey Feedback */}
      {tab === "survey" && (
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-semibold text-lg mb-4">Parent Survey Feedback</h2>

          {loading ? (
            <p>Loading...</p>
          ) : surveyItems.length === 0 ? (
            <p className="text-gray-500">No survey feedback submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {surveyItems.map((item) => (
                <div key={item.id} className="border rounded-xl p-4 bg-gray-50">
                  <p><strong>Parent ID:</strong> {item.parent_id}</p>

                  <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                    <p><strong>Quality of Education:</strong> {item.quality_education}</p>
                    <p><strong>Extracurricular:</strong> {item.extracurricular}</p>
                    <p><strong>Teaching Methods:</strong> {item.teaching_methods}</p>
                    <p><strong>Campus Safety:</strong> {item.campus_safety}</p>

                    <p><strong>Homework Load:</strong> {item.homework_load}</p>
                    <p><strong>Teacher Attention:</strong> {item.teacher_attention}</p>
                    <p><strong>Social Support:</strong> {item.social_support}</p>
                    <p><strong>Child Safety:</strong> {item.child_safety}</p>

                    <p><strong>Extracurricular Level:</strong> {item.extracurricular_level}</p>
                    <p><strong>Teaching Effective:</strong> {item.teaching_effective}</p>
                  </div>

                  {item.suggestions && (
                    <p className="mt-3"><strong>Suggestions:</strong> {item.suggestions}</p>
                  )}
                  {item.additional_feedback && (
                    <p className="mt-1"><strong>Additional Feedback:</strong> {item.additional_feedback}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
