import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, BookOpen, Target, ArrowUp, ArrowDown } from 'lucide-react';
import { StudyLog } from '@/types';

interface WeeklyStatsProps {
  studyLogs: StudyLog[];
  mcqLogs?: { date: string; count: number }[];
  period?: 'week' | 'month';
}

export function WeeklyStats({ studyLogs, mcqLogs = [], period = 'week' }: WeeklyStatsProps) {
  const isMonth = period === 'month';

  const { barData, barLabels, lastPeriodHours, periodChange, isPositive, totalHours, totalMcqs, avgDailyHours } = useMemo(() => {
    const now = new Date();

    if (isMonth) {
      // This month: group by week (4 weeks)
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const weekBuckets = [0, 0, 0, 0, 0]; // up to 5 weeks
      const labels: string[] = [];
      let lastMonthMinutes = 0;

      // Build week boundaries
      for (let w = 0; w < 5; w++) {
        const weekStart = new Date(monthStart);
        weekStart.setDate(monthStart.getDate() + w * 7);
        const weekEnd = new Date(monthStart);
        weekEnd.setDate(monthStart.getDate() + (w + 1) * 7 - 1);
        if (weekStart.getMonth() !== now.getMonth() && w > 0) break;
        labels.push(`W${w + 1}`);
      }

      studyLogs.forEach(log => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        if (logDate >= monthStart && logDate <= now) {
          const dayInMonth = logDate.getDate() - 1;
          const weekIdx = Math.min(Math.floor(dayInMonth / 7), 4);
          weekBuckets[weekIdx] += log.minutesStudied;
        } else if (logDate >= lastMonthStart && logDate <= lastMonthEnd) {
          lastMonthMinutes += log.minutesStudied;
        }
      });

      const thisMonthMinutes = weekBuckets.reduce((a, b) => a + b, 0);
      const change = lastMonthMinutes > 0 ? ((thisMonthMinutes - lastMonthMinutes) / lastMonthMinutes * 100) : 0;
      const daysInMonth = now.getDate();
      const daysWithData = studyLogs.filter(l => {
        const d = new Date(l.date);
        return d >= monthStart && d <= now;
      }).length || 1;

      const monthMcqStart = monthStart.toISOString().split('T')[0];
      const weekMcqs = mcqLogs.filter(l => l.date >= monthMcqStart).reduce((s, l) => s + l.count, 0);

      return {
        barData: labels.map((_, i) => +(weekBuckets[i] / 60).toFixed(1)),
        barLabels: labels,
        lastPeriodHours: +(lastMonthMinutes / 60).toFixed(1),
        periodChange: Math.abs(Math.round(change)),
        isPositive: thisMonthMinutes >= lastMonthMinutes,
        totalHours: +(thisMonthMinutes / 60).toFixed(1),
        totalMcqs: weekMcqs,
        avgDailyHours: +(thisMonthMinutes / 60 / daysWithData).toFixed(1),
      };
    } else {
      // This week (original logic)
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const thisMonday = new Date(now);
      thisMonday.setDate(now.getDate() - mondayOffset);
      thisMonday.setHours(0, 0, 0, 0);
      const lastMonday = new Date(thisMonday);
      lastMonday.setDate(thisMonday.getDate() - 7);

      const hoursPerDay = Array(7).fill(0);
      let lastWeekMinutes = 0;

      studyLogs.forEach(log => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        if (logDate >= thisMonday) {
          const dayIdx = logDate.getDay();
          const adjustedIdx = dayIdx === 0 ? 6 : dayIdx - 1;
          hoursPerDay[adjustedIdx] += log.minutesStudied;
        } else if (logDate >= lastMonday && logDate < thisMonday) {
          lastWeekMinutes += log.minutesStudied;
        }
      });

      const thisWeekMinutes = hoursPerDay.reduce((a, b) => a + b, 0);
      const change = lastWeekMinutes > 0 ? ((thisWeekMinutes - lastWeekMinutes) / lastWeekMinutes * 100) : 0;
      const thisMondayStr = thisMonday.toISOString().split('T')[0];
      const weekMcqs = mcqLogs.filter(l => l.date >= thisMondayStr).reduce((s, l) => s + l.count, 0);
      const daysWithData = hoursPerDay.filter(h => h > 0).length || 1;

      return {
        barData: hoursPerDay.map(m => +(m / 60).toFixed(1)),
        barLabels: days,
        lastPeriodHours: +(lastWeekMinutes / 60).toFixed(1),
        periodChange: Math.abs(Math.round(change)),
        isPositive: thisWeekMinutes >= lastWeekMinutes,
        totalHours: +(thisWeekMinutes / 60).toFixed(1),
        totalMcqs: weekMcqs,
        avgDailyHours: +(thisWeekMinutes / 60 / daysWithData).toFixed(1),
      };
    }
  }, [studyLogs, mcqLogs, isMonth]);

  const maxVal = Math.max(...barData, 1);
  const todayIdx = isMonth ? -1 : (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-card border border-border"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">{isMonth ? 'This Month' : 'This Week'}</h3>
        </div>
        {lastPeriodHours > 0 && (
          <span className={`flex items-center gap-1 text-sm font-medium ${
            isPositive ? 'text-emerald-500' : 'text-destructive'
          }`}>
            {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            {periodChange}%
          </span>
        )}
      </div>

      {/* Hours Chart */}
      <div className="flex items-end justify-between gap-2 h-32 mb-4">
        {barData.map((hours, i) => {
          const height = maxVal > 0 ? (hours / maxVal) * 100 : 0;
          const isToday = i === todayIdx;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className={`w-full rounded-t-lg ${isToday ? 'gradient-primary' : 'bg-secondary'}`}
                style={{ minHeight: hours > 0 ? '8px' : '0' }}
              />
              <span className={`text-xs ${isToday ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                {barLabels[i]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <BookOpen className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-lg font-bold">{totalHours}h</p>
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
