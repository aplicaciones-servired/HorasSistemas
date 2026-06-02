interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  pills: Array<{ label: string; value: string | number }>;
}

export const DashboardHeader = ({ title, subtitle, pills }: DashboardHeaderProps) => {
  return (
    <header className="hero-panel">
      <div className="hero-copy">
        <span className="eyebrow">Horas Sistemas</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="hero-pills" aria-label="Resumen general">
        {pills.map((pill) => (
          <article key={pill.label} className="stat-card">
            <span>{pill.label}</span>
            <strong>{pill.value}</strong>
          </article>
        ))}
      </div>
    </header>
  );
};