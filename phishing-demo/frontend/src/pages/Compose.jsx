import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import Navbar from "../components/Navbar";

const PHISHING_TEMPLATE = {
  from: "attacker@demo.com",
  to: "victim@demo.com",
  subject: "⚠️ Urgent: Verify Your PayPal Account Now",
  body: `Dear Customer,

We noticed unusual sign-in activity on your PayPal account.
Your account access has been temporarily restricted.

Please verify your identity immediately by clicking the link below:

👉 http://paypa1-secure-login.tk/verify?user=victim&token=abc123

If you do not verify within 24 hours, your account will be permanently suspended.

Regards,
PayPal Security Team`,
  link: "http://paypa1-secure-login.tk/verify?user=victim&token=abc123",
};

export default function Compose() {
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem("session") || "{}");

  const [form, setForm] = useState({ ...PHISHING_TEMPLATE });
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (session.user !== "attacker") {
    navigate("/inbox");
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("session");
    navigate("/");
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setMessage("");
    setError("");
    try {
      await api.sendEmail({
        from: form.from,
        to: form.to,
        subject: form.subject,
        body: form.body,
        link: form.link,
      });
      setMessage("Phishing demo email sent to victim@demo.com!");
      setTimeout(() => navigate("/inbox"), 1500);
    } catch (err) {
      setError(err.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gmail-gray flex flex-col">
      <Navbar session={session} onLogout={handleLogout} />

      <div className="flex-1 p-6 max-w-3xl mx-auto w-full">
        <div className="bg-white rounded-xl shadow-lg border border-gmail-border overflow-hidden">
          <div className="bg-gmail-red/10 border-b border-gmail-border px-6 py-4">
            <h2 className="text-lg font-medium text-gmail-text">New Message</h2>
            <p className="text-xs text-gmail-muted mt-1">
              Pre-filled phishing template — educational demo only
            </p>
          </div>

          <form onSubmit={handleSend} className="p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-gmail-border pb-2">
              <label className="text-sm text-gmail-muted w-12">From</label>
              <input
                type="text"
                value={form.from}
                onChange={handleChange("from")}
                className="flex-1 text-sm outline-none"
                readOnly
              />
            </div>
            <div className="flex items-center gap-2 border-b border-gmail-border pb-2">
              <label className="text-sm text-gmail-muted w-12">To</label>
              <input
                type="text"
                value={form.to}
                onChange={handleChange("to")}
                className="flex-1 text-sm outline-none"
              />
            </div>
            <div className="flex items-center gap-2 border-b border-gmail-border pb-2">
              <label className="text-sm text-gmail-muted w-12">Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={handleChange("subject")}
                className="flex-1 text-sm outline-none font-medium"
              />
            </div>
            <div>
              <label className="text-sm text-gmail-muted block mb-1">Malicious link (for ML scan)</label>
              <input
                type="url"
                value={form.link}
                onChange={handleChange("link")}
                className="w-full border border-gmail-border rounded px-3 py-2 text-sm font-mono"
              />
            </div>
            <textarea
              value={form.body}
              onChange={handleChange("body")}
              rows={12}
              className="w-full text-sm outline-none resize-none leading-relaxed"
            />

            {message && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
                {message}
              </p>
            )}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={sending}
                className="rounded bg-gmail-blue text-white px-6 py-2 font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {sending ? "Sending..." : "Send"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/inbox")}
                className="rounded border border-gmail-border px-6 py-2 text-sm text-gmail-muted hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
