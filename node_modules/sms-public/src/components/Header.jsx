import { useNavigate, Link } from "react-router-dom";
export default function Header() {
  const nav = useNavigate();
  const me = localStorage.getItem("me") ? JSON.parse(localStorage.getItem("me")) : null;
  const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("me"); nav("/login"); };
  return (
    <div className="flex items-center justify-between p-3 border-b">
      <Link to="/" className="font-semibold">Smart School</Link>
      <div className="flex items-center gap-3">
        {me && <span className="text-sm opacity-80">{me.username} • {me.role}</span>}
        {me ? <button onClick={logout} className="px-3 py-1 border rounded">Logout</button>
            : <Link to="/login" className="px-3 py-1 border rounded">Login</Link>}
      </div>
    </div>
  );
}
