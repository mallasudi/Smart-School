// src/lib/api.js

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

const authHeader = () => {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export async function api(path, { method = "GET", body, auth = false } = {}) {
  const res = await fetch(`${API}/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(auth ? authHeader() : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let json = {};
  try {
    json = await res.json();
  } catch {}

  if (!res.ok) {
    const msg =
      json.message || json.error || "Request failed. Please try again.";
    throw new Error(msg);
  }

  return json;
}
