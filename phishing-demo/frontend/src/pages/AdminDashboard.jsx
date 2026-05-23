import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../api";
import Navbar from "../components/Navbar";
import StatsCharts from "../components/StatsCharts";
import Toast from "../components/Toast";

const ACTION_OPTIONS = [
  "URL Blacklisted",
  "Domain Reported to Registrar",
  "User Warned",
  "Law Enforcement Notified",
];

export default function AdminDashboard() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalReport, setModalReport] = useState(null);
  const [actionTaken, setActionTaken] = useState(ACTION_OPTIONS[0]);
  const [adminNote, setAdminNote] = useState("We have reviewed your report and taken appropriate action.");
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pendingReports = useMemo(
    () => reports.filter((report) => !report.resolved).length,
    [reports]
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.getStats();
      const reportsRes = await api.getReports();
      setStats(statsRes);
      setReports(reportsRes.reports || []);
    } catch (err) {
      setError(err.message || "Unable to load admin data");
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

  const openModal = (report) => {
    setModalReport(report);
    setActionTaken(ACTION_OPTIONS[0]);
    setAdminNote(`We have reviewed your phishing report and taken action on the URL: ${report.url}`);
  };

  const resolveReport = async (reportId, action) => {
    setSubmitting(true);
    setError("");
    try {
      await api.actionReport(reportId, {
        action_taken: action,
        admin_note: adminNote,
      });
      setToast("Report resolved and victim notified.");
      setModalReport(null);
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to resolve report");
    } finally {
      setSubmitting(false);
    }
  };

  const dismissReport = async (report) => {
    setSubmitting(true);
    setError("");
    try {
      await api.actionReport(report.id, {
        action_taken: "Report Dismissed",
        admin_note: "This report has been reviewed and dismissed as non-actionable.",
      });
      setToast("Report dismissed.");
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to dismiss report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gmail-gray">
      <Navbar session={session} pendingReports={pendingReports} onLogout={handleLogout} />

      <main className="mx-auto max-w-7xl px-4 py-6 xl:px-8">
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm border border-gmail-border">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-gmail-muted">Admin dashboard</p>
              <h1 className="text-3xl font-semibold text-gmail-text">Phishing Reports & Security Stats</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-3xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                Threat Level: <span className="font-bold">{stats?.threat_level || "LOW"}</span>
              </div>
              <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                Pending Reports: <span className="font-semibold">{pendingReports}</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-gmail-border bg-white p-8 text-center text-slate-500 shadow-sm">
            Loading admin metrics...
          </div>
        ) : (
          <>
            <div className="grid gap-6 xl:grid-cols-4">
              <div className="rounded-3xl border border-gmail-border bg-white p-5 shadow-sm">
                <p className="text-sm uppercase tracking-[0.24em] text-gmail-muted">Total URLs Scanned</p>
                <p className="mt-4 text-3xl font-semibold text-gmail-text">{stats.total_scanned}</p>
              </div>
              <div className="rounded-3xl border border-gmail-border bg-white p-5 shadow-sm">
                <p className="text-sm uppercase tracking-[0.24em] text-gmail-muted">Phishing Detected</p>
                <p className="mt-4 text-3xl font-semibold text-red-600">{stats.total_phishing}</p>
              </div>
              <div className="rounded-3xl border border-gmail-border bg-white p-5 shadow-sm">
                <p className="text-sm uppercase tracking-[0.24em] text-gmail-muted">Legitimate URLs</p>
                <p className="mt-4 text-3xl font-semibold text-emerald-600">{stats.total_legitimate}</p>
              </div>
              <div className="rounded-3xl border border-gmail-border bg-white p-5 shadow-sm">
                <p className="text-sm uppercase tracking-[0.24em] text-gmail-muted">Reports Pending</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900">{pendingReports}</p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-gmail-border bg-white p-6 shadow-sm">
              <StatsCharts
                scans_by_day={stats.scans_by_day}
                top_features={stats.top_features_flagged.slice(0, 10)}
                phishing_count={stats.total_phishing}
                legitimate_count={stats.total_legitimate}
              />
            </div>

            <div className="mt-6 rounded-3xl border border-gmail-border bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-gmail-muted">Reports table</p>
                  <h2 className="text-2xl font-semibold text-gmail-text">Recent phishing reports</h2>
                </div>
                <p className="text-sm text-slate-500">Review and resolve flagged URLs.</p>
              </div>

              {reports.length === 0 ? (
                <p className="rounded-3xl border border-dashed border-gmail-border bg-slate-50 p-8 text-center text-slate-500">
                  No reports have been submitted yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-3 text-left">
                    <thead>
                      <tr className="text-sm text-slate-500">
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Victim</th>
                        <th className="px-4 py-3">URL</th>
                        <th className="px-4 py-3">Reason</th>
                        <th className="px-4 py-3">Timestamp</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) => (
                        <tr key={report.id} className="rounded-3xl bg-slate-50 text-sm shadow-sm">
                          <td className="px-4 py-4 align-top">{report.id}</td>
                          <td className="px-4 py-4 align-top">{report.victim_email}</td>
                          <td className="px-4 py-4 align-top break-words text-red-600">{report.url}</td>
                          <td className="px-4 py-4 align-top">{report.reason}</td>
                          <td className="px-4 py-4 align-top">{report.created_at}</td>
                          <td className="px-4 py-4 align-top">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${report.resolved ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-800"}`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 align-top space-y-2">
                            {!report.resolved ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openModal(report)}
                                  className="w-full rounded-2xl bg-gmail-blue px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
                                >
                                  ✅ Resolve & Notify Victim
                                </button>
                                <button
                                  type="button"
                                  onClick={() => dismissReport(report)}
                                  disabled={submitting}
                                  className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                                >
                                  🗑️ Dismiss
                                </button>
                              </>
                            ) : (
                              <p className="text-xs text-slate-500">Resolved</p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {modalReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gmail-text">Resolve Report #{modalReport.id}</h2>
                <p className="text-sm text-slate-500">Send a confirmation message back to the victim.</p>
              </div>
              <button
                type="button"
                onClick={() => setModalReport(null)}
                className="rounded-full border border-gmail-border px-3 py-2 text-sm text-slate-500 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-gmail-border bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Reported URL</p>
                <p className="mt-2 break-words text-sm text-red-600">{modalReport.url}</p>
              </div>
              <div className="rounded-3xl border border-gmail-border bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Victim</p>
                <p className="mt-2 text-sm text-slate-700">{modalReport.victim_email}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block text-sm text-gmail-muted">
                Action Taken
                <select
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-gmail-border bg-white px-4 py-3 text-sm outline-none focus:border-gmail-blue focus:ring-2 focus:ring-gmail-blue/20"
                >
                  {ACTION_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label className="block text-sm text-gmail-muted">
                Admin Note to Victim
                <textarea
                  rows={5}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-gmail-border px-4 py-3 text-sm outline-none focus:border-gmail-blue focus:ring-2 focus:ring-gmail-blue/20"
                />
              </label>
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setModalReport(null)}
                className="rounded-3xl border border-gmail-border bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => resolveReport(modalReport.id, actionTaken)}
                disabled={submitting}
                className="rounded-3xl bg-gmail-blue px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70 transition"
              >
                {submitting ? "Sending response..." : "Send Response & Mark Resolved"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast} type="success" onClose={() => setToast("")} />
    </div>
  );
}
