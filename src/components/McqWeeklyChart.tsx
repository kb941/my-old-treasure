import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FileQuestion } from 'lucide-react';

interface McqWeeklyChartProps {
  mcqLogs: { date: string; count: number }[];
  period?: 'week' | 'month';
}

export function McqWeeklyChart({ mcqLogs, period = 'week' }: McqWeeklyChartProps) {
  const isMonth = period === 'month';

  const data = useMemo(() => {
    const now = new Date();

    if (isMonth) {
      // Last 30 days grouped into 4-5 week buckets
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const buckets: { label: string; count: number }[] = [];

      for (let w = 0; w < 5; w++) {
        const weekStart = new Date(monthStart);
        weekStart.setDate(monthStart.getDate() + w * 7);
        if (weekStart.getMonth() !== now.getMonth() && w > 0) break;
        const weekEnd = new Date(monthStart);
        weekEnd.setDate(monthStart.getDate() + (w + 1) * 7 - 1);

        const startStr = weekStart.toISOString().split('T')[0];
        const endStr = (weekEnd > now ? now : weekEnd).toISOString().split('T')[0];
        const count = mcqLogs.filter(l => l.date >= startStr && l.date <= endStr).reduce((s, l) => s + l.count, 0);
        buckets.push({ label: `W${w + 1}`, count });
      }
      return buckets;
    } else {
      const days: { label: string; date: string; count: number }[] = [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const count = mcqLogs.filter(l => l.date === dateStr).reduce((s, l) => s + l.count, 0);
        days.push({
          label: i === 0 ? 'Today' : dayNames[d.getDay()],
          date: dateStr,
          count,
        });
      }
      return days;
    }
  }, [mcqLogs, isMonth]);

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-center gap-2 mb-3">
        <FileQuestion className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">MCQs — {isMonth ? 'This Month' : 'Last 7 Days'}</h3>
        <span className="text-xs text-muted-foreground ml-auto">
          {data.reduce((s, d) => s + d.count, 0)} total
        </span>
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="25%">
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide domain={[0, maxCount * 1.1]} />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number) => [`${value} MCQs`, '']}
              labelFormatter={(label) => label}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={index === data.length - 1 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.4)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
