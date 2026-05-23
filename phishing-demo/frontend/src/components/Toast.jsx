export default function Toast({ message, type = "success", onClose }) {
  if (!message) return null;
  const colors = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-red-50 border-red-200 text-red-700",
    info: "bg-slate-50 border-slate-200 text-slate-800",
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-3xl border p-4 ${colors[type]}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{message}</p>
        <button type="button" onClick={onClose} className="text-sm opacity-80 hover:opacity-100">
          Close
        </button>
      </div>
    </div>
  );
}
