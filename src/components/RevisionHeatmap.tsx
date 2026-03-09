import { useMemo } from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface RevisionHeatmapProps {
  revisionDates: string[];
}

export function RevisionHeatmap({ revisionDates }: RevisionHeatmapProps) {
  const heatmapData = useMemo(() => {
    const currentMonth = new Date();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Count revisions per day
    const countMap = new Map<string, number>();
    revisionDates.forEach(dateStr => {
      const date = startOfDay(new Date(dateStr));
      const key = format(date, 'yyyy-MM-dd');
      countMap.set(key, (countMap.get(key) || 0) + 1);
    });

    // Build data array
    const data = days.map(day => {
      const key = format(day, 'yyyy-MM-dd');
      const count = countMap.get(key) || 0;
      return { date: day, count, key };
    });

    const maxCount = Math.max(...data.map(d => d.count), 1);

    return { data, maxCount };
  }, [revisionDates]);

  const getIntensityColor = (count: number, max: number) => {
    if (count === 0) return 'bg-secondary/30';
    const intensity = count / max;
    if (intensity <= 0.25) return 'bg-primary/25';
    if (intensity <= 0.5) return 'bg-primary/50';
    if (intensity <= 0.75) return 'bg-primary/75';
    return 'bg-primary';
  };

  // Group by weeks
  const weeks: typeof heatmapData.data[][] = [];
  let currentWeek: typeof heatmapData.data[] = [];
  
  heatmapData.data.forEach((day, idx) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || idx === heatmapData.data.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Revision Intensity - {format(new Date(), 'MMMM yyyy')}</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded bg-secondary/30" />
            <div className="w-3 h-3 rounded bg-primary/25" />
            <div className="w-3 h-3 rounded bg-primary/50" />
            <div className="w-3 h-3 rounded bg-primary/75" />
            <div className="w-3 h-3 rounded bg-primary" />
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="space-y-1">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex gap-1">
            {week.map((day) => (
              <div
                key={day.key}
                className={cn(
                  "flex-1 aspect-square rounded-md transition-all hover:ring-2 hover:ring-primary/50 cursor-pointer",
                  getIntensityColor(day.count, heatmapData.maxCount)
                )}
                title={`${format(day.date, 'MMM d')}: ${day.count} revision${day.count !== 1 ? 's' : ''}`}
              >
                <div className="w-full h-full flex items-center justify-center">
                  {day.count > 0 && (
                    <span className="text-[8px] font-bold text-primary-foreground opacity-80">
                      {day.count}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-border">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Total Days</p>
            <p className="text-lg font-bold text-foreground">{revisionDates.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg/Day</p>
            <p className="text-lg font-bold text-foreground">
              {revisionDates.length > 0 ? (revisionDates.length / heatmapData.data.filter(d => d.count > 0).length).toFixed(1) : '0'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Peak Day</p>
            <p className="text-lg font-bold text-foreground">{heatmapData.maxCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
