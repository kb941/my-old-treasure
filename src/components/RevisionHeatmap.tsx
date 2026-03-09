import { useMemo } from 'react';
import { subWeeks, startOfWeek, addDays, format, startOfDay, isBefore, isAfter } from 'date-fns';
import { cn } from '@/lib/utils';

interface RevisionHeatmapProps {
  revisionDates: string[];
}

export function RevisionHeatmap({ revisionDates }: RevisionHeatmapProps) {
  const { weeks, maxCount, totalRevisions, activeDays } = useMemo(() => {
    const today = startOfDay(new Date());
    const weeksToShow = 12; // ~3 months
    const start = startOfWeek(subWeeks(today, weeksToShow - 1), { weekStartsOn: 0 });
    
    // Count revisions per day
    const countMap = new Map<string, number>();
    revisionDates.forEach(dateStr => {
      const date = startOfDay(new Date(dateStr));
      const key = format(date, 'yyyy-MM-dd');
      countMap.set(key, (countMap.get(key) || 0) + 1);
    });

    // Build weeks array (columns) with 7 days each (rows)
    const weeksData: Array<Array<{ date: Date; count: number; key: string; isInRange: boolean }>> = [];
    let currentDate = start;
    let total = 0;
    let active = 0;
    let max = 1;

    for (let w = 0; w < weeksToShow; w++) {
      const week: Array<{ date: Date; count: number; key: string; isInRange: boolean }> = [];
      for (let d = 0; d < 7; d++) {
        const key = format(currentDate, 'yyyy-MM-dd');
        const count = countMap.get(key) || 0;
        const isInRange = !isAfter(currentDate, today);
        
        if (isInRange) {
          total += count;
          if (count > 0) active++;
          max = Math.max(max, count);
        }
        
        week.push({ date: currentDate, count, key, isInRange });
        currentDate = addDays(currentDate, 1);
      }
      weeksData.push(week);
    }

    return { weeks: weeksData, maxCount: max, totalRevisions: total, activeDays: active };
  }, [revisionDates]);

  const getIntensityColor = (count: number, isInRange: boolean) => {
    if (!isInRange) return 'bg-transparent';
    if (count === 0) return 'bg-muted/40';
    const intensity = count / maxCount;
    if (intensity <= 0.25) return 'bg-orange-300/60 dark:bg-orange-400/40';
    if (intensity <= 0.5) return 'bg-orange-400/70 dark:bg-orange-500/60';
    if (intensity <= 0.75) return 'bg-orange-500/80 dark:bg-orange-500/80';
    return 'bg-orange-500 dark:bg-orange-400';
  };

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="space-y-3">
      {/* Heatmap grid */}
      <div className="flex gap-1">
        {/* Day labels column */}
        <div className="flex flex-col gap-[3px] pr-1">
          {dayLabels.map((label, i) => (
            <div key={i} className="h-[10px] w-3 text-[8px] text-muted-foreground flex items-center justify-end">
              {i % 2 === 1 ? label : ''}
            </div>
          ))}
        </div>
        
        {/* Weeks columns */}
        <div className="flex gap-[3px] overflow-x-auto">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <div
                  key={day.key}
                  className={cn(
                    "w-[10px] h-[10px] rounded-sm transition-colors",
                    getIntensityColor(day.count, day.isInRange),
                    day.isInRange && "hover:ring-1 hover:ring-foreground/30"
                  )}
                  title={day.isInRange ? `${format(day.date, 'MMM d')}: ${day.count} revision${day.count !== 1 ? 's' : ''}` : ''}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{activeDays} active days · {totalRevisions} total</span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          <div className="flex gap-[2px]">
            <div className="w-[10px] h-[10px] rounded-sm bg-muted/40" />
            <div className="w-[10px] h-[10px] rounded-sm bg-orange-300/60 dark:bg-orange-400/40" />
            <div className="w-[10px] h-[10px] rounded-sm bg-orange-400/70 dark:bg-orange-500/60" />
            <div className="w-[10px] h-[10px] rounded-sm bg-orange-500/80 dark:bg-orange-500/80" />
            <div className="w-[10px] h-[10px] rounded-sm bg-orange-500 dark:bg-orange-400" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
