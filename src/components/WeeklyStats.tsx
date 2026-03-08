import { motion } from 'framer-motion';
import { Calendar, TrendingUp, BookOpen, Target, ArrowUp, ArrowDown } from 'lucide-react';

interface WeeklyStatsProps {
  weeklyHours: number[];
  weeklyAccuracy: number[];
}

export function WeeklyStats({ weeklyHours, weeklyAccuracy }: WeeklyStatsProps) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxHours = Math.max(...weeklyHours, 8);
  const totalWeekHours = weeklyHours.reduce((a, b) => a + b, 0);
  const avgAccuracy = Math.round(weeklyAccuracy.reduce((a, b) => a + b, 0) / weeklyAccuracy.filter(a => a > 0).length) || 0;
  
  const lastWeekTotal = 42; // Mock data
  const weeklyChange = ((totalWeekHours - lastWeekTotal) / lastWeekTotal * 100).toFixed(0);
  const isPositive = totalWeekHours >= lastWeekTotal;

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
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1 text-sm font-medium ${
            isPositive ? 'text-green-500' : 'text-red-500'
          }`}>
            {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            {Math.abs(Number(weeklyChange))}%
          </span>
        </div>
      </div>

      {/* Hours Chart */}
      <div className="flex items-end justify-between gap-2 h-32 mb-4">
        {weeklyHours.map((hours, i) => {
          const height = (hours / maxHours) * 100;
          const isToday = i === new Date().getDay() - 1 || (new Date().getDay() === 0 && i === 6);
          
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
          <p className="text-lg font-bold">{avgAccuracy}%</p>
          <p className="text-xs text-muted-foreground">Avg Accuracy</p>
        </div>
        <div className="text-center">
          <TrendingUp className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-lg font-bold">56/56</p>
          <p className="text-xs text-muted-foreground">Goal</p>
        </div>
      </div>
    </motion.div>
  );
}
