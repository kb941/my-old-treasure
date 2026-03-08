import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FileQuestion } from 'lucide-react';

interface McqWeeklyChartProps {
  mcqLogs: { date: string; count: number }[];
}

export function McqWeeklyChart({ mcqLogs }: McqWeeklyChartProps) {
  const data = useMemo(() => {
    const days: { label: string; date: string; count: number }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();

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
  }, [mcqLogs]);

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-center gap-2 mb-3">
        <FileQuestion className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">MCQs — Last 7 Days</h3>
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
                  key={entry.date}
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
