export default function EmailCard({ email, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-gmail-border transition hover:shadow-sm ${
        selected ? "bg-blue-50 border-l-4 border-l-gmail-blue" : "bg-white hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`text-sm truncate ${!email.scanned ? "font-semibold" : ""}`}>
          {email.from}
        </span>
        <span className="text-xs text-gmail-muted shrink-0">{email.timestamp}</span>
      </div>
      <p className={`text-sm truncate mt-0.5 ${!email.scanned ? "font-medium" : "text-gmail-text"}`}>
        {email.subject}
      </p>
      <p className="text-xs text-gmail-muted truncate mt-0.5">
        {email.body?.split("\n")[0]}
      </p>
    </button>
  );
}
