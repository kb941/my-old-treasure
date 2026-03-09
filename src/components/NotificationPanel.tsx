import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Clock, RotateCcw, Trophy, BookOpen, Zap, Lightbulb, Target, History } from 'lucide-react';
import { RevisionReminder, Task, Achievement } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'revision' | 'achievement' | 'streak' | 'reminder' | 'tip';
  title: string;
  description: string;
  time?: Date;
  icon: typeof Bell;
  color: string;
  action?: () => void;
  actionLabel?: string;
}

export interface DismissedNotification extends Notification {
  dismissedAt: Date;
}

interface NotificationPanelProps {
  reminders: RevisionReminder[];
  achievements: Achievement[];
  streakDays: number;
  tasks: Task[];
  onCompleteRevision: (topicId: string) => void;
  onNavigateToRevision: () => void;
}

// Daily study tips that rotate
const DAILY_TIPS = [
  { title: '💡 Active recall > passive reading', desc: 'Test yourself on what you studied today — it boosts retention by 50%' },
  { title: '📊 Track your weak subjects', desc: 'Spend extra time on subjects where your accuracy is below 60%' },
  { title: '⏰ Spaced repetition works', desc: 'Revise topics at increasing intervals: 1d, 3d, 7d, 14d, 30d' },
  { title: '🎯 Quality over quantity', desc: 'Deeply understanding 50 MCQs beats rushing through 200' },
  { title: '📝 Make an error log', desc: 'Write down every wrong answer and review it weekly — patterns emerge' },
  { title: '🧠 Interleave your subjects', desc: 'Switch between subjects during study — it improves long-term retention' },
  { title: '😴 Sleep consolidates memory', desc: '7-8 hours of sleep after studying helps cement new knowledge' },
];

// Load dismissed notifications from localStorage
function loadDismissedHistory(): DismissedNotification[] {
  try {
    const stored = localStorage.getItem('planos-notification-history');
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed.map((n: any) => ({
      ...n,
      dismissedAt: new Date(n.dismissedAt),
      time: n.time ? new Date(n.time) : undefined,
    }));
  } catch {
    return [];
  }
}

// Save dismissed notifications to localStorage
function saveDismissedHistory(notifications: DismissedNotification[]) {
  try {
    // Keep only last 100 notifications
    const limited = notifications.slice(-100);
    localStorage.setItem('planos-notification-history', JSON.stringify(limited));
  } catch (e) {
    console.warn('Failed to save notification history', e);
  }
}

export function NotificationBell({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className="relative p-2 rounded-xl hover:bg-secondary/80 transition-colors">
      <Bell className="w-[18px] h-[18px] text-foreground/70" />
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center px-0.5"
        >
          {count > 9 ? '9+' : count}
        </motion.span>
      )}
    </button>
  );
}

