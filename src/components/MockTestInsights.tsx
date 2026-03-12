import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, BarChart3, ChevronDown, Calendar, Target, Award, AlertTriangle } from 'lucide-react';
import { MockTest, MarkingScheme, DEFAULT_MARKING_SCHEME, Subject } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface MockTestInsightsProps {
  mockTests: MockTest[];
  markingScheme: MarkingScheme;
  subjects: Subject[];
}

export function MockTestInsights({ mockTests, markingScheme, subjects }: MockTestInsightsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('trend');

  const sorted = useMemo(() =>
    [...mockTests].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [mockTests]
  );

  // Score trend data
  const scoreTrend = useMemo(() =>
    sorted.map((t, i) => ({
      name: t.testName || `Test ${i + 1}`,
      date: format(new Date(t.date), 'MMM d'),
      score: t.score,
      accuracy: t.attemptedQuestions > 0 ? Math.round((t.correctAnswers / t.attemptedQuestions) * 100) : 0,
      percentile: t.percentile || 0,
      rank: t.rank || 0,
    })),
    [sorted]
  );

  // Subject-wise aggregated performance
  const subjectPerformance = useMemo(() => {
    const map: Record<string, { total: number; correct: number; tests: number }> = {};
    mockTests.forEach(t => {
      t.subjectScores?.forEach(ss => {
        if (!map[ss.subjectId]) map[ss.subjectId] = { total: 0, correct: 0, tests: 0 };
        map[ss.subjectId].total += ss.total;
        map[ss.subjectId].correct += ss.correct;
        map[ss.subjectId].tests += 1;
      });
    });
    return Object.entries(map)
      .map(([id, data]) => ({
        subjectId: id,
        name: subjects.find(s => s.id === id)?.name || id,
        accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
        total: data.total,
        correct: data.correct,
        tests: data.tests,
      }))
      .sort((a, b) => b.accuracy - a.accuracy);
  }, [mockTests, subjects]);

  // Subject trend over time (last 5 tests)
  const subjectTrends = useMemo(() => {
    const recentTests = [...mockTests]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .reverse();

    return recentTests.map((t, i) => {
      const entry: Record<string, any> = { name: t.testName || `T${i + 1}` };
      t.subjectScores?.forEach(ss => {
        const subName = subjects.find(s => s.id === ss.subjectId)?.name || ss.subjectId;
        entry[subName] = ss.accuracy;
      });
      return entry;
    });
  }, [mockTests, subjects]);

  // Weak subjects analysis
  const weakSubjects = useMemo(() => {
    const counts: Record<string, number> = {};
    mockTests.forEach(t => {
      t.weakSubjects?.forEach(ws => {
        counts[ws] = (counts[ws] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / mockTests.length) * 100) }));
  }, [mockTests]);

  // Overall stats
  const overallStats = useMemo(() => {
    if (mockTests.length === 0) return null;
    const latest = [...mockTests].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const avgScore = Math.round(mockTests.reduce((s, t) => s + t.score, 0) / mockTests.length);
    const avgAccuracy = Math.round(
      mockTests.reduce((s, t) => s + (t.attemptedQuestions > 0 ? (t.correctAnswers / t.attemptedQuestions) * 100 : 0), 0) / mockTests.length
    );
    const bestScore = Math.max(...mockTests.map(t => t.score));
    const latestScore = latest[0]?.score || 0;
    const trend = latest.length >= 2 ? (latest[0].score > latest[1].score ? 'up' : latest[0].score < latest[1].score ? 'down' : 'flat') : 'flat';
    return { avgScore, avgAccuracy, bestScore, latestScore, trend, total: mockTests.length };
  }, [mockTests]);

  if (mockTests.length === 0) {
    return (
      <div className="text-center py-10">
        <BarChart3 className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">No mock tests or GTs logged yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Log your first mock to see insights here</p>
      </div>
    );
  }

  const toggleSection = (id: string) => setExpandedSection(prev => prev === id ? null : id);

  const Section = ({ id, title, icon: Icon, children }: { id: string; title: string; icon: typeof BarChart3; children: React.ReactNode }) => (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <button onClick={() => toggleSection(id)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors">
        <span className="text-sm font-semibold flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          {title}
        </span>
        <motion.div animate={{ rotate: expandedSection === id ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence>
        {expandedSection === id && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const subjectColors = ['hsl(var(--primary))', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

  return (
    <div className="space-y-3">
      {/* Overview Cards */}
      {overallStats && (
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-card rounded-xl p-3 border border-border text-center">
            <p className="text-lg font-bold text-primary">{overallStats.total}</p>
            <p className="text-[9px] text-muted-foreground">Total Tests</p>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border text-center">
            <p className="text-lg font-bold">{overallStats.avgScore}</p>
            <p className="text-[9px] text-muted-foreground">Avg Score</p>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border text-center">
            <p className="text-lg font-bold">{overallStats.avgAccuracy}%</p>
            <p className="text-[9px] text-muted-foreground">Avg Accuracy</p>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border text-center">
            <p className="text-lg font-bold text-green-500">{overallStats.bestScore}</p>
            <p className="text-[9px] text-muted-foreground">Best Score</p>
          </div>
        </div>
      )}

      {/* Score Trend */}
      <Section id="trend" title="Score Trend" icon={TrendingUp}>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={scoreTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', r: 3 }} name="Score" />
              <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Accuracy %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {scoreTrend.length >= 2 && (
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            {overallStats?.trend === 'up' && <><TrendingUp className="w-3.5 h-3.5 text-green-500" /> Scores improving</>}
            {overallStats?.trend === 'down' && <><TrendingDown className="w-3.5 h-3.5 text-red-500" /> Scores declining</>}
            {overallStats?.trend === 'flat' && <><Minus className="w-3.5 h-3.5" /> Scores stable</>}
          </div>
        )}
      </Section>

      {/* Subject Performance */}
      {subjectPerformance.length > 0 && (
        <Section id="subjects" title="Subject-wise Performance" icon={Target}>
          <div className="space-y-2">
            {subjectPerformance.map(sp => (
              <div key={sp.subjectId} className="flex items-center gap-3">
                <span className="text-xs font-medium w-24 truncate">{sp.name}</span>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", sp.accuracy >= 70 ? 'bg-green-500' : sp.accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500')}
                    style={{ width: `${sp.accuracy}%` }}
                  />
                </div>
                <span className={cn("text-xs font-semibold w-10 text-right", sp.accuracy >= 70 ? 'text-green-500' : sp.accuracy >= 50 ? 'text-yellow-500' : 'text-red-500')}>
                  {sp.accuracy}%
                </span>
              </div>
            ))}
          </div>
          {/* Radar chart if enough subjects */}
          {subjectPerformance.length >= 3 && (
            <div className="h-48 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={subjectPerformance.slice(0, 8)}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 8 }} />
                  <Radar dataKey="accuracy" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Section>
      )}

      {/* Subject Trends Over Tests */}
      {subjectTrends.length >= 2 && Object.keys(subjectTrends[0] || {}).length > 1 && (
        <Section id="subjectTrend" title="Subject Trends Over Tests" icon={BarChart3}>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={subjectTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} domain={[0, 100]} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }} />
                {Object.keys(subjectTrends[0] || {}).filter(k => k !== 'name').slice(0, 6).map((key, i) => (
                  <Line key={key} type="monotone" dataKey={key} stroke={subjectColors[i % subjectColors.length]} strokeWidth={1.5} dot={{ r: 2 }} name={key} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>
      )}

      {/* Weak Subjects */}
      {weakSubjects.length > 0 && (
        <Section id="weak" title="Frequently Weak Subjects" icon={AlertTriangle}>
          <div className="space-y-2">
            {weakSubjects.map(ws => (
              <div key={ws.name} className="flex items-center gap-3">
                <span className="text-xs font-medium flex-1 truncate">{ws.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-red-500" style={{ width: `${ws.pct}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{ws.count}/{mockTests.length}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Test History */}
      <Section id="history" title="Test History" icon={Calendar}>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {[...mockTests].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(test => {
            const wrong = test.attemptedQuestions - test.correctAnswers;
            const unanswered = test.totalQuestions - test.attemptedQuestions;
            const marks = test.correctAnswers * markingScheme.correctMarks + wrong * markingScheme.incorrectMarks + unanswered * markingScheme.unansweredMarks;
            const acc = test.attemptedQuestions > 0 ? Math.round((test.correctAnswers / test.attemptedQuestions) * 100) : 0;
            return (
              <div key={test.id} className="p-3 bg-secondary/30 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{test.testName}</p>
                    <p className="text-[10px] text-muted-foreground">{format(new Date(test.date), 'MMM d, yyyy')} · {test.source}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{marks}</p>
                    <p className="text-[10px] text-muted-foreground">{acc}% acc</p>
                  </div>
                </div>
                <div className="flex gap-3 text-[10px] text-muted-foreground">
                  <span>✓ {test.correctAnswers}</span>
                  <span>✗ {wrong}</span>
                  <span>○ {unanswered}</span>
                  <span>⏱ {test.timeTaken}m</span>
                  {test.percentile && <span>P{test.percentile}</span>}
                  {test.rank && <span>#{test.rank}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}