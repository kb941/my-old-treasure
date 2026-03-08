import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { EXAM_CONFIGS, PYQEntry } from '@/components/PYQTracker';
import { Subject } from '@/types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell } from 'recharts';

function extractYear(session: string): number {
  const match = session.match(/(\d{4})/);
  return match ? parseInt(match[1]) : 0;
}

interface PYQAccuracyTrendsProps {
  subjects: Subject[];
}

export function PYQAccuracyTrends({ subjects }: PYQAccuracyTrendsProps) {
  const [pyqData] = useLocalStorage<PYQEntry[]>('planos-pyq-tracker-v2', []);

  const chartData = useMemo(() => {
    if (!pyqData.length) return [];
    const examData: Record<string, { session: string; year: number; correct: number; total: number }[]> = {};
    EXAM_CONFIGS.forEach(cfg => {
      examData[cfg.name] = [];
      cfg.sessions.forEach(session => {
        const entries = pyqData.filter(e => e.exam === cfg.name && e.session === session && e.subjectId !== 'all');
        const correct = entries.reduce((s, e) => s + (e.correctAnswers || 0), 0);
        const total = entries.reduce((s, e) => s + (e.totalQuestions || 0), 0);
        if (total > 0) examData[cfg.name].push({ session, year: extractYear(session), correct, total });
      });
    });
    const allSessions = new Set<string>();
    Object.values(examData).forEach(arr => arr.forEach(d => allSessions.add(d.session)));
    const sorted = Array.from(allSessions).sort((a, b) => extractYear(a) - extractYear(b));
    return sorted.map(session => {
      const point: Record<string, string | number> = { session };
      EXAM_CONFIGS.forEach(cfg => {
        const match = examData[cfg.name].find(d => d.session === session);
        if (match) point[cfg.name] = Math.round((match.correct / match.total) * 100);
      });
      return point;
    });
  }, [pyqData]);

  // Subject-wise breakdown
  const subjectBreakdown = useMemo(() => {
    if (!pyqData.length || !subjects.length) return [];
    return subjects.map(sub => {
      const entries = pyqData.filter(e => e.subjectId === sub.id);
      const correct = entries.reduce((s, e) => s + (e.correctAnswers || 0), 0);
      const total = entries.reduce((s, e) => s + (e.totalQuestions || 0), 0);
      const done = entries.filter(e => e.done).length;
      const totalEntries = entries.length;
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : null;
      return { name: sub.name, shortName: sub.name.slice(0, 6), accuracy, correct, total, done, totalEntries, id: sub.id };
    }).filter(s => s.total > 0).sort((a, b) => (a.accuracy || 0) - (b.accuracy || 0));
  }, [pyqData, subjects]);

  const overallStats = useMemo(() => {
    return EXAM_CONFIGS.map(cfg => {
      const entries = pyqData.filter(e => e.exam === cfg.name && e.subjectId !== 'all');
      const done = entries.filter(e => e.done).length;
      const total = entries.length;
      const correct = entries.reduce((s, e) => s + (e.correctAnswers || 0), 0);
      const attempted = entries.reduce((s, e) => s + (e.totalQuestions || 0), 0);
      const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : null;
      return { name: cfg.name, done, total, accuracy };
    });
  }, [pyqData]);

  const hasData = chartData.length > 0;
  const hasSubjectData = subjectBreakdown.length > 0;
  const colors = ['hsl(var(--primary))', '#a855f7', '#14b8a6'];

  const getBarColor = (accuracy: number) => {
    if (accuracy >= 75) return '#22c55e';
    if (accuracy >= 50) return '#eab308';
    return '#ef4444';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl p-5 shadow-card border border-border space-y-5"
    >
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-base">PYQ Analysis</h3>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2">
        {overallStats.map(stat => (
          <div key={stat.name} className="bg-secondary/30 rounded-lg p-2.5 text-center">
            <span className="text-[10px] text-muted-foreground block">{stat.name}</span>
            <span className="text-sm font-bold text-foreground">
              {stat.accuracy !== null ? `${stat.accuracy}%` : '—'}
            </span>
            <span className="text-[10px] text-muted-foreground block">{stat.done}/{stat.total} done</span>
          </div>
        ))}
      </div>

      {/* Accuracy Trend Chart */}
      {hasData ? (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Accuracy Over Sessions
          </h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="session" tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} interval="preserveStartEnd" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }}
                  formatter={(value: number) => [`${value}%`, '']}
                />
                {EXAM_CONFIGS.map((cfg, i) => (
                  <Line key={cfg.name} type="monotone" dataKey={cfg.name} stroke={colors[i]} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            {EXAM_CONFIGS.map((cfg, i) => (
              <div key={cfg.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[i] }} />
                <span className="text-[10px] text-muted-foreground">{cfg.name}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
          <TrendingUp className="w-8 h-8 mb-2 opacity-30" />
          <p className="text-xs">Log PYQ marks to see accuracy trends</p>
        </div>
      )}

      {/* Subject-wise Breakdown */}
      {hasSubjectData && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <BarChart3 className="w-3 h-3" /> Subject-wise Accuracy (weakest first)
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectBreakdown} margin={{ top: 5, right: 5, left: -20, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="shortName" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} width={50} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }}
                  formatter={(value: number, _: string, props: any) => [`${value}% (${props.payload.correct}/${props.payload.total})`, 'Accuracy']}
                  labelFormatter={(label) => {
                    const sub = subjectBreakdown.find(s => s.shortName === label);
                    return sub?.name || label;
                  }}
                />
                <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                  {subjectBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.accuracy || 0)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Weakest subjects callout */}
          {subjectBreakdown.length >= 3 && (
            <div className="mt-2 p-2.5 bg-destructive/5 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown className="w-3 h-3 text-destructive" />
                <span className="text-xs font-medium text-destructive">Weakest Subjects</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {subjectBreakdown.slice(0, 3).map(s => `${s.name} (${s.accuracy}%)`).join(', ')}
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