export function NotificationPanel({ reminders, achievements, streakDays, tasks, onCompleteRevision, onNavigateToRevision }: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    // Load previously dismissed notification IDs from history
    const history = loadDismissedHistory();
    // Only keep dismissals from the last 24 hours for recurring notifications
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentIds = history
      .filter(n => new Date(n.dismissedAt).getTime() > oneDayAgo)
      .map(n => n.id);
    return new Set(recentIds);
  });
  const navigate = useNavigate();

  const notifications = useMemo((): Notification[] => {
    const items: Notification[] = [];

    // Group overdue revisions
    const overdueRevisions = reminders.filter(r => r.isOverdue);
    if (overdueRevisions.length > 0) {
      items.push({
        id: 'rev-overdue-group',
        type: 'revision',
        title: `${overdueRevisions.length} revision${overdueRevisions.length > 1 ? 's' : ''} overdue`,
        description: overdueRevisions.map(r => r.topicName).slice(0, 3).join(', ') + (overdueRevisions.length > 3 ? ` +${overdueRevisions.length - 3} more` : ''),
        icon: RotateCcw,
        color: 'text-destructive',
        action: () => onNavigateToRevision(),
        actionLabel: 'View all',
      });
    }

    // Group today's revisions (excluding those already in tasks)
    const todayRevisions = reminders.filter(r => !r.isOverdue && !r.isDueTomorrow);
    const todayNotInTasks = todayRevisions.filter(r => 
      !tasks.some(t => t.topicId === r.topicId && t.type === 'revision' && !t.completed)
    );
    if (todayNotInTasks.length > 0) {
      items.push({
        id: 'rev-today-group',
        type: 'revision',
        title: `${todayNotInTasks.length} revision${todayNotInTasks.length > 1 ? 's' : ''} due today`,
        description: todayNotInTasks.map(r => r.topicName).slice(0, 3).join(', ') + (todayNotInTasks.length > 3 ? ` +${todayNotInTasks.length - 3} more` : ''),
        icon: Clock,
        color: 'text-amber-500',
        action: () => onNavigateToRevision(),
        actionLabel: 'View',
      });
    }

    // Group tomorrow's revisions
    const tomorrowRevisions = reminders.filter(r => r.isDueTomorrow);
    if (tomorrowRevisions.length > 0) {
      items.push({
        id: 'rev-tmrw-group',
        type: 'reminder',
        title: `${tomorrowRevisions.length} revision${tomorrowRevisions.length > 1 ? 's' : ''} due tomorrow`,
        description: tomorrowRevisions.map(r => r.topicName).slice(0, 3).join(', ') + (tomorrowRevisions.length > 3 ? ` +${tomorrowRevisions.length - 3} more` : ''),
        icon: Clock,
        color: 'text-blue-500',
      });
    }

    // Recent achievements
    achievements.filter(a => a.unlockedAt).forEach(a => {
      const unlocked = new Date(a.unlockedAt!);
      const daysSince = (Date.now() - unlocked.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) {
        items.push({
          id: `ach-${a.id}`,
          type: 'achievement',
          title: `🏆 ${a.name} unlocked!`,
          description: a.description,
          time: unlocked,
          icon: Trophy,
          color: 'text-amber-500',
        });
      }
    });

    // Streak milestones
    if (streakDays > 0 && [3, 7, 14, 21, 30, 50, 100].includes(streakDays)) {
      items.push({
        id: `streak-${streakDays}`,
        type: 'streak',
        title: `🔥 ${streakDays}-day streak!`,
        description: 'Keep the momentum going!',
        icon: Zap,
        color: 'text-orange-500',
      });
    }

    // Incomplete tasks reminder
    const incompleteTodayTasks = tasks.filter(t => t.column === 'today' && !t.completed).length;
    if (incompleteTodayTasks > 0) {
      items.push({
        id: 'tasks-pending',
        type: 'reminder',
        title: `${incompleteTodayTasks} task${incompleteTodayTasks > 1 ? 's' : ''} pending today`,
        description: 'Complete your daily tasks to maintain your streak',
        icon: Target,
        color: 'text-primary',
      });
    }

    // Daily study tip (rotates based on day of year)
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const tip = DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
    items.push({
      id: `tip-${dayOfYear}`,
      type: 'tip',
      title: tip.title,
      description: tip.desc,
      icon: Lightbulb,
      color: 'text-primary',
    });

    return items.filter(n => !dismissed.has(n.id));
  }, [reminders, achievements, streakDays, tasks, dismissed, onNavigateToRevision]);

  const handleDismiss = (notif: Notification) => {
    // Add to dismissed set
    setDismissed(prev => new Set(prev).add(notif.id));
    
    // Save to history
    const history = loadDismissedHistory();
    const dismissedNotif: DismissedNotification = {
      ...notif,
      dismissedAt: new Date(),
    };
    saveDismissedHistory([...history, dismissedNotif]);
  };

  const handleMarkAllAsRead = () => {
    // Dismiss all current notifications
    notifications.forEach(notif => {
      handleDismiss(notif);
    });
  };

  const handleViewHistory = () => {
    setIsOpen(false);
    navigate('/notifications');
  };

  const count = notifications.length;

  return (
    <>
      <NotificationBell count={count} onClick={() => setIsOpen(true)} />

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="fixed inset-x-3 top-6 bottom-20 md:bottom-6 md:inset-x-auto md:right-4 md:left-auto md:w-[380px] md:top-16 z-50 bg-card rounded-2xl border border-border shadow-lg overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-card border-b border-border px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary" />
                    <h2 className="font-semibold text-base">Notifications</h2>
                    {count > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                        {count}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleViewHistory}
                      className="p-1 rounded-full hover:bg-secondary"
                      title="View history"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    {count > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                    <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-secondary">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Notifications list */}
                <div className="flex-1 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <Bell className="w-8 h-8 mb-3 opacity-30" />
                      <p className="text-sm font-medium">All caught up!</p>
                      <p className="text-xs mt-1">No new notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {notifications.map((notif, i) => {
                        const Icon = notif.icon;
                        return (
                          <motion.div
                            key={notif.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="px-4 py-3 hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                                notif.type === 'revision' ? 'bg-destructive/10' :
                                notif.type === 'achievement' ? 'bg-amber-500/10' :
                                notif.type === 'tip' ? 'bg-primary/10' :
                                'bg-primary/10'
                              )}>
                                <Icon className={cn("w-4 h-4", notif.color)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium leading-tight">{notif.title}</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">{notif.description}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  {notif.action && (
                                    <button
                                      onClick={() => { notif.action?.(); handleDismiss(notif); }}
                                      className="text-[11px] font-medium text-primary hover:underline"
                                    >
                                      {notif.actionLabel}
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDismiss(notif)}
                                    className="text-[11px] text-muted-foreground hover:text-foreground"
                                  >
                                    Dismiss
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
