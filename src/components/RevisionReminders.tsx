import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Plus, Clock, CalendarClock } from 'lucide-react';
import { RevisionReminder, Task } from '@/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';

interface RevisionRemindersProps {
  reminders: RevisionReminder[];
  tasks: Task[];
  onComplete: (topicId: string) => void;
  onAddToTask?: (reminder: RevisionReminder) => void;
  onDismiss?: (topicId: string) => void;
}

export function RevisionReminders({ reminders, tasks, onComplete, onAddToTask }: RevisionRemindersProps) {
  if (reminders.length === 0) return null;

  const isAlreadyInTasks = (topicId: string) =>
    tasks.some(t => t.topicId === topicId && t.type === 'revision' && !t.completed);

  const overdueItems = reminders.filter(r => r.isOverdue);
  const todayItems = reminders.filter(r => !r.isOverdue && !r.isDueTomorrow);
  const tomorrowItems = reminders.filter(r => r.isDueTomorrow);

  const renderItem = (reminder: RevisionReminder, index: number) => {
    const inTasks = isAlreadyInTasks(reminder.topicId);
    return (
      <motion.div
        key={reminder.topicId}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        transition={{ delay: index * 0.02 }}
        className={cn(
          "flex items-center gap-2.5 px-4 py-2 transition-colors",
          inTasks ? "opacity-60 bg-primary/5" : "hover:bg-secondary/30"
        )}
      >
        <div className={cn(
          "w-1.5 h-1.5 rounded-full shrink-0",
          reminder.isOverdue ? "bg-destructive" : reminder.isDueTomorrow ? "bg-muted-foreground" : "bg-accent"
        )} />

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{reminder.topicName}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
              {reminder.sessionName}
            </span>
            {reminder.isOverdue && (
              <span className="text-[10px] text-destructive font-medium">
                {formatDistanceToNow(reminder.dueDate)} overdue
              </span>
            )}
            {inTasks && (
              <span className="text-[10px] text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded">✓ In Tasks</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {onAddToTask && !inTasks && (
            <Button size="sm" variant="ghost" onClick={() => onAddToTask(reminder)} className="h-7 w-7 p-0" title="Add to tasks">
              <Plus className="w-3.5 h-3.5" />
            </Button>
          )}
          {!inTasks && !reminder.isDueTomorrow && (
            <Button size="sm" variant="secondary" onClick={() => onComplete(reminder.topicId)} className="h-7 px-2 text-xs">
              <Check className="w-3 h-3 mr-1" />Done
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  const renderSection = (title: string, icon: React.ReactNode, items: RevisionReminder[], colorClass: string) => {
    if (items.length === 0) return null;
    return (
      <div>
        <div className={cn("flex items-center gap-2 px-4 py-1.5 text-xs font-semibold", colorClass)}>
          {icon}
          {title} ({items.length})
        </div>
        <AnimatePresence>
          {items.map((r, i) => renderItem(r, i))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-border bg-accent/5">
        <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center">
          <Bell className="w-3.5 h-3.5 text-accent" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">Revisions Due</h3>
          <p className="text-[10px] text-muted-foreground">
            {reminders.length} topic{reminders.length > 1 ? 's' : ''} to review
          </p>
        </div>
      </div>

      <div className="divide-y divide-border/50 max-h-[320px] overflow-y-auto">
        {renderSection('Overdue', <Clock className="w-3 h-3" />, overdueItems, 'text-destructive bg-destructive/5')}
        {renderSection('Today', <Bell className="w-3 h-3" />, todayItems, 'text-accent bg-accent/5')}
        {renderSection('Tomorrow', <CalendarClock className="w-3 h-3" />, tomorrowItems, 'text-muted-foreground bg-secondary/30')}
      </div>
    </div>
  );
}
