import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Chapter, SpacedRepetitionSettings, getScheduleForConfidence } from '@/types';
import { cn } from '@/lib/utils';
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  format, isSameMonth, isToday, isSameDay, addMonths, subMonths, addDays, isBefore, startOfDay
} from 'date-fns';
import { Button } from '@/components/ui/button';

interface RevisionCalendarProps {
  chapters: Chapter[];
  srSettings: SpacedRepetitionSettings;
}

interface DayRevision {
  topicName: string;
  subjectId: string;
  sessionNumber: number;
  isOverdue: boolean;
}

export function RevisionCalendar({ chapters, srSettings }: RevisionCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const revisionsByDate = useMemo(() => {
    const map = new Map<string, DayRevision[]>();
    const today = startOfDay(new Date());

    chapters.forEach(chapter => {
      chapter.topics.forEach(topic => {
        if (!topic.nextRevisionDate) return;
        const schedule = getScheduleForConfidence(topic.confidence, srSettings);
        const dueDate = startOfDay(new Date(topic.nextRevisionDate));
        const isOverdue = isBefore(dueDate, today) && !isSameDay(dueDate, today);

        // Current revision
        const key = format(dueDate, 'yyyy-MM-dd');
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push({
          topicName: topic.name,
          subjectId: topic.subjectId,
          sessionNumber: topic.revisionSession + 1,
          isOverdue,
        });

        // Future revisions
        let futureDate = new Date(topic.nextRevisionDate);
        for (let i = topic.revisionSession + 1; i < schedule.length; i++) {
          futureDate = addDays(futureDate, schedule[i].daysAfterPrevious);
          const fKey = format(futureDate, 'yyyy-MM-dd');
          if (!map.has(fKey)) map.set(fKey, []);
          map.get(fKey)!.push({
            topicName: topic.name,
            subjectId: topic.subjectId,
            sessionNumber: i + 1,
            isOverdue: false,
          });
        }
      });
    });
    return map;
  }, [chapters, srSettings]);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const selectedRevisions = selectedDate ? revisionsByDate.get(selectedDate) || [] : [];

  return (
    <div className="space-y-4">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="font-semibold text-sm">{format(currentMonth, 'MMMM yyyy')}</h3>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
        ))}

        {days.map((day, i) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const revisions = revisionsByDate.get(dateKey) || [];
          const hasOverdue = revisions.some(r => r.isOverdue);
          const isSelected = selectedDate === dateKey;
          const inMonth = isSameMonth(day, currentMonth);

          return (
            <button
              key={i}
              onClick={() => setSelectedDate(isSelected ? null : dateKey)}
              className={cn(
                "relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-all",
                !inMonth && "text-muted-foreground/30",
                isToday(day) && "ring-1 ring-primary",
                isSelected && "bg-primary/20 ring-1 ring-primary",
                revisions.length > 0 && inMonth && !isSelected && "hover:bg-secondary",
              )}
            >
              <span className={cn("font-medium", isToday(day) && "text-primary")}>
                {format(day, 'd')}
              </span>
              {revisions.length > 0 && inMonth && (
                <div className="flex gap-0.5 mt-0.5">
                  {revisions.length <= 3 ? (
                    revisions.map((r, j) => (
                      <div key={j} className={cn(
                        "w-1 h-1 rounded-full",
                        r.isOverdue ? "bg-destructive" : "bg-primary"
                      )} />
                    ))
                  ) : (
                    <>
                      <div className={cn("w-1 h-1 rounded-full", hasOverdue ? "bg-destructive" : "bg-primary")} />
                      <span className="text-[8px] text-muted-foreground leading-none">+{revisions.length}</span>
                    </>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day details */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-border pt-3 space-y-1.5"
        >
          <p className="text-xs font-medium text-muted-foreground mb-2">
            {format(new Date(selectedDate), 'EEEE, MMM d')} — {selectedRevisions.length} revision{selectedRevisions.length !== 1 ? 's' : ''}
          </p>
          {selectedRevisions.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No revisions on this day</p>
          ) : (
            selectedRevisions.map((r, i) => (
              <div key={i} className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs",
                r.isOverdue ? "bg-destructive/10" : "bg-secondary/40"
              )}>
                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", r.isOverdue ? "bg-destructive" : "bg-primary")} />
                <span className="truncate flex-1 font-medium">{r.topicName}</span>
                <span className="text-muted-foreground shrink-0">S{r.sessionNumber}</span>
              </div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}