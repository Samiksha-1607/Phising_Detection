import { useNavigate } from "react-router-dom";

export default function Navbar({ session, unreadCount = 0, pendingReports = 0, onLogout }) {
  const navigate = useNavigate();
  const initial = session?.email?.[0]?.toUpperCase() || "?";

  const roleConfig = {
    attacker: { label: "ATTACKER", icon: "🔴", color: "bg-red-100 text-red-700" },
    victim: { label: "VICTIM", icon: "🟢", color: "bg-emerald-100 text-emerald-700" },
    admin: { label: "ADMIN", icon: "🛡️", color: "bg-slate-100 text-slate-800" },
  };
  const roleBadge = roleConfig[session?.role] || roleConfig.victim;

  return (
    <header className="flex items-center justify-between border-b border-gmail-border bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-gmail-muted">Security Awareness Demo</p>
          <h1 className="text-lg font-semibold text-gmail-text">Phishing Detection Portal</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${roleBadge.color}`}>
          <span>{roleBadge.icon}</span>
          <span>{roleBadge.label}</span>
        </div>
        {session?.role === "victim" && unreadCount > 0 && (
          <div className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-2 text-sm font-medium text-red-700">
            🔔 {unreadCount} unread
          </div>
        )}
        {session?.role === "admin" && pendingReports > 0 && (
          <div className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-2 text-sm font-medium text-yellow-800">
            🔔 {pendingReports} pending
          </div>
        )}
        <div className="flex items-center gap-2 rounded-full border border-gmail-border bg-gray-50 px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gmail-blue text-white font-semibold">
            {initial}
          </div>
          <div className="text-sm text-gmail-muted">{session?.email}</div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-full border border-gmail-border bg-white px-4 py-2 text-sm text-gmail-muted transition hover:border-gmail-text hover:text-gmail-text"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
