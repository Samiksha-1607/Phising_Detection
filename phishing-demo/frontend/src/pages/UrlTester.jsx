import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

const SAMPLE_URLS = `http://paypa1-secure-login.tk/verify?user=victim&token=abc123
https://www.paypal.com/signin
http://secure-bank-update.tk/verify
https://www.google.com
http://192.168.1.1/login
https://github.com/login`;

export default function UrlTester() {
  const [text, setText] = useState(SAMPLE_URLS);
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handlePredict = async () => {
    setApiError("");
    setLoading(true);
    setResults([]);
    setErrors([]);
    try {
      const urls = text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const data = await api.predictUrls(urls);
      setResults(data.results || []);
      setErrors(data.errors || []);
    } catch (err) {
      setApiError(err.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gmail-gray">
      <header className="bg-white border-b border-gmail-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-gmail-text">URL Prediction Tester</h1>
          <p className="text-sm text-gmail-muted mt-0.5">
            Paste multiple URLs (one per line) to check model predictions
          </p>
        </div>
        <Link
          to="/"
          className="text-sm text-gmail-blue hover:underline"
        >
          ← Back to Gmail Demo
        </Link>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg border border-gmail-border shadow-sm p-6">
          <label className="block text-sm font-medium text-gmail-text mb-2">
            URLs (one per line)
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            className="w-full border border-gmail-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gmail-blue"
            placeholder="https://example.com&#10;http://suspicious-site.tk/login"
          />
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              type="button"
              onClick={handlePredict}
              disabled={loading}
              className="rounded-full bg-gmail-blue text-white px-6 py-2.5 font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Running..." : "Run predictions"}
            </button>
            <button
              type="button"
              onClick={() => setText(SAMPLE_URLS)}
              className="rounded-full border border-gmail-border px-5 py-2.5 text-sm text-gmail-muted hover:bg-gray-50"
            >
              Load sample URLs
            </button>
            <button
              type="button"
              onClick={() => {
                setText("");
                setResults([]);
                setErrors([]);
                setApiError("");
              }}
              className="rounded-full border border-gmail-border px-5 py-2.5 text-sm text-gmail-muted hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
          {apiError && (
            <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {apiError}
            </p>
          )}
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-lg border border-gmail-border shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gmail-border bg-gmail-gray">
              <h2 className="font-medium text-sm">
                Results ({results.length} URL{results.length !== 1 ? "s" : ""})
              </h2>
              <p className="text-xs text-gmail-muted mt-0.5">
                Model output: -1 = phishing, 1 = legitimate
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gmail-border">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium w-8">#</th>
                    <th className="text-left px-4 py-2 font-medium">URL</th>
                    <th className="text-left px-4 py-2 font-medium w-32">Prediction</th>
                    <th className="text-left px-4 py-2 font-medium w-24">Confidence</th>
                    <th className="text-left px-4 py-2 font-medium w-16">Raw</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, i) => {
                    const isPhish = row.prediction === "PHISHING";
                    return (
                      <tr
                        key={`${row.url}-${i}`}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-gmail-muted">{i + 1}</td>
                        <td className="px-4 py-3 font-mono text-xs break-all max-w-md">
                          {row.url}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                              isPhish
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {isPhish ? "🚨 PHISHING" : "✅ LEGITIMATE"}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {(row.confidence * 100).toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 font-mono text-gmail-muted">
                          {row.raw_prediction}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {errors.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Failed URLs</h3>
            <ul className="text-sm text-yellow-900 space-y-1">
              {errors.map((e, i) => (
                <li key={i} className="font-mono text-xs break-all">
                  {e.url}: {e.error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
