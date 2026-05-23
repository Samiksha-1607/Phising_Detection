import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../api";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";

const INITIAL_MESSAGE = {
  from: "attacker@demo.com",
  to: "victim@demo.com",
  subject: "⚠️ Urgent: Verify Your PayPal Account Now",
  body:
    "Dear Customer,\n\n" +
    "We noticed unusual sign-in activity on your PayPal account.\n" +
    "Your account access has been temporarily restricted.\n\n" +
    "Please verify your identity immediately by clicking the link below:\n\n" +
    "👉 http://paypa1-secure-login.tk/verify?user=victim&token=abc123\n\n" +
    "If you do not verify within 24 hours, your account will be permanently suspended.\n\n" +
    "Regards,\nPayPal Security Team",
  link: "http://paypa1-secure-login.tk/verify?user=victim&token=abc123",
};

export default function AttackerInbox() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("compose");
  const [sentEmails, setSentEmails] = useState([]);
  const [form, setForm] = useState(INITIAL_MESSAGE);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  const loadInbox = async () => {
    setLoading(true);
    try {
      const data = await api.getInbox(session.email);
      setSentEmails(data.sent || []);
    } catch (err) {
      setError(err.message || "Failed to load sent email list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInbox();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      await api.sendEmail(form);
      setToast("Email sent to victim!");
      setTab("sent");
      await loadInbox();
      setForm((prev) => ({ ...prev, subject: prev.subject, body: prev.body }));
    } catch (err) {
      setError(err.message || "Unable to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gmail-gray">
      <Navbar session={session} onLogout={handleLogout} />

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 xl:px-8">
        <aside className="hidden w-72 shrink-0 rounded-3xl bg-white p-5 shadow-sm xl:block">
          <div className="mb-6 space-y-2">
            <button
              type="button"
              onClick={() => setTab("compose")}
              className={`w-full rounded-3xl px-4 py-3 text-left text-sm font-semibold transition ${
                tab === "compose"
                  ? "bg-gmail-blue text-white"
                  : "bg-slate-50 text-gmail-text hover:bg-slate-100"
              }`}
            >
              ✏️ Compose
            </button>
            <button
              type="button"
              onClick={() => setTab("sent")}
              className={`w-full rounded-3xl px-4 py-3 text-left text-sm font-semibold transition ${
                tab === "sent"
                  ? "bg-gmail-blue text-white"
                  : "bg-slate-50 text-gmail-text hover:bg-slate-100"
              }`}
            >
              📤 Sent
            </button>
          </div>
          <div className="rounded-3xl border border-gmail-border bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold">Attacker tools</p>
            <p className="mt-2 text-slate-500">
              Compose and send phishing messages to the victim inbox. All data is in-memory for the demo.
            </p>
          </div>
        </aside>

        <main className="flex-1">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-gmail-border">
            {tab === "compose" ? (
              <>
                <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-gmail-muted">Compose Phishing Email</p>
                    <h1 className="text-2xl font-semibold text-gmail-text">Send to Victim</h1>
                  </div>
                  <p className="text-sm text-slate-500">Default recipient is victim@demo.com.</p>
                </div>

                <form className="space-y-4" onSubmit={handleSend}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm text-gmail-muted">
                      To
                      <input
                        type="email"
                        value={form.to}
                        onChange={handleChange("to")}
                        className="mt-2 w-full rounded-2xl border border-gmail-border px-4 py-3 text-sm outline-none focus:border-gmail-blue focus:ring-2 focus:ring-gmail-blue/20"
                        required
                      />
                    </label>
                    <label className="block text-sm text-gmail-muted">
                      Subject
                      <input
                        type="text"
                        value={form.subject}
                        onChange={handleChange("subject")}
                        className="mt-2 w-full rounded-2xl border border-gmail-border px-4 py-3 text-sm outline-none focus:border-gmail-blue focus:ring-2 focus:ring-gmail-blue/20"
                        required
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm text-gmail-muted">Phishing Link</label>
                    <input
                      type="url"
                      value={form.link}
                      onChange={handleChange("link")}
                      className="mt-2 w-full rounded-3xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-mono text-red-700 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200"
                      placeholder="http://malicious.example/verify"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gmail-muted">Body</label>
                    <textarea
                      rows={10}
                      value={form.body}
                      onChange={handleChange("body")}
                      className="mt-2 w-full rounded-3xl border border-gmail-border px-4 py-3 text-sm font-sans outline-none focus:border-gmail-blue focus:ring-2 focus:ring-gmail-blue/20"
                      required
                    />
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex items-center justify-center rounded-3xl bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-red-700 disabled:opacity-70 transition"
                  >
                    {sending ? "Sending..." : "📤 Send Phishing Email"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-gmail-muted">Sent mail</p>
                    <h1 className="text-2xl font-semibold text-gmail-text">Sent Phishing Emails</h1>
                  </div>
                  <p className="text-sm text-slate-500">Showing your outgoing messages.</p>
                </div>

                {loading ? (
                  <p className="text-sm text-gmail-muted">Loading sent emails...</p>
                ) : sentEmails.length === 0 ? (
                  <p className="rounded-3xl border border-dashed border-gmail-border bg-slate-50 p-8 text-center text-sm text-slate-500">
                    No sent emails yet. Compose a phishing scenario to begin.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {sentEmails.map((email) => (
                      <div key={email.id} className="rounded-3xl border border-gmail-border bg-slate-50 p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gmail-text">{email.subject}</p>
                            <p className="text-xs text-gmail-muted">to {email.to} • {email.timestamp}</p>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                            {email.read ? "Read" : "Unread"}
                          </span>
                        </div>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{email.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <Toast
        message={toast}
        type="success"
        onClose={() => setToast("")}
      />
    </div>
  );
}
