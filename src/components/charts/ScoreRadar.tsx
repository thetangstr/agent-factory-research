"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { FrameworkScores } from "@/types";

interface ScoreRadarProps {
  scores: FrameworkScores[];
  labels: string[];
  colors?: string[];
  size?: number;
}

export default function ScoreRadar({
  scores,
  labels,
  colors = ["#3f51b5", "#f59e0b", "#1e8a3c", "#ef4444"],
  size = 300,
}: ScoreRadarProps) {
  if (!scores.length || !scores[0]?.dimensions?.length) {
    return (
      <div
        className="flex items-center justify-center text-sm rounded-lg"
        style={{
          height: size,
          color: "var(--md-sys-color-on-surface-muted)",
          background: "var(--md-sys-color-surface-variant)",
        }}
      >
        No data available
      </div>
    );
  }

  const data = scores[0].dimensions.map((dim, i) => {
    const point: Record<string, string | number> = {
      dimension: dim.name,
      fullMark: 25,
    };
    scores.forEach((s, idx) => {
      point[labels[idx]] = s.dimensions[i]?.score ?? 0;
    });
    return point;
  });

  return (
    <ResponsiveContainer width="100%" height={size}>
      <RadarChart data={data}>
        <PolarGrid stroke="#dadce0" strokeOpacity={0.8} />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{
            fill: "var(--md-sys-color-on-surface-variant)",
            fontSize: 11,
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 500,
          }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 25]}
          tick={{
            fill: "var(--md-sys-color-on-surface-muted)",
            fontSize: 9,
            fontFamily: "Inter, system-ui, sans-serif",
          }}
          stroke="#e8eaed"
        />
        {labels.map((label, idx) => (
          <Radar
            key={label}
            name={label}
            dataKey={label}
            stroke={colors[idx % colors.length]}
            fill={colors[idx % colors.length]}
            fillOpacity={0.12}
            strokeWidth={2}
            dot={{ fill: colors[idx % colors.length], r: 3, strokeWidth: 0 }}
          />
        ))}
        {labels.length > 1 && (
          <Legend
            wrapperStyle={{
              fontSize: 12,
              fontFamily: "Inter, system-ui, sans-serif",
              color: "var(--md-sys-color-on-surface-variant)",
            }}
          />
        )}
      </RadarChart>
    </ResponsiveContainer>
  );
}
