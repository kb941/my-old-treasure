import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Check, Calendar, Clock, ChevronRight, AlertTriangle, 
  Sparkles, Plus, Star, Filter, RotateCcw, CalendarDays,
  ChevronDown, BookOpen, LayoutList, CalendarIcon, Search, X
} from 'lucide-react';
import { Chapter, Topic, SpacedRepetitionSettings, getScheduleForConfidence, Task } from '@/types';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isBefore, isToday, startOfDay, addDays, differenceInDays, isAfter } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { RevisionCalendar } from '@/components/RevisionCalendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RevisionItem {
  topicId: string;
  topicName: string;
  subjectId: string;
  chapterId: string;
  chapterName: string;
  dueDate: Date;
  sessionNumber: number;
  sessionName: string;
  isOverdue: boolean;
  isDueToday: boolean;
  confidence: number;
  revisionSession: number;
  totalSessions: number;
}

interface RevisionHubProps {
  chapters: Chapter[];
  srSettings: SpacedRepetitionSettings;
  onCompleteRevision: (topicId: string) => void;
  onAddToTasks: (task: Omit<Task, 'id'>) => void;
  subjects: { id: string; name: string }[];
  tasks?: Task[];
}

type ViewFilter = 'all' | 'overdue' | 'today' | 'week' | 'month';
type ViewMode = 'list' | 'calendar';

const PAGE_SIZE = 15;

