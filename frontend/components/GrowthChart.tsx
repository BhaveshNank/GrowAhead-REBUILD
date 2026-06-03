'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Props {
  projections: {
    conservative: { '1yr': number; '3yr': number; '5yr': number; '10yr': number };
    balanced: { '1yr': number; '3yr': number; '5yr': number; '10yr': number };
    aggressive: { '1yr': number; '3yr': number; '5yr': number; '10yr': number };
  };
}

export default function GrowthChart({ projections }: Props) {
  const data = [
    { year: 'Now', conservative: 0, balanced: 0, aggressive: 0 },
    { year: '1yr', conservative: projections.conservative['1yr'], balanced: projections.balanced['1yr'], aggressive: projections.aggressive['1yr'] },
    { year: '3yr', conservative: projections.conservative['3yr'], balanced: projections.balanced['3yr'], aggressive: projections.aggressive['3yr'] },
    { year: '5yr', conservative: projections.conservative['5yr'], balanced: projections.balanced['5yr'], aggressive: projections.aggressive['5yr'] },
    { year: '10yr', conservative: projections.conservative['10yr'], balanced: projections.balanced['10yr'], aggressive: projections.aggressive['10yr'] },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-lg font-semibold mb-1">Portfolio Growth</h3>
      <p className="text-sm text-muted-foreground mb-6">Projected growth across all 3 risk profiles</p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v) => `£${v.toFixed(2)}`} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value: any) => value == null ? '' : `£${Number(value).toFixed(2)}`} />
          <Legend />
          <Line type="monotone" dataKey="conservative" stroke="#64748b" strokeWidth={2} dot={{ r: 4 }} name="Conservative (5%)" />
          <Line type="monotone" dataKey="balanced" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Balanced (8%)" />
          <Line type="monotone" dataKey="aggressive" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} name="Aggressive (12%)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}