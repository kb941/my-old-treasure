import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Target, Award, Hash, Clock, CheckCircle2, BarChart3 } from 'lucide-react';
import { MockTest, MockPrediction, MarkingScheme, DEFAULT_MARKING_SCHEME, UserStats, Chapter, StudyLog } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface MockAnalyticsProps {
  mockTests: MockTest[];
  markingScheme?: MarkingScheme;
  stats?: UserStats;
  chapters?: Chapter[];
  studyLogs?: StudyLog[];
}

type InsightCard = 'score' | 'marks' | 'rank' | 'trend' | 'mcqs' | 'hours';

const cardConfigs: Record<InsightCard, { title: string; icon: typeof Target; gradient: string }> = {
  score: { title: 'Predicted Score', icon: Target, gradient: 'gradient-primary' },
  marks: { title: 'Predicted Marks', icon: Hash, gradient: 'gradient-xp' },
  rank: { title: 'Predicted Rank', icon: Award, gradient: 'gradient-success' },
  trend: { title: 'Performance Trend', icon: TrendingUp, gradient: 'gradient-warning' },
  mcqs: { title: 'MCQs Solved', icon: CheckCircle2, gradient: 'gradient-primary' },
  hours: { title: 'Hours Studied', icon: Clock, gradient: 'gradient-success' },
};

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
  const scoreData = mockTests.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((t, i) => ({ name: `Test ${i + 1}`, score: t.score, accuracy: Math.round((t.correctAnswers / t.attemptedQuestions) * 100) }));

  const subjectAnalysis = mockTests.reduce((acc, test) => {
    test.subjectScores.forEach(s => {
      if (!acc[s.subjectId]) acc[s.subjectId] = { name: s.subjectName, total: 0, correct: 0 };
      acc[s.subjectId].total += s.total; acc[s.subjectId].correct += s.correct;
    }); return acc;
  }, {} as Record<string, { name: string; total: number; correct: number }>);

  const subjectChartData = Object.values(subjectAnalysis)
    .map(d => ({ name: d.name.length > 8 ? d.name.slice(0, 8) + '…' : d.name, accuracy: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0 })).slice(0, 8);

  const TrendIcon = prediction.trend === 'improving' ? TrendingUp : prediction.trend === 'declining' ? TrendingDown : Minus;
  const trendColor = prediction.trend === 'improving' ? 'text-primary' : prediction.trend === 'declining' ? 'text-destructive' : 'text-muted-foreground';

  const totalMCQs = chapters?.reduce((s, ch) => s + ch.topics.reduce((ts, t) => ts + t.questionsSolved, 0), 0) || 0;
  const totalHours = stats?.totalStudyHours || 0;

  const cardClass = "bg-card rounded-xl p-4 shadow-card border border-border cursor-pointer hover:border-primary/30 hover:shadow-md transition-all active:scale-[0.97]";

  const renderPopupContent = () => {
    if (!expandedCard) return null;
    const cfg = cardConfigs[expandedCard];
    const Icon = cfg.icon;

    return (
      <DialogContent className="sm:max-w-[380px] rounded-2xl p-0 overflow-hidden border-border gap-0">
        <div className={`${cfg.gradient} px-5 py-4 flex items-center gap-3`}>
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <DialogTitle className="text-primary-foreground text-base">{cfg.title}</DialogTitle>
            <DialogDescription className="text-primary-foreground/70 text-xs">
              {expandedCard === 'score' && `${prediction.confidence}% confidence`}
              {expandedCard === 'marks' && `+${markingScheme.correctMarks}/${markingScheme.incorrectMarks} scheme`}
              {expandedCard === 'rank' && `Range: ${prediction.rankRange.min.toLocaleString()}–${prediction.rankRange.max.toLocaleString()}`}
              {expandedCard === 'trend' && `Based on ${mockTests.length} tests`}
              {expandedCard === 'mcqs' && `Across all subjects`}
              {expandedCard === 'hours' && `${stats?.todayStudyMinutes ? Math.floor(stats.todayStudyMinutes / 60) : 0}h today`}
            </DialogDescription>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {expandedCard === 'score' && (
            <>
              <div className="text-center py-2">
                <p className="text-4xl font-bold text-gradient-primary">{prediction.predictedScore}/{markingScheme.totalMarks || 800}</p>
              </div>
              {scoreData.length > 0 && (
                <div className="h-40">
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
            </>
          )}

          {expandedCard === 'marks' && (
            mockTests.length > 0 ? (
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
            ) : <p className="text-center text-muted-foreground py-8 text-sm">No mock tests yet</p>
          )}

          {expandedCard === 'rank' && (
            <>
              <div className="text-center py-3">
                <p className="text-4xl font-bold">{prediction.predictedRank.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{prediction.rankRange.min.toLocaleString()} – {prediction.rankRange.max.toLocaleString()}</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Projected against ~200K candidates based on weighted recent mock scores. More tests = higher confidence.</p>
              </div>
            </>
          )}

          {expandedCard === 'trend' && (
            <>
              <div className="flex items-center justify-center gap-2 py-3">
                <TrendIcon className={`w-7 h-7 ${trendColor}`} />
                <p className={`text-2xl font-bold capitalize ${trendColor}`}>{prediction.trend}</p>
              </div>
              {scoreData.length > 0 && (
                <div className="h-40">
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
            </>
          )}

          {expandedCard === 'mcqs' && (
            <>
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
            </>
          )}

          {expandedCard === 'hours' && (
            <>
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
                  <div className="h-36">
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
            </>
          )}
        </div>
      </DialogContent>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={cardClass} onClick={() => setExpandedCard('score')}>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Predicted Score</span>
          </div>
          <p className="text-2xl font-bold text-gradient-primary">{prediction.predictedScore}/{markingScheme.totalMarks || 800}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} className={cardClass} onClick={() => setExpandedCard('marks')}>
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Predicted Marks</span>
          </div>
          {mockTests.length > 0 ? (() => {
            const r = [...mockTests].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
            const marks = r.correctAnswers * markingScheme.correctMarks + (r.attemptedQuestions - r.correctAnswers) * markingScheme.incorrectMarks + (r.totalQuestions - r.attemptedQuestions) * markingScheme.unansweredMarks;
            return <p className="text-2xl font-bold">{marks}</p>;
          })() : <p className="text-2xl font-bold text-muted-foreground">—</p>}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className={cardClass} onClick={() => setExpandedCard('rank')}>
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Predicted Rank</span>
          </div>
          <p className="text-2xl font-bold">{prediction.predictedRank.toLocaleString()}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className={cardClass} onClick={() => setExpandedCard('trend')}>
          <div className="flex items-center gap-2 mb-2">
            <TrendIcon className={`w-4 h-4 ${trendColor}`} />
            <span className="text-xs text-muted-foreground">Trend</span>
          </div>
          <p className={`text-lg font-bold capitalize ${trendColor}`}>{prediction.trend}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className={cardClass} onClick={() => setExpandedCard('mcqs')}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">MCQs Done</span>
          </div>
          <p className="text-2xl font-bold">{totalMCQs}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={cardClass} onClick={() => setExpandedCard('hours')}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Hours Studied</span>
          </div>
          <p className="text-2xl font-bold">{totalHours}h</p>
        </motion.div>
      </div>

      {/* Popup */}
      <Dialog open={!!expandedCard} onOpenChange={() => setExpandedCard(null)}>
        {renderPopupContent()}
      </Dialog>

      {/* Charts */}
      {scoreData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-6 shadow-card border border-border">
          <h3 className="font-semibold text-lg mb-4">Score Progression</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 800]} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {subjectChartData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl p-6 shadow-card border border-border">
          <h3 className="font-semibold text-lg mb-4">Subject-wise Accuracy</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(v: number) => [`${v}%`, 'Accuracy']} />
                <Bar dataKey="accuracy" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {mockTests.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl p-6 shadow-card border border-border">
          <h3 className="font-semibold text-lg mb-4">Recent Mock Tests</h3>
          <div className="space-y-2">
            {mockTests.slice(0, 5).map(test => (
              <div key={test.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                <div>
                  <p className="font-medium text-sm">{test.testName}</p>
                  <p className="text-xs text-muted-foreground">{test.source} • {new Date(test.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  {markingScheme.totalMarks || 800}className="font-bold text-gradient-primary">{test.score}/<p className="font-bold text-gradient-primary">{test.score}/{markingScheme.totalMarks || 800}ectAnswers / test.attemptedQuestions) * 100)}%</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {mockTests.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No mock tests logged yet</p>
          <p className="text-sm text-muted-foreground">Log your first mock test to see predictions</p>
        </motion.div>
      )}
    </div>
  );
}
