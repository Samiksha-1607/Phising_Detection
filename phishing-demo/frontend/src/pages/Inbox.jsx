import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import Navbar from "../components/Navbar";
import EmailCard from "../components/EmailCard";
import ScanResult from "../components/ScanResult";

export default function Inbox() {
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem("session") || "{}");
  const isVictim = session.user === "victim";
  const isAttacker = session.user === "attacker";

  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [selected, setSelected] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadInbox = useCallback(async () => {
    try {
      const data = await api.getInbox(session.email);
      setReceived(data.received || []);
      setSent(data.sent || []);
    } catch {
      setReceived([]);
      setSent([]);
    } finally {
      setLoading(false);
    }
  }, [session.email]);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  const handleLogout = () => {
    localStorage.removeItem("session");
    navigate("/");
  };

  const handleScan = async () => {
    if (!selected) return;
    setScanError("");
    setScanning(true);
    setScanResult(null);
    try {
      const result = await api.scanEmail(selected.id);
      setScanResult(result);
      setSelected((prev) => (prev ? { ...prev, scanned: true } : prev));
      loadInbox();
    } catch (err) {
      setScanError(err.message || "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  const emailList = isVictim ? received : sent;
  const listLabel = isVictim ? "Inbox" : "Sent";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar session={session} onLogout={handleLogout} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 bg-gmail-gray border-r border-gmail-border p-3 hidden md:block">
          {isAttacker && (
            <button
              type="button"
              onClick={() => navigate("/compose")}
              className="w-full rounded-2xl bg-gmail-blue text-white py-3 px-4 font-medium shadow hover:shadow-md hover:bg-blue-700 transition mb-4"
            >
              ✏️ Compose
            </button>
          )}
          <nav className="space-y-1">
            <button
              type="button"
              className="w-full flex items-center gap-3 rounded-r-full bg-red-100 text-gmail-red px-4 py-2 font-medium text-sm"
            >
              <span>📥</span> {listLabel}
              <span className="ml-auto text-xs bg-gmail-red text-white rounded-full px-2 py-0.5">
                {emailList.length}
              </span>
            </button>
            {isAttacker && (
              <button
                type="button"
                onClick={() => navigate("/compose")}
                className="w-full flex items-center gap-3 rounded-r-full hover:bg-gray-200 px-4 py-2 text-sm text-gmail-muted"
              >
                <span>✉️</span> Send Phishing Demo
              </button>
            )}
          </nav>
          <div className="mt-8 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-xs text-yellow-800">
            <strong>Educational demo only.</strong> No real emails are sent.
          </div>
        </aside>

        {/* Email list */}
        <section className="w-full md:w-80 lg:w-96 border-r border-gmail-border flex flex-col bg-white shrink-0">
          <div className="px-4 py-3 border-b border-gmail-border flex items-center justify-between">
            <h2 className="font-medium text-gmail-text">{listLabel}</h2>
            <span className="text-xs text-gmail-muted">{session.email}</span>
          </div>
          {loading ? (
            <p className="p-4 text-sm text-gmail-muted">Loading...</p>
          ) : emailList.length === 0 ? (
            <p className="p-4 text-sm text-gmail-muted">No emails yet.</p>
          ) : (
            <div className="overflow-y-auto flex-1">
              {emailList.map((email) => (
                <EmailCard
                  key={email.id}
                  email={email}
                  selected={selected?.id === email.id}
                  onClick={() => {
                    setSelected(email);
                    setScanResult(null);
                    setScanError("");
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* Email detail */}
        <main className="flex-1 overflow-y-auto bg-white p-6 min-w-0">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full text-gmail-muted">
              <span className="text-6xl mb-4">📧</span>
              <p>Select an email to read</p>
            </div>
          ) : (
            <>
              <div className="border-b border-gmail-border pb-4 mb-4">
                <h1 className="text-2xl font-normal text-gmail-text">
                  {selected.subject}
                </h1>
                <div className="flex items-center gap-3 mt-3">
                  <div className="h-10 w-10 rounded-full bg-gmail-red text-white flex items-center justify-center font-medium">
                    {selected.from[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{selected.from}</p>
                    <p className="text-xs text-gmail-muted">
                      to {selected.to} · {selected.timestamp}
                    </p>
                  </div>
                </div>
              </div>

              <pre className="whitespace-pre-wrap font-sans text-sm text-gmail-text leading-relaxed">
                {selected.body}
              </pre>

              {selected.link && (
                <p className="mt-4 text-sm">
                  <span className="text-gmail-muted">Link: </span>
                  <span className="font-mono text-red-600 break-all">{selected.link}</span>
                </p>
              )}

              {isVictim && (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleScan}
                    disabled={scanning}
                    className="rounded-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 font-medium shadow-md transition disabled:opacity-60"
                  >
                    {scanning ? "Scanning..." : "🔍 Scan This Email for Phishing"}
                  </button>
                  {scanError && (
                    <p className="mt-2 text-sm text-red-600">{scanError}</p>
                  )}
                  {scanResult && (
                    <ScanResult
                      result={scanResult}
                      onClose={() => setScanResult(null)}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
