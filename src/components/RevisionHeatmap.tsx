import { useMemo } from 'react';
import { subWeeks, startOfWeek, addDays, format, startOfDay, isAfter, getMonth } from 'date-fns';
import { cn } from '@/lib/utils';

interface RevisionHeatmapProps {
  revisionDates: string[];
}

const CELL = 12;
const GAP = 3;
const DAY_LABEL_W = 14;
const STRIDE = CELL + GAP;

export function RevisionHeatmap({ revisionDates }: RevisionHeatmapProps) {
  const { weeks, maxCount, totalRevisions, activeDays, monthLabels } = useMemo(() => {
    const today = startOfDay(new Date());
    const weeksToShow = 16;
    const start = startOfWeek(subWeeks(today, weeksToShow - 1), { weekStartsOn: 0 });

    const countMap = new Map<string, number>();
    revisionDates.forEach(dateStr => {
      const key = format(startOfDay(new Date(dateStr)), 'yyyy-MM-dd');
      countMap.set(key, (countMap.get(key) || 0) + 1);
    });

    const weeksData: Array<Array<{ date: Date; count: number; key: string; isInRange: boolean }>> = [];
    const months: { label: string; col: number }[] = [];
    let currentDate = start;
    let total = 0, active = 0, max = 1;
    let lastMonth = -1;

    for (let w = 0; w < weeksToShow; w++) {
      const week: Array<{ date: Date; count: number; key: string; isInRange: boolean }> = [];

      // month label when month changes at start of week
      const m = getMonth(currentDate);
      if (m !== lastMonth) {
        months.push({ label: format(currentDate, 'MMM'), col: w });
        lastMonth = m;
      }

      for (let d = 0; d < 7; d++) {
        const key = format(currentDate, 'yyyy-MM-dd');
        const count = countMap.get(key) || 0;
        const isInRange = !isAfter(currentDate, today);
        if (isInRange) { total += count; if (count > 0) active++; max = Math.max(max, count); }
        week.push({ date: currentDate, count, key, isInRange });
        currentDate = addDays(currentDate, 1);
      }
      weeksData.push(week);
    }

    return { weeks: weeksData, maxCount: max, totalRevisions: total, activeDays: active, monthLabels: months };
  }, [revisionDates]);

  const getColor = (count: number, isInRange: boolean) => {
    if (!isInRange) return 'bg-transparent';
    if (count === 0) return 'bg-muted/40';
    const r = count / maxCount;
    if (r <= 0.25) return 'bg-orange-300/60 dark:bg-orange-400/40';
    if (r <= 0.5)  return 'bg-orange-400/70 dark:bg-orange-500/60';
    if (r <= 0.75) return 'bg-orange-500/80';
    return 'bg-orange-500 dark:bg-orange-400';
  };

  const dayLabels = ['', 'M', '', 'W', '', 'F', ''];

  return (
    <div className="space-y-2 w-full">
      {/* Month labels — same left offset as grid */}
      <div style={{ paddingLeft: DAY_LABEL_W + GAP }}>
        <div className="relative" style={{ height: 14 }}>
          {monthLabels.map((m, i) => (
            <span
              key={i}
              className="absolute text-[10px] text-muted-foreground leading-none"
              style={{ left: m.col * STRIDE }}
            >
              {m.label}
            </span>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex" style={{ gap: GAP }}>
        {/* Day labels */}
        <div className="flex flex-col shrink-0" style={{ width: DAY_LABEL_W, gap: GAP }}>
          {dayLabels.map((label, i) => (
            <div
              key={i}
              className="text-[9px] text-muted-foreground flex items-center justify-end"
              style={{ height: CELL }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Week columns — fixed width cells, no justify-between */}
        <div className="flex" style={{ gap: GAP }}>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
              {week.map((day) => (
                <div
                  key={day.key}
                  className={cn(
                    'rounded-sm transition-colors',
                    getColor(day.count, day.isInRange),
                    day.isInRange && 'hover:ring-1 hover:ring-foreground/30 cursor-pointer'
                  )}
                  style={{ width: CELL, height: CELL }}
                  title={day.isInRange ? `${format(day.date, 'MMM d')}: ${day.count} revision${day.count !== 1 ? 's' : ''}` : ''}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
        <span>{activeDays} active days · {totalRevisions} total</span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          <div className="flex gap-[2px]">
            {['bg-muted/40','bg-orange-300/60','bg-orange-400/70','bg-orange-500/80','bg-orange-500'].map((c,i) => (
              <div key={i} className={cn('rounded-sm', c)} style={{ width: 10, height: 10 }} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
