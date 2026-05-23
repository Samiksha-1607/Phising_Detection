export default function PhishingWarning({ url, result, onReport, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-red-950/70 p-4">
      <div className="max-w-3xl rounded-3xl border border-red-300 bg-red-600 p-8 text-white shadow-2xl">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-800 text-5xl">🚨</div>
            <h2 className="text-3xl font-semibold">PHISHING WEBSITE DETECTED & BLOCKED</h2>
            <p className="mt-3 text-sm text-red-100">
              Our ML model blocked this dangerous website before it could load.
            </p>
          </div>

          <div className="rounded-3xl bg-red-700/90 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-red-200">Blocked URL</p>
            <p className="mt-2 break-words text-sm font-mono text-white">{url}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-red-700/80 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-red-200">Confidence</p>
              <p className="mt-2 text-2xl font-semibold">{Math.round(result.confidence * 100)}%</p>
            </div>
            <div className="rounded-3xl bg-red-700/80 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-red-200">Risk Score</p>
              <p className="mt-2 text-2xl font-semibold">{result.risk_score}</p>
            </div>
            <div className="rounded-3xl bg-red-700/80 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-red-200">Flagged features</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.features_flagged.length ? (
                  result.features_flagged.map((feature) => (
                    <span key={feature} className="rounded-full bg-red-800 px-3 py-1 text-xs">
                      {feature}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-red-100">None</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={onReport}
              className="rounded-3xl bg-white px-6 py-3 text-sm font-semibold text-red-700 shadow hover:bg-red-50 transition"
            >
              Report This Website to Admin
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-3xl border border-white/70 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition"
            >
              Go Back to Safety
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
