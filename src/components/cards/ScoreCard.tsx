import { getScoreBgColor, getScoreColor, formatScore } from "@/lib/scoring";

interface ScoreCardProps {
  label: string;
  score: number;
  max: number;
  subtitle?: string;
}

export default function ScoreCard({ label, score, max, subtitle }: ScoreCardProps) {
  const pct = score / max;

  return (
    <div
      className={`rounded-xl border p-4 ${getScoreBgColor(score, max)}`}
      style={{ boxShadow: "var(--elevation-1)" }}
    >
      <div
        className="text-xs font-semibold uppercase tracking-wide mb-2"
        style={{ color: "var(--md-sys-color-on-surface-variant)" }}
      >
        {label}
      </div>
      <div
        className={`stat-number font-bold leading-none ${getScoreColor(score, max)}`}
        style={{ fontSize: pct >= 0.8 ? 28 : 24 }}
      >
        {score}
        <span
          className="font-normal"
          style={{ fontSize: 13, color: "var(--md-sys-color-on-surface-muted)", marginLeft: 2 }}
        >
          /{max}
        </span>
      </div>
      {subtitle && (
        <div
          className="mt-1.5 text-xs leading-snug"
          style={{ color: "var(--md-sys-color-on-surface-variant)" }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}
