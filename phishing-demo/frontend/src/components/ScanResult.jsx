import { useEffect, useState } from "react";

const FEATURE_LABELS = {
  UsingIP: "Using IP address in URL",
  "PrefixSuffix-": "Hyphen in domain name",
  SubDomains: "Subdomain count",
  HTTPS: "HTTPS usage",
  NonStdPort: "Non-standard port",
  HTTPSDomainURL: "HTTPS in domain (suspicious)",
  RequestURL: "Request URL mismatch",
  AnchorURL: "Anchor (#) in URL",
  LinksInScriptTags: "Links in script tags",
  ServerFormHandler: "Server form handler",
  InfoEmail: "mailto: in URL",
  AbnormalURL: "Abnormal URL structure (@)",
  WebsiteForwarding: "URL forwarding",
  StatusBarCust: "Status bar customization",
  DisableRightClick: "Disable right-click",
  AgeofDomain: "Domain age / TLD",
  DNSRecording: "DNS recording",
  WebsiteTraffic: "Website traffic",
  PageRank: "Page rank",
  GoogleIndex: "Google index",
  StatsReport: "Stats report",
};

export default function ScanResult({ result, onClose }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="mt-6 rounded-xl border border-gmail-border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gmail-blue border-t-transparent" />
        <p className="text-lg font-medium text-gmail-text animate-scan-pulse">
          🔍 Scanning URL for phishing indicators...
        </p>
        <p className="text-sm text-gmail-muted mt-2">Running ML model analysis</p>
      </div>
    );
  }

  const isPhishing = result.prediction === "PHISHING";
  const confidencePct = (result.confidence * 100).toFixed(1);

  const flagged = Object.entries(result.features || {}).filter(
    ([, value]) => value === -1 || value === 0
  );

  return (
    <div className="mt-6 animate-fade-in">
      <div
        className={`rounded-xl border-2 p-6 shadow-md ${
          isPhishing
            ? "border-red-300 bg-red-50"
            : "border-green-300 bg-green-50"
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="text-4xl">{isPhishing ? "🚨" : "✅"}</span>
          <div>
            <h3
              className={`text-xl font-bold ${
                isPhishing ? "text-red-700" : "text-green-700"
              }`}
            >
              {isPhishing ? "PHISHING DETECTED" : "LEGITIMATE"}
            </h3>
            <p className="text-sm text-gmail-muted mt-1">
              Confidence: <strong>{confidencePct}%</strong>
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-white/80 p-3 border border-gray-200">
          <p className="text-xs font-medium text-gmail-muted uppercase tracking-wide">
            Detected URL
          </p>
          <p className="text-sm font-mono text-red-700 break-all mt-1">{result.url}</p>
        </div>

        {isPhishing && (
          <ul className="mt-4 space-y-1 text-sm text-red-800">
            <li>• Do not click this link</li>
            <li>• Do not enter any credentials</li>
            <li>• Report this email</li>
          </ul>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-gmail-border bg-white overflow-hidden">
        <div className="bg-gmail-gray px-4 py-2 border-b border-gmail-border">
          <h4 className="font-medium text-sm">Feature breakdown</h4>
          <p className="text-xs text-gmail-muted">
            Values: 1 = legitimate, 0 = suspicious, -1 = phishing indicator
          </p>
        </div>
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Feature</th>
                <th className="text-center px-4 py-2 font-medium w-20">Value</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(result.features || {}).map(([key, value]) => {
                const rowClass =
                  value === -1
                    ? "bg-red-50"
                    : value === 0
                    ? "bg-yellow-50"
                    : "";
                return (
                  <tr key={key} className={`border-t border-gray-100 ${rowClass}`}>
                    <td className="px-4 py-2">{FEATURE_LABELS[key] || key}</td>
                    <td className="px-4 py-2 text-center font-mono">{value}</td>
                    <td className="px-4 py-2">
                      {value === -1 && (
                        <span className="text-red-600 font-medium">⚠ Flagged</span>
                      )}
                      {value === 0 && (
                        <span className="text-yellow-700 font-medium">~ Suspicious</span>
                      )}
                      {value === 1 && (
                        <span className="text-green-600">✓ OK</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {flagged.length > 0 && (
          <p className="px-4 py-2 text-xs text-gmail-muted border-t">
            {flagged.length} feature(s) contributed to the risk assessment.
          </p>
        )}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="mt-4 text-sm text-gmail-muted hover:text-gmail-text underline"
        >
          Dismiss results
        </button>
      )}
    </div>
  );
}
