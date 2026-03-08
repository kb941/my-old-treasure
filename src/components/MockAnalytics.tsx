import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Target, Award, Hash, Clock, CheckCircle2, BarChart3, ChevronDown, X } from 'lucide-react';
import { MockTest, MockPrediction, MarkingScheme, DEFAULT_MARKING_SCHEME, UserStats, Chapter, StudyLog } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface MockAnalyticsProps {
  mockTests: MockTest[];
  markingScheme?: MarkingScheme;
  stats?: UserStats;
  chapters?: Chapter[];
  studyLogs?: StudyLog[];
}

type InsightCard = 'score' | 'marks' | 'rank' | 'trend' | 'mcqs' | 'hours';

export function MockAnalytics({ mockTests, markingScheme = DEFAULT_MARKING_SCHEME, stats, chapters, studyLogs }: MockAnalyticsProps) {
  const [expandedCard, setExpandedCard] = useState<InsightCard | null>(null);

  const calculatePrediction = (): MockPrediction => {
    if (mockTests.length === 0) return { predictedScore: 0, predictedRank: 0, rankRange: { min: 0, max: 0 }, confidence: 0, trend: 'stable' };
    const sorted = [...mockTests].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const recent = sorted.slice(0, 3);
    const weights = [0.5, 0.3, 0.2];
    let ws = 0, tw = 0;
    recent.forEach((t, i) => { const w = weights[i] || 0.1; ws += t.score * w; tw += w; });
    const avg = tw > 0 ? Math.round(ws / tw) : 0;
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (sorted.length >= 2) {
      const ra = sorted.slice(0, 2).reduce((a, b) => a + b.score, 0) / 2;
      const oa = sorted.length >= 4 ? sorted.slice(2, 4).reduce((a, b) => a + b.score, 0) / 2 : sorted[sorted.length - 1]?.score || ra;
      if (ra > oa + 20) trend = 'improving'; else if (ra < oa - 20) trend = 'declining';
    }
    const pr = Math.max(1, Math.round(200000 * Math.exp(-avg / 150)));
    const v = Math.round(pr * 0.15);
    return { predictedScore: avg, predictedRank: pr, rankRange: { min: Math.max(1, pr - v), max: pr + v }, confidence: Math.min(95, 50 + mockTests.length * 5), trend };
  };

  const prediction = calculatePrediction();
  const totalMCQs = chapters?.reduce((s, ch) => s + ch.topics.reduce((ts, t) => ts + t.questionsSolved, 0), 0) || 0;
  const totalHours = stats?.totalStudyHours || 0;
  const TrendIcon = prediction.trend === 'improving' ? TrendingUp : prediction.trend === 'declining' ? TrendingDown : Minus;
  const trendColor = prediction.trend === 'improving' ? 'text-emerald-500' : prediction.trend === 'declining' ? 'text-destructive' : 'text-muted-foreground';

  const scoreData = mockTests.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((t, i) => ({ name: `Test ${i + 1}`, score: t.score, accuracy: Math.round((t.correctAnswers / t.attemptedQuestions) * 100) }));

  // Detail panel content renderer
  const renderDetail = (card: InsightCard) => {
    switch (card) {
      case 'score':
        return (
          <div className="space-y-4">
            <div className="text-center py-2">
              <p className="text-4xl font-bold text-gradient-primary">{prediction.predictedScore}/{markingScheme.totalMarks || 800}</p>
              <p className="text-xs text-muted-foreground mt-1">{prediction.confidence}% confidence</p>
            </div>
            {scoreData.length > 0 && (
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scoreData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} domain={[0, markingScheme.totalMarks || 800]} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/30 rounded-xl p-3 text-center">
                <p className="text-lg font-bold">{mockTests.length}</p>
                <p className="text-[11px] text-muted-foreground">Tests Taken</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-3 text-center">
                <p className="text-lg font-bold">{mockTests.length > 0 ? Math.round(mockTests.reduce((a, b) => a + b.score, 0) / mockTests.length) : 0}</p>
                <p className="text-[11px] text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </div>
        );
      case 'marks':
        return mockTests.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[...mockTests].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map(test => {
              const wrong = test.attemptedQuestions - test.correctAnswers;
              const unanswered = test.totalQuestions - test.attemptedQuestions;
              const marks = test.correctAnswers * markingScheme.correctMarks + wrong * markingScheme.incorrectMarks + unanswered * markingScheme.unansweredMarks;
              return (
                <div key={test.id} className="p-3 bg-muted/30 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{test.testName}</p>
                    <p className="text-[11px] text-muted-foreground">✓{test.correctAnswers} ✗{wrong} ○{unanswered}</p>
                  </div>
                  <p className="text-xl font-bold">{marks}</p>
                </div>
              );
            })}
          </div>
        ) : <p className="text-center text-muted-foreground py-8 text-sm">No mock tests yet</p>;
      case 'rank':
        return (
          <div className="space-y-3">
            <div className="text-center py-3">
              <p className="text-4xl font-bold">#{prediction.predictedRank.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">{prediction.rankRange.min.toLocaleString()} – {prediction.rankRange.max.toLocaleString()}</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Projected against ~200K candidates based on weighted recent mock scores. More tests = higher confidence.</p>
            </div>
          </div>
        );
      case 'trend':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 py-3">
              <TrendIcon className={`w-7 h-7 ${trendColor}`} />
              <p className={`text-2xl font-bold capitalize ${trendColor}`}>{prediction.trend}</p>
            </div>
            {scoreData.length > 0 && (
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scoreData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" strokeWidth={2} name="Accuracy %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        );
      case 'mcqs':
        return (
          <div className="space-y-3">
            <div className="text-center py-2">
              <p className="text-4xl font-bold">{totalMCQs}</p>
              <p className="text-xs text-muted-foreground">Total MCQs Solved</p>
            </div>
            {chapters && chapters.filter(ch => ch.topics.some(t => t.questionsSolved > 0)).length > 0 && (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {chapters.filter(ch => ch.topics.some(t => t.questionsSolved > 0)).slice(0, 10).map(ch => (
                  <div key={ch.id} className="flex justify-between p-2.5 bg-muted/30 rounded-lg text-sm">
                    <span className="truncate">{ch.name}</span>
                    <span className="font-semibold shrink-0 ml-2">{ch.topics.reduce((s, t) => s + t.questionsSolved, 0)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'hours':
        return (
          <div className="space-y-3">
            <div className="text-center py-2">
              <p className="text-4xl font-bold">{totalHours}h</p>
              <p className="text-xs text-muted-foreground">Total Study Hours</p>
            </div>
            {studyLogs && studyLogs.length > 0 && (() => {
              const today = new Date();
              const wd = Array.from({ length: 7 }, (_, i) => {
                const d = new Date(today); d.setDate(d.getDate() - (6 - i));
                const ds = d.toISOString().split('T')[0];
                return { day: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()], hours: +(studyLogs.filter(l => l.date === ds).reduce((s, l) => s + l.minutesStudied, 0) / 60).toFixed(1) };
              });
              return (
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={wd}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} unit="h" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} formatter={(v: number) => [`${v}h`, 'Study']} />
                      <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            })()}
          </div>
        );
    }
  };

  if (mockTests.length === 0 && totalMCQs === 0 && totalHours === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
        <BarChart3 className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">Log mock tests or study sessions to see predictions</p>
      </motion.div>
    );
  }

  return (
    <>
      {/* Prediction Strip — always visible */}
      <div className="grid grid-cols-3 gap-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setExpandedCard('score')}
          className="bg-card rounded-xl p-3 border border-border cursor-pointer hover:border-primary/30 transition-all active:scale-[0.97]"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Target className="w-3 h-3 text-primary" />
            <span className="text-[10px] text-muted-foreground">Score</span>
          </div>
          <p className="text-lg font-bold text-gradient-primary leading-tight">{prediction.predictedScore}</p>
          <p className="text-[9px] text-muted-foreground">/{markingScheme.totalMarks || 800}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.03 }}
          onClick={() => setExpandedCard('rank')}
          className="bg-card rounded-xl p-3 border border-border cursor-pointer hover:border-primary/30 transition-all active:scale-[0.97]"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Award className="w-3 h-3 text-primary" />
            <span className="text-[10px] text-muted-foreground">Rank</span>
          </div>
          <p className="text-lg font-bold leading-tight">#{prediction.predictedRank.toLocaleString()}</p>
          <p className="text-[9px] text-muted-foreground">{prediction.rankRange.min.toLocaleString()}–{prediction.rankRange.max.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          onClick={() => setExpandedCard('trend')}
          className="bg-card rounded-xl p-3 border border-border cursor-pointer hover:border-primary/30 transition-all active:scale-[0.97]"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <TrendIcon className={`w-3 h-3 ${trendColor}`} />
            <span className="text-[10px] text-muted-foreground">Trend</span>
          </div>
          <p className={`text-lg font-bold capitalize leading-tight ${trendColor}`}>{prediction.trend}</p>
          <p className="text-[9px] text-muted-foreground">{mockTests.length} mocks</p>
        </motion.div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { key: 'marks' as InsightCard, icon: Hash, label: 'Last Marks', value: mockTests.length > 0 ? (() => { const r = [...mockTests].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]; return r.correctAnswers * markingScheme.correctMarks + (r.attemptedQuestions - r.correctAnswers) * markingScheme.incorrectMarks + (r.totalQuestions - r.attemptedQuestions) * markingScheme.unansweredMarks; })() : '—' },
          { key: 'mcqs' as InsightCard, icon: CheckCircle2, label: 'MCQs', value: totalMCQs.toLocaleString() },
          { key: 'hours' as InsightCard, icon: Clock, label: 'Hours', value: `${totalHours}h` },
        ].map(item => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.09 }}
            onClick={() => setExpandedCard(item.key)}
            className="bg-card rounded-xl px-3 py-2.5 border border-border cursor-pointer hover:border-primary/30 transition-all active:scale-[0.97] flex items-center gap-2"
          >
            <item.icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight">{item.value}</p>
              <p className="text-[9px] text-muted-foreground">{item.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Panel — slides in like readiness breakdown */}
      <AnimatePresence>
        {expandedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setExpandedCard(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-x-3 top-6 bottom-20 md:bottom-6 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[520px] bg-card rounded-2xl border border-border shadow-lg overflow-y-auto"
            >
              <div className="sticky top-0 z-10 bg-card border-b border-border px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {expandedCard === 'score' && <Target className="w-4 h-4 text-primary" />}
                  {expandedCard === 'marks' && <Hash className="w-4 h-4 text-primary" />}
                  {expandedCard === 'rank' && <Award className="w-4 h-4 text-primary" />}
                  {expandedCard === 'trend' && <TrendIcon className={`w-4 h-4 ${trendColor}`} />}
                  {expandedCard === 'mcqs' && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  {expandedCard === 'hours' && <Clock className="w-4 h-4 text-primary" />}
                  <h2 className="font-semibold text-base">
                    {expandedCard === 'score' && 'Predicted Score'}
                    {expandedCard === 'marks' && 'Marks Breakdown'}
                    {expandedCard === 'rank' && 'Predicted Rank'}
                    {expandedCard === 'trend' && 'Performance Trend'}
                    {expandedCard === 'mcqs' && 'MCQs Solved'}
                    {expandedCard === 'hours' && 'Study Hours'}
                  </h2>
                </div>
                <button onClick={() => setExpandedCard(null)} className="p-1 rounded-full hover:bg-secondary">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5">
                {renderDetail(expandedCard)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}