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
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="font-semibold text-base">{format(currentMonth, 'MMMM yyyy')}</h3>
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1.5">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
          <div key={i} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
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
                "relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all border",
                !inMonth && "text-muted-foreground/30 border-transparent",
                inMonth && !isSelected && "border-border/50 hover:border-primary/50 hover:bg-secondary/50",
                isToday(day) && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                isSelected && "bg-primary/10 border-primary shadow-sm",
                revisions.length > 0 && inMonth && "font-semibold",
              )}
            >
              <span className={cn(
                "font-medium",
                isToday(day) && "text-primary",
                isSelected && "text-primary"
              )}>
                {format(day, 'd')}
              </span>
              {revisions.length > 0 && inMonth && (
                <div className="flex gap-1 mt-1 flex-wrap justify-center">
                  {revisions.length <= 3 ? (
                    revisions.map((r, j) => (
                      <div key={j} className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        r.isOverdue ? "bg-destructive" : "bg-primary"
                      )} />
                    ))
                  ) : (
                    <>
                      <div className={cn("w-1.5 h-1.5 rounded-full", hasOverdue ? "bg-destructive" : "bg-primary")} />
                      <span className="text-[9px] text-muted-foreground font-semibold leading-none">+{revisions.length - 1}</span>
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
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-border pt-4 space-y-2"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">
              {format(new Date(selectedDate), 'EEEE, MMMM d')}
            </p>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
              {selectedRevisions.length} revision{selectedRevisions.length !== 1 ? 's' : ''}
            </span>
          </div>
          {selectedRevisions.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No revisions scheduled</p>
          ) : (
            selectedRevisions.map((r, i) => (
              <div key={i} className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs border transition-colors",
                r.isOverdue ? "bg-destructive/10 border-destructive/30" : "bg-secondary/50 border-border hover:bg-secondary"
              )}>
                <div className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  r.isOverdue ? "bg-destructive" : "bg-primary"
                )} />
                <span className="truncate flex-1 font-medium">{r.topicName}</span>
                <span className={cn(
                  "shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                  r.isOverdue ? "bg-destructive/20 text-destructive" : "bg-primary/15 text-primary"
                )}>
                  S{r.sessionNumber}
                </span>
              </div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}