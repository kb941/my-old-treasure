import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Trash2, Calendar, Filter, RotateCcw, Trophy, Zap, Lightbulb, Target, Clock } from 'lucide-react';
import { DismissedNotification } from '@/components/NotificationPanel';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Map notification types to icons since stored icons can't be serialized
const typeIconMap: Record<string, typeof Bell> = {
  revision: RotateCcw,
  achievement: Trophy,
  streak: Zap,
  reminder: Target,
  tip: Lightbulb,
};

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

function saveDismissedHistory(notifications: DismissedNotification[]) {
  try {
    localStorage.setItem('planos-notification-history', JSON.stringify(notifications));
  } catch (e) {
    console.warn('Failed to save notification history', e);
  }
}

export default function NotificationHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<DismissedNotification[]>(loadDismissedHistory());
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredHistory = useMemo(() => {
    let result = [...history].sort((a, b) => b.dismissedAt.getTime() - a.dismissedAt.getTime());
    
    if (typeFilter !== 'all') {
      result = result.filter(n => n.type === typeFilter);
    }
    
    return result;
  }, [history, typeFilter]);

  const groupedByDate = useMemo(() => {
    const groups: { [key: string]: DismissedNotification[] } = {};
    
    filteredHistory.forEach(notif => {
      let dateKey: string;
      if (isToday(notif.dismissedAt)) {
        dateKey = 'Today';
      } else if (isYesterday(notif.dismissedAt)) {
        dateKey = 'Yesterday';
      } else {
        dateKey = format(notif.dismissedAt, 'MMM d, yyyy');
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(notif);
    });
    
    return groups;
  }, [filteredHistory]);

  const handleClearAll = () => {
    if (confirm('Clear all notification history? This cannot be undone.')) {
      setHistory([]);
      saveDismissedHistory([]);
    }
  };

  const handleDelete = (id: string) => {
    const updated = history.filter(n => n.id !== id);
    setHistory(updated);
    saveDismissedHistory(updated);
  };

  const stats = useMemo(() => {
    const total = history.length;
    const byType = history.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { total, byType };
  }, [history]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Bell className="w-6 h-6 text-primary" />
                Notification History
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {stats.total} dismissed notification{stats.total !== 1 ? 's' : ''}
              </p>
            </div>
            {history.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear all
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types ({stats.total})</SelectItem>
                <SelectItem value="revision">Revisions ({stats.byType.revision || 0})</SelectItem>
                <SelectItem value="achievement">Achievements ({stats.byType.achievement || 0})</SelectItem>
                <SelectItem value="streak">Streaks ({stats.byType.streak || 0})</SelectItem>
                <SelectItem value="reminder">Reminders ({stats.byType.reminder || 0})</SelectItem>
                <SelectItem value="tip">Tips ({stats.byType.tip || 0})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Bell className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-base font-medium">No notifications yet</p>
            <p className="text-sm mt-1">Dismissed notifications will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByDate).map(([dateKey, notifs]) => (
              <div key={dateKey}>
                <div className="flex items-center gap-2 mb-3 sticky top-[140px] bg-background py-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {dateKey}
                  </h2>
                </div>
                <div className="space-y-2">
                  {notifs.map((notif, i) => {
                    // Use type-based icon lookup instead of serialized icon
                    const Icon = typeIconMap[notif.type] || Bell;
                    return (
                      <motion.div
                        key={`${notif.id}-${notif.dismissedAt.getTime()}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="bg-card border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                            notif.type === 'revision' ? 'bg-destructive/10' :
                            notif.type === 'achievement' ? 'bg-amber-500/10' :
                            notif.type === 'tip' ? 'bg-primary/10' :
                            'bg-primary/10'
                          )}>
                            <Icon className={cn("w-5 h-5", notif.color || 'text-primary')} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-tight">{notif.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notif.description}</p>
                            <p className="text-[10px] text-muted-foreground mt-2">
                              Dismissed {formatDistanceToNow(notif.dismissedAt, { addSuffix: true })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(notif.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
