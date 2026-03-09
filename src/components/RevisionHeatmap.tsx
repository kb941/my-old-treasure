import { useMemo } from 'react';
import { subWeeks, startOfWeek, addDays, format, startOfDay, isAfter, getMonth } from 'date-fns';
import { cn } from '@/lib/utils';

interface RevisionHeatmapProps {
  revisionDates: string[];
}

const CELL_SIZE = 12;
const GAP = 3;

export function RevisionHeatmap({ revisionDates }: RevisionHeatmapProps) {
  const { weeks, maxCount, totalRevisions, activeDays, monthLabels } = useMemo(() => {
    const today = startOfDay(new Date());
    const weeksToShow = 16;
    const start = startOfWeek(subWeeks(today, weeksToShow - 1), { weekStartsOn: 0 });
    
    const countMap = new Map<string, number>();
    revisionDates.forEach(dateStr => {
      const date = startOfDay(new Date(dateStr));
      const key = format(date, 'yyyy-MM-dd');
      countMap.set(key, (countMap.get(key) || 0) + 1);
    });

    const weeksData: Array<Array<{ date: Date; count: number; key: string; isInRange: boolean }>> = [];
    let currentDate = start;
    let total = 0;
    let active = 0;
    let max = 1;

    // Track month labels with column positions
    const months: { label: string; col: number }[] = [];
    let lastMonth = -1;

    for (let w = 0; w < weeksToShow; w++) {
      const week: Array<{ date: Date; count: number; key: string; isInRange: boolean }> = [];
      for (let d = 0; d < 7; d++) {
        const key = format(currentDate, 'yyyy-MM-dd');
        const count = countMap.get(key) || 0;
        const isInRange = !isAfter(currentDate, today);
        
        // Track month change on first day of week
        if (d === 0) {
          const m = getMonth(currentDate);
          if (m !== lastMonth) {
            months.push({ label: format(currentDate, 'MMM'), col: w });
            lastMonth = m;
          }
        }

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

    return { weeks: weeksData, maxCount: max, totalRevisions: total, activeDays: active, monthLabels: months };
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

  const dayLabels = ['', 'M', '', 'W', '', 'F', ''];
  const dayLabelWidth = 16;
  const gridWidth = weeks.length * (CELL_SIZE + GAP) - GAP;

  return (
    <div className="space-y-2.5 w-full">
      {/* Month labels */}
      <div className="flex" style={{ paddingLeft: dayLabelWidth + GAP }}>
        <div className="relative w-full" style={{ height: 14 }}>
          {monthLabels.map((m, i) => (
            <span
              key={i}
              className="absolute text-[10px] text-muted-foreground"
              style={{ left: m.col * (CELL_SIZE + GAP) }}
            >
              {m.label}
            </span>
          ))}
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="flex w-full">
        {/* Day labels */}
        <div className="flex flex-col shrink-0" style={{ width: dayLabelWidth, gap: GAP }}>
          {dayLabels.map((label, i) => (
            <div key={i} className="text-[9px] text-muted-foreground flex items-center justify-end pr-1" style={{ height: CELL_SIZE }}>
              {label}
            </div>
          ))}
        </div>

        {/* Grid - fills remaining space */}
        <div className="flex flex-1 justify-between" style={{ gap: GAP }}>
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col" style={{ gap: GAP }}>
              {week.map((day) => (
                <div
                  key={day.key}
                  className={cn(
                    "rounded-sm transition-colors flex-1 aspect-square",
                    getIntensityColor(day.count, day.isInRange),
                    day.isInRange && "hover:ring-1 hover:ring-foreground/30"
                  )}
                  style={{ minWidth: CELL_SIZE, minHeight: CELL_SIZE }}
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
