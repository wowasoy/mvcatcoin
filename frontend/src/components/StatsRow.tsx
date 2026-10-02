interface StatItem {
  value: string;
  label: string;
}

const STATS: StatItem[] = [
  { value: "500M", label: "MVCAT Supply" },
  { value: "11", label: "Tests Passing" },
  { value: "6", label: "Tokens Supported" },
  { value: "Sepolia", label: "Live Network" },
];

export default function StatsRow() {
  return (
    <section className="stats-row" aria-label="Project statistics">
      {STATS.map((s) => (
        <div className="stat-cell glass" key={s.label}>
          <span className="stat-cell-value">{s.value}</span>
          <span className="stat-cell-label">{s.label}</span>
        </div>
      ))}
    </section>
  );
}