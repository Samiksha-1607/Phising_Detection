import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = {
  phishing: "#ef4444",
  legitimate: "#22c55e",
  neutral: "#3b82f6",
};

export default function StatsCharts({ scans_by_day, top_features, phishing_count, legitimate_count }) {
  const pieData = [
    { name: "Phishing", value: phishing_count, fill: COLORS.phishing },
    { name: "Legitimate", value: legitimate_count, fill: COLORS.legitimate },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-3xl border border-gmail-border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gmail-text">Phishing vs Legitimate Detections Over Time</h3>
            <p className="text-sm text-gmail-muted">Daily scan totals for recent activity.</p>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={scans_by_day} margin={{ left: -10, right: 0, top: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 12 }} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="phishing" stroke={COLORS.phishing} strokeWidth={3} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="legitimate" stroke={COLORS.legitimate} strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="rounded-3xl border border-gmail-border bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gmail-text">Top URL Features Flagged as Phishing</h3>
            <p className="text-sm text-gmail-muted">Most frequently triggered phishing indicators.</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top_features} margin={{ left: -10, right: 0, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="feature" tick={{ fill: "#6b7280", fontSize: 12 }} interval={0} angle={-30} textAnchor="end" height={70} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS.phishing} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-gmail-border bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gmail-text">Phishing vs Legitimate Split</h3>
            <p className="text-sm text-gmail-muted">Quick overview of classification balance.</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={4}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
