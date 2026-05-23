import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ACCOUNTS = {
  attacker: { email: "attacker@demo.com", password: "attacker123" },
  victim: { email: "victim@demo.com", password: "victim123" },
  admin: { email: "admin@demo.com", password: "admin123" },
};

export default function Login() {
  const navigate = useNavigate();
  const { session, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) return;
    if (session.role === "attacker") navigate("/attacker");
    if (session.role === "victim") navigate("/victim");
    if (session.role === "admin") navigate("/admin");
  }, [session, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const session = await login(email, password);
      if (session.role === "attacker") navigate("/attacker");
      if (session.role === "victim") navigate("/victim");
      if (session.role === "admin") navigate("/admin");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role) => {
    const acc = ACCOUNTS[role];
    setEmail(acc.email);
    setPassword(acc.password);
  };

  return (
    <div className="min-h-screen bg-gmail-gray flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl text-gmail-muted font-semibold tracking-tight">
            Phishing Awareness Demo
          </h1>
          <p className="mt-2 text-sm text-gmail-muted">
            Log in as attacker, victim, or admin to run the full workflow.
          </p>
        </div>

        <div className="rounded-3xl border border-gmail-border bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-gmail-text mb-6">Sign in</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <label className="block text-sm text-gmail-muted">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-gmail-border px-4 py-3 text-sm outline-none focus:border-gmail-blue focus:ring-2 focus:ring-gmail-blue/20"
                placeholder="you@demo.com"
                required
              />
            </label>
            <label className="block text-sm text-gmail-muted">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-gmail-border px-4 py-3 text-sm outline-none focus:border-gmail-blue focus:ring-2 focus:ring-gmail-blue/20"
                placeholder="••••••••"
                required
              />
            </label>

            {error && (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gmail-blue px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 space-y-3 border-t border-gmail-border pt-6">
            <p className="text-center text-xs uppercase tracking-[0.2em] text-gmail-muted">
              Quick demo accounts
            </p>
            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => quickLogin("attacker")}
                className="w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                🔴 Login as Attacker
              </button>
              <button
                type="button"
                onClick={() => quickLogin("victim")}
                className="w-full rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100"
              >
                🟢 Login as Victim
              </button>
              <button
                type="button"
                onClick={() => quickLogin("admin")}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                🛡️ Login as Admin
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gmail-muted">
            attacker@demo.com / attacker123 · victim@demo.com / victim123 · admin@demo.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
