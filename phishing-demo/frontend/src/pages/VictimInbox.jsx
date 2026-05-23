import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../api";
import Navbar from "../components/Navbar";
import EmailCard from "../components/EmailCard";
import PhishingWarning from "../components/PhishingWarning";
import ReportForm from "../components/ReportForm";
import Toast from "../components/Toast";

export default function VictimInbox() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("inbox");
  const [emails, setEmails] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  const unreadCount = useMemo(
    () => emails.filter((email) => !email.read).length,
    [emails]
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const inbox = await api.getInbox(session.email);
      setEmails(inbox.received || []);
      const reportResponse = await api.getReports();
      setReports((reportResponse.reports || []).filter((report) => report.victim_email === session.email));
      if (inbox.received && inbox.received.length > 0 && !selectedEmail) {
        setSelectedEmail(inbox.received[0]);
      }
    } catch (err) {
      setError(err.message || "Unable to load inbox data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSelectEmail = async (email) => {
    setSelectedEmail(email);
    setScanResult(null);
    setShowWarning(false);
    setError("");
    if (!email.read) {
      try {
        await api.markEmailRead(email.id);
        setEmails((prev) => prev.map((item) => (item.id === email.id ? { ...item, read: true } : item)));
      } catch {
        // ignore
      }
    }
  };

  const handleScan = async ({ openWebsite } = {}) => {
    if (!selectedEmail || !selectedEmail.link) return;
    setScanning(true);
    setError("");
    setScanResult(null);
    setShowWarning(false);
    try {
      const result = await api.scanUrl(selectedEmail.link, selectedEmail.id);
      setScanResult(result);
      if (result.prediction === "PHISHING" && openWebsite) {
        setShowWarning(true);
      }
    } catch (err) {
      setError(err.message || "Unable to scan URL");
    } finally {
      setScanning(false);
    }
  };

  const handleReportSubmit = async ({ reason, description }) => {
    if (!selectedEmail) return;
    await api.submitReport({
      email_id: selectedEmail.id,
      url: selectedEmail.link,
      victim_email: session.email,
      reason,
      description,
    });
    setToast("Report submitted to admin!");
    setReportOpen(false);
    await loadData();
  };

  return (
    <div className="min-h-screen bg-gmail-gray">
      <Navbar session={session} unreadCount={unreadCount} onLogout={handleLogout} />

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 xl:px-8 xl:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl bg-white p-5 shadow-sm border border-gmail-border">
          <div className="mb-6 space-y-3">
            <button
              type="button"
              onClick={() => setTab("inbox")}
              className={`w-full rounded-3xl px-4 py-3 text-left text-sm font-semibold transition ${
                tab === "inbox"
                  ? "bg-gmail-blue text-white"
                  : "bg-slate-50 text-gmail-text hover:bg-slate-100"
              }`}
            >
              📥 Inbox {unreadCount > 0 && <span className="ml-2 text-xs text-white/90">{unreadCount}</span>}
            </button>
            <button
              type="button"
              onClick={() => setTab("reports")}
              className={`w-full rounded-3xl px-4 py-3 text-left text-sm font-semibold transition ${
                tab === "reports"
                  ? "bg-gmail-blue text-white"
                  : "bg-slate-50 text-gmail-text hover:bg-slate-100"
              }`}
            >
              🏳️ Reports
            </button>
          </div>
          <div className="rounded-3xl border border-gmail-border bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold">Victim dashboard</p>
            <p className="mt-2 text-slate-500">
              Review suspicious messages, scan the URL, and report malicious sites for admin attention.
            </p>
          </div>
        </aside>

        <section className="space-y-6">
          {tab === "inbox" ? (
            <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
              <div className="rounded-3xl border border-gmail-border bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-gmail-muted">Inbox</p>
                    <h2 className="text-2xl font-semibold text-gmail-text">Recent messages</h2>
                  </div>
                  <span className="text-xs text-slate-500">{emails.length} messages</span>
                </div>
                <div className="space-y-2">
                  {loading ? (
                    <p className="text-sm text-gmail-muted">Loading inbox...</p>
                  ) : emails.length === 0 ? (
                    <p className="text-sm text-slate-500">Your inbox is empty.</p>
                  ) : (
                    emails.map((email) => (
                      <EmailCard
                        key={email.id}
                        email={email}
                        selected={selectedEmail?.id === email.id}
                        onClick={() => handleSelectEmail(email)}
                      />
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-gmail-border bg-white p-6 shadow-sm">
                {!selectedEmail ? (
                  <div className="flex min-h-[320px] items-center justify-center text-slate-500">
                    Select an email to review.
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm text-slate-500">From {selectedEmail.from}</p>
                        <h2 className="text-2xl font-semibold text-gmail-text">{selectedEmail.subject}</h2>
                        <p className="text-xs text-slate-400">{selectedEmail.timestamp}</p>
                      </div>
                      {selectedEmail.reported && (
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                          🚩 Reported
                        </span>
                      )}
                    </div>
                    <pre className="whitespace-pre-wrap rounded-3xl border border-gmail-border bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                      {selectedEmail.body}
                    </pre>
                    {selectedEmail.link && (
                      <div className="mt-4 rounded-3xl border border-gmail-border bg-white p-4 text-sm text-slate-700">
                        <p className="text-xs uppercase tracking-[0.18em] text-gmail-muted">Link</p>
                        <p className="mt-2 break-words font-mono text-red-600">{selectedEmail.link}</p>
                      </div>
                    )}
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => handleScan({ openWebsite: true })}
                        disabled={scanning}
                        className="rounded-3xl bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-red-700 disabled:opacity-70"
                      >
                        {scanning ? "Scanning..." : "🌐 Open Website"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleScan({ openWebsite: false })}
                        disabled={scanning}
                        className="rounded-3xl border border-gmail-border bg-white px-6 py-3 text-sm font-semibold text-gmail-text hover:bg-slate-50 disabled:opacity-70"
                      >
                        🔍 Scan Link Only
                      </button>
                    </div>
                    {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
                    {scanResult && !showWarning && (
                      <div className={`mt-6 rounded-3xl border p-5 ${
                        scanResult.prediction === "PHISHING"
                          ? "border-red-300 bg-red-50"
                          : "border-green-300 bg-green-50"
                      }`}>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{scanResult.prediction === "PHISHING" ? "🚨" : "✅"}</span>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              {scanResult.prediction === "PHISHING"
                                ? "Phishing detected"
                                : "This site appears safe"}
                            </h3>
                            <p className="text-sm text-slate-600">
                              Confidence: {(scanResult.confidence * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        {scanResult.prediction === "LEGITIMATE" && (
                          <div className="mt-4 rounded-3xl bg-white p-4 text-sm text-slate-700">
                            <p className="font-semibold">URL verified</p>
                            <p className="mt-2 break-words text-red-600">{scanResult.url}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {showWarning && scanResult && (
                      <PhishingWarning
                        url={scanResult.url}
                        result={scanResult}
                        onReport={() => setReportOpen(true)}
                        onClose={() => setShowWarning(false)}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-gmail-border bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-gmail-muted">Submitted reports</p>
                  <h2 className="text-2xl font-semibold text-gmail-text">Your report history</h2>
                </div>
                <span className="text-xs text-slate-500">{reports.length} reports</span>
              </div>

              {reports.length === 0 ? (
                <p className="rounded-3xl border border-dashed border-gmail-border bg-slate-50 p-8 text-center text-sm text-slate-500">
                  No phishing reports yet. Scan a dangerous URL to report it.
                </p>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="rounded-3xl border border-gmail-border bg-slate-50 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gmail-text">{report.reason}</p>
                          <p className="text-xs text-slate-500">{report.created_at}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          report.resolved ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">{report.description}</p>
                      <div className="mt-4 rounded-3xl bg-white p-4 text-sm text-slate-700">
                        <p className="font-medium">URL</p>
                        <p className="mt-1 break-words text-red-600">{report.url}</p>
                      </div>
                      {report.resolved && report.admin_note && (
                        <div className="mt-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                          <p className="font-semibold">Admin response</p>
                          <p className="mt-2">{report.admin_note}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <ReportForm
        isOpen={reportOpen}
        url={selectedEmail?.link || ""}
        from={selectedEmail?.from || ""}
        onClose={() => setReportOpen(false)}
        onSubmit={handleReportSubmit}
      />

      <Toast
        message={toast}
        type="success"
        onClose={() => setToast("")}
      />
    </div>
  );
}
