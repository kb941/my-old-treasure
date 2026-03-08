import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, BookOpen, Target, ArrowUp, ArrowDown } from 'lucide-react';
import { StudyLog } from '@/types';

interface WeeklyStatsProps {
  studyLogs: StudyLog[];
  mcqLogs?: { date: string; count: number }[];
}

export function WeeklyStats({ studyLogs, mcqLogs = [] }: WeeklyStatsProps) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const { thisWeekHours, lastWeekHours, weeklyChange, isPositive, totalWeekHours, totalMcqs, avgDailyHours } = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    // This week's Monday
    const thisMonday = new Date(now);
    thisMonday.setDate(now.getDate() - mondayOffset);
    thisMonday.setHours(0, 0, 0, 0);

    // Last week's Monday
    const lastMonday = new Date(thisMonday);
    lastMonday.setDate(thisMonday.getDate() - 7);

    const hoursPerDay = Array(7).fill(0);
    const lastWeekTotal = { minutes: 0 };

    studyLogs.forEach(log => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);

      if (logDate >= thisMonday) {
        const dayIdx = logDate.getDay();
        const adjustedIdx = dayIdx === 0 ? 6 : dayIdx - 1;
        hoursPerDay[adjustedIdx] += log.minutesStudied;
      } else if (logDate >= lastMonday && logDate < thisMonday) {
        lastWeekTotal.minutes += log.minutesStudied;
      }
    });

    const thisWeekMinutes = hoursPerDay.reduce((a, b) => a + b, 0);
    const lastWeekMin = lastWeekTotal.minutes;
    const change = lastWeekMin > 0 ? ((thisWeekMinutes - lastWeekMin) / lastWeekMin * 100) : 0;

    // MCQs this week
    const thisMondayStr = thisMonday.toISOString().split('T')[0];
    const weekMcqs = mcqLogs.filter(l => l.date >= thisMondayStr).reduce((s, l) => s + l.count, 0);

    const daysWithData = hoursPerDay.filter(h => h > 0).length || 1;

    return {
      thisWeekHours: hoursPerDay.map(m => +(m / 60).toFixed(1)),
      lastWeekHours: +(lastWeekMin / 60).toFixed(1),
      weeklyChange: Math.abs(Math.round(change)),
      isPositive: thisWeekMinutes >= lastWeekMin,
      totalWeekHours: +(thisWeekMinutes / 60).toFixed(1),
      totalMcqs: weekMcqs,
      avgDailyHours: +(thisWeekMinutes / 60 / daysWithData).toFixed(1),
    };
  }, [studyLogs, mcqLogs]);

  const maxHours = Math.max(...thisWeekHours, 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-card border border-border"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">This Week</h3>
        </div>
        {lastWeekHours > 0 && (
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 text-sm font-medium ${
              isPositive ? 'text-emerald-500' : 'text-destructive'
            }`}>
              {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              {weeklyChange}%
            </span>
          </div>
        )}
      </div>

      {/* Hours Chart */}
      <div className="flex items-end justify-between gap-2 h-32 mb-4">
        {thisWeekHours.map((hours, i) => {
          const height = maxHours > 0 ? (hours / maxHours) * 100 : 0;
          const isToday = i === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className={`w-full rounded-t-lg ${
                  isToday ? 'gradient-primary' : 'bg-secondary'
                }`}
                style={{ minHeight: hours > 0 ? '8px' : '0' }}
              />
              <span className={`text-xs ${isToday ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                {days[i]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <BookOpen className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-lg font-bold">{totalWeekHours}h</p>
          <p className="text-xs text-muted-foreground">Total Hours</p>
        </div>
        <div className="text-center">
          <Target className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-lg font-bold">{avgDailyHours}h</p>
          <p className="text-xs text-muted-foreground">Avg/Day</p>
        </div>
        <div className="text-center">
          <TrendingUp className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-lg font-bold">{totalMcqs}</p>
          <p className="text-xs text-muted-foreground">MCQs</p>
        </div>
      </div>
    </motion.div>
  );
}