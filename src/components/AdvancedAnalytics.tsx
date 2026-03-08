import { motion } from 'framer-motion';
import { AlertTriangle, Clock, Flame } from 'lucide-react';
import { Subject, Chapter, StudyLog, MockTest } from '@/types';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

interface AdvancedAnalyticsProps {
  subjects: Subject[];
  chapters: Chapter[];
  studyLogs: StudyLog[];
  mockTests: MockTest[];
}

export function AdvancedAnalytics({ subjects, chapters, studyLogs, mockTests }: AdvancedAnalyticsProps) {
  // === Subject-wise Radar Chart ===
  const radarData = subjects.slice(0, 10).map(s => {
    const subjectChapters = chapters.filter(c => c.subjectId === s.id);
    const totalTopics = subjectChapters.reduce((sum, ch) => sum + ch.topics.length, 0);
    const completedStages = subjectChapters.reduce((sum, ch) =>
      sum + ch.topics.reduce((ts, t) => ts + (t.completedStages || []).length, 0), 0
    );
    const maxStages = totalTopics * 6;
    const progress = maxStages > 0 ? Math.round((completedStages / maxStages) * 100) : 0;

    return {
      subject: s.name.length > 10 ? s.name.slice(0, 10) + '…' : s.name,
      progress,
      accuracy: s.accuracy,
    };
  });

  // === Study Heatmap (last 7 days) ===
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLogs = studyLogs.filter(l => l.date === dateStr);
    const totalMin = dayLogs.reduce((sum, l) => sum + l.minutesStudied, 0);
    return {
      date: dateStr,
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()],
      minutes: totalMin,
      hours: +(totalMin / 60).toFixed(1),
    };
  });
  const maxMinutes = Math.max(...last7Days.map(d => d.minutes), 60);

  const getHeatColor = (minutes: number) => {
    if (minutes === 0) return 'bg-secondary';
    const intensity = Math.min(minutes / maxMinutes, 1);
    if (intensity < 0.25) return 'bg-primary/20';
    if (intensity < 0.5) return 'bg-primary/40';
    if (intensity < 0.75) return 'bg-primary/70';
    return 'bg-primary';
  };

  // === Weak Areas (<60% accuracy) ===
  const weakTopics = chapters.flatMap(ch =>
    ch.topics
      .filter(t => {
        if (t.questionsSolved < 5) return false;
        const accuracy = t.questionsSolved > 0 ? (t.confidence / 5) * 100 : 0;
        return accuracy < 60;
      })
      .map(t => ({
        id: t.id,
        name: t.name,
        subjectName: subjects.find(s => s.id === t.subjectId)?.name || 'Unknown',
        confidence: t.confidence,
        questionsSolved: t.questionsSolved,
      }))
  ).slice(0, 8);

  // === Time of Day Productivity ===
  const hourBuckets: Record<string, number> = {
    'Early (5-8)': 0, 'Morning (8-12)': 0, 'Afternoon (12-16)': 0,
    'Evening (16-20)': 0, 'Night (20-24)': 0, 'Late (0-5)': 0,
  };
  studyLogs.forEach(log => {
    const h = log.hour;
    if (h >= 5 && h < 8) hourBuckets['Early (5-8)'] += log.minutesStudied;
    else if (h >= 8 && h < 12) hourBuckets['Morning (8-12)'] += log.minutesStudied;
    else if (h >= 12 && h < 16) hourBuckets['Afternoon (12-16)'] += log.minutesStudied;
    else if (h >= 16 && h < 20) hourBuckets['Evening (16-20)'] += log.minutesStudied;
    else if (h >= 20) hourBuckets['Night (20-24)'] += log.minutesStudied;
    else hourBuckets['Late (0-5)'] += log.minutesStudied;
  });
  const productivityData = Object.entries(hourBuckets).map(([time, minutes]) => ({
    time: time.split(' ')[0],
    fullLabel: time,
    hours: +(minutes / 60).toFixed(1),
  }));
  const bestTime = productivityData.reduce((a, b) => a.hours > b.hours ? a : b, productivityData[0]);

  return (
    <div className="space-y-6">
      {/* Row 1: Radar + Heatmap */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 shadow-card border border-border"
        >
          <h3 className="font-semibold text-lg mb-4">Subject Performance</h3>
          {radarData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="Progress" dataKey="progress" stroke="hsl(174, 72%, 50%)" fill="hsl(174, 72%, 50%)" fillOpacity={0.3} strokeWidth={2} />
                  <Radar name="Accuracy" dataKey="accuracy" stroke="hsl(262, 83%, 62%)" fill="hsl(262, 83%, 62%)" fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">Add subjects and topics to see the radar chart</p>
          )}
        </motion.div>

        {/* Study Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-6 shadow-card border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" />
              Study Heatmap
            </h3>
            <span className="text-xs text-muted-foreground">Last 7 days</span>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {last7Days.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-xs text-muted-foreground">{day.day}</span>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`w-full aspect-square rounded-lg ${getHeatColor(day.minutes)} flex items-center justify-center`}
                >
                  <span className="text-xs font-medium">{day.hours}h</span>
                </motion.div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              {['bg-secondary', 'bg-primary/20', 'bg-primary/40', 'bg-primary/70', 'bg-primary'].map((c, i) => (
                <div key={i} className={`w-4 h-4 rounded ${c}`} />
              ))}
            </div>
            <span>More</span>
          </div>
        </motion.div>
      </div>

      {/* Row 2: Weak Areas + Time of Day */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weak Areas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-6 shadow-card border border-border"
        >
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Weak Areas
          </h3>
          {weakTopics.length > 0 ? (
            <div className="space-y-2">
              {weakTopics.map((topic, i) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/10"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{topic.name}</p>
                    <p className="text-xs text-muted-foreground">{topic.subjectName}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <div
                        key={s}
                        className={`w-2 h-2 rounded-full ${s <= topic.confidence ? 'bg-destructive' : 'bg-secondary'}`}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No weak areas detected. Keep studying! 💪
            </p>
          )}
        </motion.div>

        {/* Time of Day Productivity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-6 shadow-card border border-border"
        >
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Best Study Times
          </h3>
          {bestTime && bestTime.hours > 0 && (
            <p className="text-xs text-muted-foreground mb-4">
              You're most productive during <span className="text-primary font-medium">{bestTime.fullLabel}</span>
            </p>
          )}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} unit="h" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value}h`, 'Study Time']}
                />
                <Bar dataKey="hours" fill="hsl(174, 72%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}