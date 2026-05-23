import { useState } from "react";

const REASONS = [
  "Credential Theft",
  "Fake Login Page",
  "Prize Scam",
  "Malware",
  "Other",
];

export default function ReportForm({ isOpen, url, from, onClose, onSubmit }) {
  const [reason, setReason] = useState(REASONS[0]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await onSubmit({ reason, description });
      setSuccess("Report submitted to admin!");
      setDescription("");
    } catch (err) {
      setError(err.message || "Unable to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gmail-text">Report This Website</h3>
            <p className="text-sm text-gmail-muted">Send the suspected phishing URL to the security admin.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gmail-border px-3 py-2 text-sm text-gmail-muted hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <div className="space-y-3 rounded-3xl border border-gmail-border bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-gmail-muted">Reported URL</p>
          <p className="break-words text-sm font-mono text-slate-900">{url}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-gmail-muted">Sender</p>
          <p className="text-sm text-slate-700">{from}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gmail-muted">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-gmail-border bg-white px-4 py-3 text-sm outline-none focus:border-gmail-blue focus:ring-2 focus:ring-gmail-blue/20"
            >
              {REASONS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gmail-muted">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="mt-2 w-full rounded-3xl border border-gmail-border px-4 py-3 text-sm outline-none focus:border-gmail-blue focus:ring-2 focus:ring-gmail-blue/20"
              placeholder="Write a short note for the admin..."
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-700">{success}</p>}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              type="submit"
              disabled={loading}
              className="rounded-3xl bg-gmail-blue px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
            >
              {loading ? "Submitting..." : "📨 Submit Report to Admin"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-3xl border border-gmail-border bg-white px-6 py-3 text-sm font-semibold text-gmail-muted hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
