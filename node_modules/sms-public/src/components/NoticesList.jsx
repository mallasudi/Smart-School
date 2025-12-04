import { useEffect, useState } from "react";
import api from "../utils/api";

export default function NoticesList({ role }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/${role}/notices`)
      .then((res) => setNotices(res.data.notices || []))
      .catch(() => setNotices([]))
      .finally(() => setLoading(false));
  }, [role]);

  if (loading) return <p className="text-gray-500">Loading notices...</p>;

  if (notices.length === 0)
    return <p className="text-gray-500">No notices available.</p>;

  return (
    <ul className="divide-y">
      {notices.map((n, i) => (
        <li key={i} className="py-3 flex justify-between items-center">
          <span className="font-medium">{n.title}</span>
          <span className="text-sm text-gray-500">
            {new Date(n.created_at).toLocaleDateString()}
          </span>
        </li>
      ))}
    </ul>
  );
}