export function RevisionHub({ chapters, srSettings, onCompleteRevision, onAddToTasks, subjects, tasks = [] }: RevisionHubProps) {
  const [filter, setFilter] = useState<ViewFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const getSubjectName = useCallback((subjectId: string) => 
    subjects.find(s => s.id === subjectId)?.name || subjectId, [subjects]);

  // Build only CURRENT revision items (no future projections for performance)
  const allRevisions = useMemo(() => {
    const items: RevisionItem[] = [];
    const today = startOfDay(new Date());

    chapters.forEach(chapter => {
      chapter.topics.forEach(topic => {
        if (!topic.nextRevisionDate) return;
        const schedule = getScheduleForConfidence(topic.confidence, srSettings);
        const dueDate = startOfDay(new Date(topic.nextRevisionDate));
        const isOverdue = isBefore(dueDate, today);
        const isDueToday = isToday(dueDate);
        const sessionInfo = schedule[topic.revisionSession] || schedule[schedule.length - 1];

        items.push({
          topicId: topic.id, topicName: topic.name, subjectId: topic.subjectId,
          chapterId: chapter.id, chapterName: chapter.name,
          dueDate: new Date(topic.nextRevisionDate),
          sessionNumber: topic.revisionSession + 1,
          sessionName: sessionInfo?.name || 'Review',
          isOverdue, isDueToday, confidence: topic.confidence,
          revisionSession: topic.revisionSession, totalSessions: schedule.length,
        });
      });
    });

    return items.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  }, [chapters, srSettings]);

  const today = startOfDay(new Date());
  const weekEnd = addDays(today, 7);
  const monthEnd = addDays(today, 30);

  const filtered = useMemo(() => {
    let result = allRevisions;
    if (selectedSubject) result = result.filter(r => r.subjectId === selectedSubject);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(r =>
        r.topicName.toLowerCase().includes(q) ||
        r.chapterName.toLowerCase().includes(q) ||
        getSubjectName(r.subjectId).toLowerCase().includes(q)
      );
    }
    switch (filter) {
      case 'overdue': return result.filter(r => r.isOverdue);
      case 'today': return result.filter(r => r.isDueToday || r.isOverdue);
      case 'week': return result.filter(r => isBefore(r.dueDate, weekEnd) || r.isOverdue);
      case 'month': return result.filter(r => isBefore(r.dueDate, monthEnd) || r.isOverdue);
      default: return result;
    }
  }, [allRevisions, filter, selectedSubject, searchQuery, getSubjectName, weekEnd, monthEnd]);

  // Reset visible count when filter changes
  const handleFilterChange = (f: ViewFilter) => {
    setFilter(f);
    setVisibleCount(PAGE_SIZE);
  };

  const groups = useMemo(() => {
    const overdue = filtered.filter(r => r.isOverdue);
    const dueToday = filtered.filter(r => r.isDueToday && !r.isOverdue);
    const thisWeek = filtered.filter(r => !r.isOverdue && !r.isDueToday && isBefore(r.dueDate, weekEnd));
    const later = filtered.filter(r => !r.isOverdue && !r.isDueToday && !isBefore(r.dueDate, weekEnd));
    return { overdue, dueToday, thisWeek, later };
  }, [filtered, weekEnd]);

  const overdueCount = allRevisions.filter(r => r.isOverdue).length;
  const todayCount = allRevisions.filter(r => r.isDueToday && !r.isOverdue).length;
  const weekCount = allRevisions.filter(r => !r.isOverdue && !r.isDueToday && isBefore(r.dueDate, weekEnd)).length;

  const isInTasks = useCallback((topicId: string) =>
    tasks.some(t => t.topicId === topicId && t.type === 'revision' && !t.completed), [tasks]);

  const handleAddToTask = useCallback((item: RevisionItem) => {
    if (isInTasks(item.topicId)) {
      toast({ title: "Already in tasks", description: "This revision is already on your board." });
      return;
    }
    onAddToTasks({
      title: `Revise - ${item.topicName} (${item.sessionName})`,
      type: 'revision', subjectId: item.subjectId, topicId: item.topicId,
      chapterId: item.chapterId, duration: 30, completed: false,
      column: item.isOverdue || item.isDueToday ? 'today' : 'week',
      priority: item.isOverdue ? 'high' : 'medium',
    });
    toast({ title: "Added to tasks!", description: `${item.topicName} revision added to your board.` });
  }, [isInTasks, onAddToTasks]);

  const filters: { id: ViewFilter; label: string; count?: number }[] = [
    { id: 'all', label: 'All' },
    { id: 'overdue', label: 'Overdue', count: overdueCount },
    { id: 'today', label: 'Today', count: todayCount },
    { id: 'week', label: 'This Week', count: weekCount },
    { id: 'month', label: 'This Month' },
  ];

  // Flatten all groups into one list for pagination
  const flatList = useMemo(() => {
    const result: { item: RevisionItem; group: string; isCurrent: boolean }[] = [];
    groups.overdue.forEach(item => result.push({ item, group: 'Overdue', isCurrent: true }));
    groups.dueToday.forEach(item => result.push({ item, group: 'Due Today', isCurrent: true }));
    groups.thisWeek.forEach(item => result.push({ item, group: 'This Week', isCurrent: true }));
    groups.later.forEach(item => result.push({ item, group: 'Upcoming', isCurrent: false }));
    return result;
  }, [groups]);

  const visibleItems = flatList.slice(0, visibleCount);
  const hasMore = visibleCount < flatList.length;

  // Group visible items by their group name for rendering
  const visibleGroups = useMemo(() => {
    const map = new Map<string, { items: RevisionItem[]; isCurrent: boolean }>();
    visibleItems.forEach(({ item, group, isCurrent }) => {
      if (!map.has(group)) map.set(group, { items: [], isCurrent });
      map.get(group)!.items.push(item);
    });
    return map;
  }, [visibleItems]);

  const groupIcons: Record<string, React.ReactNode> = {
    'Overdue': <AlertTriangle className="w-4 h-4 text-destructive" />,
    'Due Today': <Bell className="w-4 h-4 text-amber-500" />,
    'This Week': <CalendarDays className="w-4 h-4 text-primary" />,
    'Upcoming': <Calendar className="w-4 h-4 text-muted-foreground" />,
  };

  const renderRevisionCard = (item: RevisionItem, isCurrent: boolean) => (
    <div
      key={`${item.topicId}-s${item.sessionNumber}`}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl transition-colors",
        item.isOverdue ? "bg-destructive/10 border border-destructive/20"
          : item.isDueToday ? "bg-amber-500/10 border border-amber-500/20"
          : "bg-secondary/30 hover:bg-secondary/50"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
        item.isOverdue ? "bg-destructive/20 text-destructive"
          : item.isDueToday ? "bg-amber-500/20 text-amber-500"
          : item.sessionNumber >= item.totalSessions ? "bg-primary/20 text-primary"
          : "bg-primary/15 text-primary"
      )}>
        {item.isOverdue ? <AlertTriangle className="w-4 h-4" />
          : item.sessionNumber >= item.totalSessions ? <Sparkles className="w-4 h-4" />
          : <span>{item.sessionNumber}/{item.totalSessions}</span>}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{item.topicName}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
            {getSubjectName(item.subjectId)} · {item.chapterName}
          </span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
            {item.sessionName}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} className={cn("w-2.5 h-2.5", s <= item.confidence ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20")} />
            ))}
          </div>
          <span className={cn("text-[10px]", item.isOverdue ? "text-destructive font-medium" : "text-muted-foreground")}>
            {item.isOverdue ? `${formatDistanceToNow(item.dueDate)} overdue`
              : item.isDueToday ? 'Due today'
              : format(item.dueDate, 'MMM d, yyyy')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {isCurrent && !isInTasks(item.topicId) && (
          <Button size="sm" variant="secondary" onClick={() => handleAddToTask(item)} className="h-7 px-2 text-xs">
            <Plus className="w-3 h-3 mr-1" />Task
          </Button>
        )}
        {isCurrent && isInTasks(item.topicId) && (
          <span className="text-[10px] text-primary font-medium px-2">In tasks</span>
        )}
        {isCurrent && (
          <Button size="sm" onClick={() => onCompleteRevision(item.topicId)} className="h-7 px-2 text-xs">
            <Check className="w-3 h-3 mr-1" />Done
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className={cn("rounded-xl p-3 text-center border", overdueCount > 0 ? "bg-destructive/10 border-destructive/20" : "bg-card border-border")}>
          <p className={cn("text-2xl font-bold", overdueCount > 0 ? "text-destructive" : "text-foreground")}>{overdueCount}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Overdue</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl p-3 text-center border border-amber-500/20">
          <p className="text-2xl font-bold text-amber-500">{todayCount}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Due Today</p>
        </div>
        <div className="bg-primary/10 rounded-xl p-3 text-center border border-primary/20">
          <p className="text-2xl font-bold text-primary">{weekCount}</p>
          <p className="text-[10px] text-muted-foreground font-medium">This Week</p>
        </div>
      </div>

      {/* View mode toggle + filter pills + search */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1 p-0.5 bg-secondary rounded-lg shrink-0">
            <button onClick={() => setViewMode('list')} className={cn(
              "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
              viewMode === 'list' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            )}>
              <LayoutList className="w-3 h-3" /> List
            </button>
            <button onClick={() => setViewMode('calendar')} className={cn(
              "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
              viewMode === 'calendar' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            )}>
              <CalendarIcon className="w-3 h-3" /> Calendar
            </button>
          </div>

          {viewMode === 'list' && (
            <div className="flex gap-1.5 overflow-x-auto flex-1">
              {filters.map(f => (
                <button key={f.id} onClick={() => handleFilterChange(f.id)} className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                  filter === f.id ? "gradient-primary text-primary-foreground shadow-glow" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}>
                  {f.label}
                  {f.count !== undefined && f.count > 0 && (
                    <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-bold", filter === f.id ? "bg-white/20" : "bg-background")}>{f.count}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {viewMode === 'list' && (
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search topics, chapters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="w-[180px]">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Subjects</SelectItem>
                  {subjects.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {viewMode === 'calendar' ? (
        <div className="bg-card rounded-2xl p-4 shadow-card border border-border">
          <RevisionCalendar chapters={chapters} srSettings={srSettings} />
        </div>
      ) : allRevisions.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
            <RotateCcw className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No Revisions Yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Start studying topics and revisions will be automatically scheduled.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from(visibleGroups.entries()).map(([groupName, { items, isCurrent }]) => (
            <div key={groupName} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                {groupIcons[groupName]}
                <h4 className="text-sm font-semibold">{groupName}</h4>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{items.length}</span>
              </div>
              <div className="space-y-1.5">
                {items.map(item => renderRevisionCard(item, isCurrent))}
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" size="sm" onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)} className="text-xs">
                <ChevronDown className="w-3 h-3 mr-1" /> Show more ({flatList.length - visibleCount} remaining)
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          💡 Revisions auto-scheduled by confidence. Higher confidence = longer intervals.
        </p>
      </div>
    </div>
  );
}
