import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen, BarChart3, FileText, User, Orbit, RotateCcw } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { StatsBar } from '@/components/StatsBar';
import { StatDetailPanel } from '@/components/StatDetailPanel';
import { KanbanBoard } from '@/components/KanbanBoard';
import { SubjectDetails } from '@/components/SubjectDetails';
import { AchievementBadge } from '@/components/AchievementBadge';
import { AchievementsBadgePanel } from '@/components/AchievementsBadgePanel';
import { AchievementsDetailView } from '@/components/AchievementsDetailView';
import { QuickLogModal, LogData } from '@/components/QuickLogModal';
import { MockTestModal, MockModalMode } from '@/components/MockTestModal';
import { MockAnalytics } from '@/components/MockAnalytics';
import { WeeklyStats } from '@/components/WeeklyStats';
import { AdvancedAnalytics } from '@/components/AdvancedAnalytics';
import { ProfileModal, ProfileData } from '@/components/ProfileModal';
import { FocusMode } from '@/components/FocusMode';
import { ContentProgressDashboard } from '@/components/ContentProgressDashboard';
import { PYQTracker, PYQSummaryCard, PYQEntry, EXAM_CONFIGS } from '@/components/PYQTracker';
import { PYQAccuracyTrends } from '@/components/PYQAccuracyTrends';
import { RevisionHub } from '@/components/RevisionHub';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BottomNav, Tab } from '@/components/BottomNav';
import { initialSubjects, mockTasks, mockStats, achievements, sampleMockTests } from '@/data/subjects';
import { defaultChapters } from '@/data/syllabusChapters';
import { TopicSearch } from '@/components/TopicSearch';
import { SyllabusProgressCard } from '@/components/SyllabusProgressCard';
import { McqWeeklyChart } from '@/components/McqWeeklyChart';
import { Task, Subject, UserStats, MockTest, Chapter, Achievement, PomodoroSettings, SpacedRepetitionSettings, DEFAULT_SR_SCHEDULES, getScheduleForConfidence, TopicStatus, ContentType, DEFAULT_CONTENT_TYPES, MarkingScheme, DEFAULT_MARKING_SCHEME, StudyLog } from '@/types';
import { RevisionReminders } from '@/components/RevisionReminders';
import { useRevisionReminders } from '@/hooks/useRevisionReminders';
import { useIsMobile } from '@/hooks/use-mobile';
import { addDays } from 'date-fns';
import { toast } from '@/hooks/use-toast';

const DEFAULT_POMODORO: PomodoroSettings = {
  studyDuration: 25, shortBreakDuration: 5, longBreakDuration: 15, sessionsBeforeLongBreak: 4,
};

const Index = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<Tab>('today');
  const [tasks, setTasks] = useLocalStorage<Task[]>('neetpg-tasks', mockTasks);
  const [subjects, setSubjects] = useLocalStorage<Subject[]>('neetpg-subjects', initialSubjects);
  const [chapters, setChapters] = useLocalStorage<Chapter[]>('neetpg-chapters', defaultChapters);
  const [stats, setStats] = useLocalStorage<UserStats>('neetpg-stats', mockStats);
  const [mockTests, setMockTests] = useLocalStorage<MockTest[]>('neetpg-mocktests', sampleMockTests);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isMockModalOpen, setIsMockModalOpen] = useState(false);
  const [mockModalMode, setMockModalMode] = useState<MockModalMode>('mock');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [examDate, setExamDate] = useLocalStorage<Date>('neetpg-examdate', new Date('2027-03-15'));
  const [examName, setExamName] = useLocalStorage<string>('neetpg-examname', 'NEET PG');
  const [targetScore, setTargetScore] = useLocalStorage<number>('neetpg-target', 650);
  const [targetRank, setTargetRank] = useLocalStorage<number>('neetpg-target-rank', 5000);
  const [pomodoroSettings, setPomodoroSettings] = useLocalStorage<PomodoroSettings>('neetpg-pomodoro', DEFAULT_POMODORO);
  const [srSettings, setSrSettings] = useLocalStorage<SpacedRepetitionSettings>('neetpg-sr', { schedules: { ...DEFAULT_SR_SCHEDULES } });
  const [contentTypes, setContentTypes] = useLocalStorage<ContentType[]>('neetpg-content-types', [...DEFAULT_CONTENT_TYPES]);
  const [breakDuration, setBreakDuration] = useLocalStorage<number>('neetpg-break-duration', 10);
  const [markingScheme, setMarkingScheme] = useLocalStorage<MarkingScheme>('neetpg-marking-scheme', { ...DEFAULT_MARKING_SCHEME });
  const [studyLogs, setStudyLogs] = useLocalStorage<StudyLog[]>('neetpg-study-logs', []);
  const [mcqLogs, setMcqLogs] = useLocalStorage<{ date: string; count: number }[]>('neetpg-mcq-logs', []);
  const [pyqYearFrom, setPyqYearFrom] = useLocalStorage<number>('neetpg-pyq-year-from', 2016);
  const [pyqYearTo, setPyqYearTo] = useLocalStorage<number>('neetpg-pyq-year-to', 2025);
  const [mcqGoalPerSubject, setMcqGoalPerSubject] = useLocalStorage<number>('neetpg-mcq-goal', 100);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);
  const [expandedStat, setExpandedStat] = useState<'xp' | 'streak' | 'study' | 'accuracy' | null>(null);

  // Migrate existing users with empty chapters to syllabus defaults
  useEffect(() => {
    if (chapters.length === 0 && defaultChapters.length > 0) {
      setChapters(defaultChapters);
    }
  }, []);

  // Migrate subjects to Short Subjects category
  const SHORT_SUBJECT_IDS = ['psychiatry', 'dermatology', 'anesthesia', 'orthopedics', 'radiology'];
  useEffect(() => {
    const needsMigration = subjects.some(s => SHORT_SUBJECT_IDS.includes(s.id) && s.category !== 'Short Subjects');
    if (needsMigration) {
      setSubjects(prev => prev.map(s => SHORT_SUBJECT_IDS.includes(s.id) ? { ...s, category: 'Short Subjects' as const } : s));
    }
  }, []);

  // Reset state and scroll to top when switching tabs
  useEffect(() => {
    setExpandedSubjectId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const { reminders, hasReminders } = useRevisionReminders(chapters);
  const [pyqData] = useLocalStorage<PYQEntry[]>('planos-pyq-tracker-v2', []);

  // Build achievements including PYQ milestones
  const pyqAchievements = useMemo((): Achievement[] => {
    const base = [...achievements];
    
    // Check PYQ milestones
    const currentYear = new Date().getFullYear();
    EXAM_CONFIGS.forEach(cfg => {
      const last3Sessions = cfg.sessions.filter(s => {
        const y = parseInt(s.match(/(\d{4})/)?.[1] || '0');
        return y >= currentYear - 2 && y <= currentYear;
      });
      const last5Sessions = cfg.sessions.filter(s => {
        const y = parseInt(s.match(/(\d{4})/)?.[1] || '0');
        return y >= currentYear - 4 && y <= currentYear;
      });
      
      const last3Done = last3Sessions.every(session => {
        const entries = pyqData.filter(e => e.exam === cfg.name && e.session === session && e.subjectId !== 'all');
        return entries.length > 0 && entries.every(e => e.done);
      });
      const last3Count = last3Sessions.filter(session => {
        const entries = pyqData.filter(e => e.exam === cfg.name && e.session === session && e.subjectId !== 'all');
        return entries.length > 0 && entries.every(e => e.done);
      }).length;

      const last5Done = last5Sessions.every(session => {
        const entries = pyqData.filter(e => e.exam === cfg.name && e.session === session && e.subjectId !== 'all');
        return entries.length > 0 && entries.every(e => e.done);
      });
      const last5Count = last5Sessions.filter(session => {
        const entries = pyqData.filter(e => e.exam === cfg.name && e.session === session && e.subjectId !== 'all');
        return entries.length > 0 && entries.every(e => e.done);
      }).length;

      base.push({
        id: `pyq-3yr-${cfg.name}`,
        name: `${cfg.name} 3Y`,
        description: `Complete last 3 years of ${cfg.name} PYQs`,
        icon: '📚',
        unlockedAt: last3Done && last3Sessions.length > 0 ? new Date() : null,
        progress: last3Count,
        target: last3Sessions.length,
      });
      base.push({
        id: `pyq-5yr-${cfg.name}`,
        name: `${cfg.name} 5Y`,
        description: `Complete last 5 years of ${cfg.name} PYQs`,
        icon: '🏅',
        unlockedAt: last5Done && last5Sessions.length > 0 ? new Date() : null,
        progress: last5Count,
        target: last5Sessions.length,
      });
    });
    
    return base;
  }, [pyqData]);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const newCompleted = !t.completed;
        if (newCompleted) {
          setStats(s => ({ ...s, totalXP: s.totalXP + 10 }));
          toast({ title: "Task completed! +10 XP 🎉" });
        }
        return { ...t, completed: newCompleted };
      }
      return t;
    }));
  };

  const handleTaskComplete = (taskId: string, duration: number) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t));
    setStats(s => ({ ...s, todayStudyMinutes: s.todayStudyMinutes + duration, totalXP: s.totalXP + 10 }));
    toast({ title: "Task completed! +10 XP 🎉", description: `Great focus for ${duration} minutes!` });
  };

  const handleLog = (data: LogData) => {
    if (data.topicId && data.chapterId) {
      setChapters(prev => prev.map(chapter => {
        if (chapter.id === data.chapterId) {
          return {
            ...chapter,
            topics: chapter.topics.map(topic => {
              if (topic.id === data.topicId) {
                return { ...topic, questionsSolved: topic.questionsSolved + (data.questionsAttempted || 0), lastStudied: new Date() };
              }
              return topic;
            })
          };
        }
        return chapter;
      }));
    }
    setStats(s => ({ ...s, todayStudyMinutes: s.todayStudyMinutes + data.duration, totalXP: s.totalXP + 10 }));
    const now = new Date();
    setStudyLogs(prev => [...prev, { date: now.toISOString().split('T')[0], minutesStudied: data.duration, hour: now.getHours() }]);
    if (data.questionsAttempted && data.questionsAttempted > 0) {
      setMcqLogs(prev => [...prev, { date: now.toISOString().split('T')[0], count: data.questionsAttempted! }]);
    }
    toast({ title: "Session logged! +10 XP", description: `${data.duration} minutes of ${data.type} added.` });
  };

  const handleLogMockTest = (mockTest: MockTest) => {
    setMockTests(prev => [mockTest, ...prev]);
    setStats(s => ({ ...s, totalXP: s.totalXP + 25 }));
    toast({ title: "Mock test logged! +25 XP 📝", description: `Score: ${mockTest.score}/${markingScheme.totalMarks || 800}` });
  };

  const handleSaveProfile = (data: ProfileData) => {
    setExamDate(data.examDate);
    setTargetScore(data.targetScore);
    if (data.targetRank !== undefined) setTargetRank(data.targetRank);
    if (data.examName) setExamName(data.examName);
    setPomodoroSettings(data.pomodoroSettings);
    if (data.srSettings) setSrSettings(data.srSettings);
    if (data.contentTypes) setContentTypes(data.contentTypes);
    if (data.breakDuration !== undefined) setBreakDuration(data.breakDuration);
    if (data.markingScheme) setMarkingScheme(data.markingScheme);
    if (data.pyqYearFrom !== undefined) setPyqYearFrom(data.pyqYearFrom);
    if (data.pyqYearTo !== undefined) setPyqYearTo(data.pyqYearTo);
    if (data.mcqGoalPerSubject !== undefined) setMcqGoalPerSubject(data.mcqGoalPerSubject);
    setSubjects(prev => prev.map(s => ({ ...s, weightage: data.subjectWeightages[s.id] || s.weightage })));
    toast({ title: "Profile updated!" });
  };

  const handleTaskDone = (taskId: string, duration: number, confidence?: number) => {
    const task = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true, column: 'done' as const } : t));
    setStats(s => ({ ...s, todayStudyMinutes: s.todayStudyMinutes + duration, totalXP: s.totalXP + 15 }));

    if (task?.topicId && task?.subjectId) {
      setChapters(prev => prev.map(chapter => {
        if (task.chapterId && chapter.id !== task.chapterId) return chapter;
        if (!task.chapterId && chapter.subjectId !== task.subjectId) return chapter;
        return {
          ...chapter,
          topics: chapter.topics.map(topic => {
            if (topic.id !== task.topicId) return topic;
            const updates: Partial<typeof topic> = {
              lastStudied: new Date(),
              ...(confidence !== undefined ? { confidence } : {}),
            };
            if (task.type === 'study') {
              const statusOrder: TopicStatus[] = ['not-started', 'main-videos', 'rr-videos', 'btr-videos', 'extra-videos'];
              const currentIdx = statusOrder.indexOf(topic.status);
              if (currentIdx < statusOrder.length - 1 && currentIdx >= 0) updates.status = statusOrder[currentIdx + 1];
              else if (topic.status === 'not-started') updates.status = 'main-videos';
            } else if (task.type === 'mcq') {
              updates.questionsSolved = topic.questionsSolved + 50;
              setMcqLogs(prev => [...prev, { date: new Date().toISOString().split('T')[0], count: 50 }]);
              if (['extra-videos', 'btr-videos', 'rr-videos', 'main-videos'].includes(topic.status)) updates.status = 'mcqs-in-progress';
            } else if (task.type === 'revision') {
              const schedule = getScheduleForConfidence(topic.confidence, srSettings);
              const nextSession = Math.min(topic.revisionSession + 1, schedule.length);
              const nextSchedule = schedule[nextSession - 1];
              updates.revisionSession = nextSession;
              updates.nextRevisionDate = nextSchedule ? addDays(new Date(), nextSchedule.daysAfterPrevious) : null;
              if (topic.status === 'pyq-done' || topic.status === 'mcqs-in-progress') updates.status = 'revision';
            }
            if (!topic.lastStudied && !topic.nextRevisionDate) {
              const schedule = getScheduleForConfidence(topic.confidence, srSettings);
              updates.nextRevisionDate = addDays(new Date(), schedule[0].daysAfterPrevious);
              updates.revisionSession = 0;
            }
            return { ...topic, ...updates };
          })
        };
      }));
    }
    toast({ title: "Task completed! +15 XP 🎉", description: `Great work for ${duration} minutes!` });
  };

  const handleCompleteRevision = (topicId: string) => {
    setChapters(prev => prev.map(chapter => ({
      ...chapter,
      topics: chapter.topics.map(topic => {
        if (topic.id !== topicId) return topic;
        const schedule = getScheduleForConfidence(topic.confidence, srSettings);
        const nextSession = Math.min(topic.revisionSession + 1, schedule.length);
        const nextSchedule = schedule[nextSession - 1];
        return {
          ...topic,
          revisionSession: nextSession,
          lastStudied: new Date(),
          nextRevisionDate: nextSchedule ? addDays(new Date(), nextSchedule.daysAfterPrevious) : null,
        };
      })
    })));
    setStats(s => ({ ...s, totalXP: s.totalXP + 15 }));
    toast({ title: "Revision done! +15 XP 🔄", description: "Next revision scheduled automatically." });
  };

  const today = new Date();
  const daysUntilExam = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const handleAddRevisionTask = (taskData: Omit<Task, 'id'>) => {
    // Prevent duplicates
    const exists = tasks.some(t => t.topicId === taskData.topicId && t.type === 'revision' && !t.completed);
    if (exists) {
      toast({ title: "Already in tasks", description: "This revision is already on your board." });
      return;
    }
    const newTask: Task = { ...taskData, id: `task-${Date.now()}` };
    setTasks(prev => [...prev, newTask]);
  };

  const handleResetAll = () => {
    const keysToRemove = [
      'neetpg-tasks', 'neetpg-subjects', 'neetpg-chapters', 'neetpg-stats',
      'neetpg-mocktests', 'neetpg-examdate', 'neetpg-examname', 'neetpg-target',
      'neetpg-pomodoro', 'neetpg-sr', 'neetpg-content-types', 'neetpg-break-duration',
      'neetpg-marking-scheme', 'neetpg-study-logs', 'planos-pyq-tracker', 'planos-user',
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));
    window.location.reload();
  };

  const handleResetSyllabus = () => {
    setChapters(defaultChapters);
    setSubjects(initialSubjects);
    toast({ title: 'Syllabus Reset', description: 'All chapters and topics restored to defaults.' });
  };

  const desktopTabs = [
    { id: 'today' as Tab, label: 'Today' },
    { id: 'subjects' as Tab, label: 'Subjects' },
    { id: 'revision' as Tab, label: 'Revision' },
    { id: 'analytics' as Tab, label: 'Insights' },
  ];

  return (
    <div className={`min-h-screen bg-background ${isMobile ? 'pb-24' : ''}`}>
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                <span className="text-gradient-primary">Plan</span> OS
                <span className="text-xs font-normal text-muted-foreground ml-1.5">{examName}</span>
              </h1>
            </div>
            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={() => setIsProfileOpen(true)} className="h-9 w-9">
                <User className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setMockModalMode('mock'); setIsMockModalOpen(true); }} className="hidden sm:flex h-8 text-xs">
                <FileText className="w-3.5 h-3.5 mr-1.5" /> Mock
              </Button>
              <Button onClick={() => setIsLogModalOpen(true)} size="sm" className="gradient-primary text-primary-foreground h-8 text-xs">
                <Plus className="w-3.5 h-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Log</span>
              </Button>
            </div>
          </div>
          {/* Prominent countdown banner */}
          <div className="flex items-center gap-2 mt-2 -mb-0.5">
            <div className="flex-1 flex items-center gap-3 bg-primary/8 rounded-lg px-3 py-2">
              <div className="text-center">
                <p className="text-lg font-bold text-primary leading-none">{daysUntilExam}</p>
                <p className="text-[9px] text-muted-foreground">days left</p>
              </div>
              <div className="w-px h-7 bg-border" />
              <div className="text-center">
                <p className="text-lg font-bold text-foreground leading-none">{targetScore}+</p>
                <p className="text-[9px] text-muted-foreground">target score</p>
              </div>
              <div className="w-px h-7 bg-border" />
              <div className="text-center">
                <p className="text-lg font-bold text-foreground leading-none">#{targetRank.toLocaleString()}</p>
                <p className="text-[9px] text-muted-foreground">target rank</p>
              </div>
            </div>
          </div>
        </div>
      </header>



      <main className="container py-4 space-y-4">
        {/* StatsBar only on Today tab */}

        {/* Desktop Tab Navigation */}
        {!isMobile && (
          <div className="flex items-center gap-1 border-b border-border">
            {desktopTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'today' && (
            <div className="space-y-4">
              <StatsBar stats={stats} onStatClick={(stat) => {
                setExpandedStat(prev => prev === stat ? null : stat);
              }} />
              {/* MCQs breakdown - single compact row */}
              {(() => {
                const today = new Date().toISOString().split('T')[0];
                const now = new Date();
                const dayOfWeek = now.getDay();
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
                const weekStartStr = weekStart.toISOString().split('T')[0];
                const todayMcqs = mcqLogs.filter(l => l.date === today).reduce((s, l) => s + l.count, 0);
                const weekMcqs = mcqLogs.filter(l => l.date >= weekStartStr).reduce((s, l) => s + l.count, 0);
                const totalMcqs = chapters.reduce((s, ch) => s + ch.topics.reduce((ts, t) => ts + t.questionsSolved, 0), 0);
                return (
                  <div className="flex items-center gap-4 bg-card rounded-xl px-4 py-2 border border-border">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">MCQs</span>
                    <div className="flex items-center gap-4 ml-auto">
                      <div className="text-center">
                        <p className="text-xs font-bold">{todayMcqs}</p>
                        <p className="text-[9px] text-muted-foreground">Today</p>
                      </div>
                      <div className="w-px h-4 bg-border" />
                      <div className="text-center">
                        <p className="text-xs font-bold">{weekMcqs}</p>
                        <p className="text-[9px] text-muted-foreground">Week</p>
                      </div>
                      <div className="w-px h-4 bg-border" />
                      <div className="text-center">
                        <p className="text-xs font-bold">{totalMcqs.toLocaleString()}</p>
                        <p className="text-[9px] text-muted-foreground">Total</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
              <StatDetailPanel
                stat={expandedStat}
                stats={stats}
                studyLogs={studyLogs}
                subjects={subjects}
                onClose={() => setExpandedStat(null)}
              />
              {hasReminders && (
                <RevisionReminders
                  reminders={reminders}
                  tasks={tasks}
                  onComplete={handleCompleteRevision}
                  onAddToTask={(reminder) => {
                    handleAddRevisionTask({
                      title: `Revise: ${reminder.topicName} (${reminder.sessionName})`,
                      type: 'revision', subjectId: reminder.subjectId, topicId: reminder.topicId,
                      chapterId: reminder.chapterId, duration: 30, completed: false,
                      column: 'today', priority: reminder.isOverdue ? 'high' : 'medium',
                    });
                  }}
                />
              )}
              <KanbanBoard
                tasks={tasks} onTasksChange={setTasks} onToggleTask={handleToggleTask}
                onTimerComplete={handleTaskComplete} onTaskDone={handleTaskDone}
                onStartFocus={(taskId) => { setFocusTaskId(taskId); setIsFocusMode(true); }}
                pomodoroSettings={pomodoroSettings} chapters={chapters}
              />
              {tasks.filter(t => t.column === 'today' && !t.completed).length > 0 && (
                <div className="flex justify-center">
                  <Button onClick={() => { setFocusTaskId(null); setIsFocusMode(true); }} className="gradient-primary text-primary-foreground shadow-card-hover px-6 py-5 text-sm rounded-xl">
                    <Orbit className="w-4 h-4 mr-2" /> Focus Mode
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'subjects' && (
            <div className="space-y-4">
              <PYQSummaryCard onNavigate={() => setActiveTab('pyqs')} />
              <SyllabusProgressCard chapters={chapters} contentTypes={contentTypes} mcqGoalPerSubject={mcqGoalPerSubject} />
              <TopicSearch
                chapters={chapters}
                subjects={subjects}
                onTopicSelect={(subjectId) => {
                  setExpandedSubjectId(subjectId);
                  setTimeout(() => {
                    document.getElementById(`subject-${subjectId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
              />
              {['Pre-clinical', 'Para-clinical', 'Clinical', 'Short Subjects'].map(category => {
                const categorySubjects = subjects.filter(s => s.category === category);
                if (categorySubjects.length === 0) return null;
                return (
                  <div key={category}>
                    <h2 className="text-base font-semibold mb-3">{category}</h2>
                    <div className="space-y-3">
                      {categorySubjects.map(subject => (
                        <div key={subject.id} id={`subject-${subject.id}`}>
                          <SubjectDetails
                            subject={subject} chapters={chapters}
                            contentTypes={contentTypes} srSettings={srSettings}
                            forceExpanded={expandedSubjectId === subject.id}
                            examName={examName}
                            onChaptersChange={(subjectId, newChapters) => {
                              setChapters(prev => [...prev.filter(c => c.subjectId !== subjectId), ...newChapters]);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'revision' && (
            <RevisionHub
              chapters={chapters} srSettings={srSettings}
              onCompleteRevision={handleCompleteRevision}
              onAddToTasks={handleAddRevisionTask} subjects={subjects}
              tasks={tasks}
            />
          )}

          {activeTab === 'pyqs' && (
            <PYQTracker subjects={subjects} pyqYearFrom={pyqYearFrom} pyqYearTo={pyqYearTo} />
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Achievements Badge Panel */}
              <AchievementsBadgePanel achievements={pyqAchievements} onViewAll={() => setActiveTab('achievements' as Tab)} />

              {/* Predictions */}
              <MockAnalytics mockTests={mockTests} markingScheme={markingScheme} stats={stats} chapters={chapters} studyLogs={studyLogs} />
              
              {/* MCQs Weekly Chart */}
              <McqWeeklyChart mcqLogs={mcqLogs} />

              {/* Content Progress */}
              <ContentProgressDashboard chapters={chapters} contentTypes={contentTypes} />
              
              {/* Advanced Analytics */}
              <AdvancedAnalytics subjects={subjects} chapters={chapters} studyLogs={studyLogs} mockTests={mockTests} />

              {/* PYQ Accuracy Trends */}
              <PYQAccuracyTrends subjects={subjects} />
              
              {/* Weekly Stats + Readiness */}
              <div className="grid lg:grid-cols-2 gap-4">
                <WeeklyStats weeklyHours={[6,7,5,8,4,9,7]} weeklyAccuracy={[72,75,68,78,71,80,74]} />
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-xl p-5 shadow-card border border-border"
                >
                  <h3 className="font-semibold text-base mb-4">Exam Readiness</h3>
                  <div className="flex items-center justify-center py-6">
                    <div className="relative">
                      <svg className="w-40 h-40 transform -rotate-90">
                        <circle cx="80" cy="80" r="72" stroke="hsl(var(--secondary))" strokeWidth="10" fill="none" />
                        <motion.circle
                          cx="80" cy="80" r="72"
                          stroke="url(#readinessGrad)" strokeWidth="10" fill="none" strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 72}
                          initial={{ strokeDashoffset: 2 * Math.PI * 72 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 72 * (1 - 0.35) }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                        <defs>
                          <linearGradient id="readinessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="hsl(230, 60%, 52%)" />
                            <stop offset="100%" stopColor="hsl(152, 60%, 42%)" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-gradient-primary">35%</span>
                        <span className="text-xs text-muted-foreground">Ready</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {/* Achievements full tab */}
          {activeTab === ('achievements' as Tab) && (
            <AchievementsDetailView achievements={pyqAchievements} onBack={() => setActiveTab('analytics')} />
          )}
        </motion.div>
      </main>

      {/* Bottom Nav (mobile only) */}
      {isMobile && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}

      {/* Modals */}
      <QuickLogModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} onLog={handleLog} onOpenMockModal={() => { setMockModalMode('mock'); setIsMockModalOpen(true); }} onOpenTestModal={() => { setMockModalMode('test'); setIsMockModalOpen(true); }} onOpenPyqMockModal={() => { setMockModalMode('pyq-mock'); setIsMockModalOpen(true); }} chapters={chapters} contentTypes={contentTypes} pyqYearFrom={pyqYearFrom} pyqYearTo={pyqYearTo} examName={examName} />
      <MockTestModal isOpen={isMockModalOpen} onClose={() => setIsMockModalOpen(false)} onLog={handleLogMockTest} mode={mockModalMode} pyqYearFrom={pyqYearFrom} pyqYearTo={pyqYearTo} />
      <ProfileModal
        isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)}
        examDate={examDate} examName={examName} targetScore={targetScore} targetRank={targetRank} subjects={subjects}
        pomodoroSettings={pomodoroSettings} srSettings={srSettings}
        contentTypes={contentTypes} breakDuration={breakDuration}
        markingScheme={markingScheme} onSave={handleSaveProfile}
        onResetAll={handleResetAll} onResetSyllabus={handleResetSyllabus}
        pyqYearFrom={pyqYearFrom} pyqYearTo={pyqYearTo}
        mcqGoalPerSubject={mcqGoalPerSubject}
      />
      <FocusMode
        isOpen={isFocusMode} onClose={() => { setIsFocusMode(false); setFocusTaskId(null); }}
        tasks={(() => {
          const todayTasks = tasks.filter(t => t.column === 'today');
          if (!focusTaskId) return todayTasks;
          const idx = todayTasks.findIndex(t => t.id === focusTaskId);
          if (idx <= 0) return todayTasks;
          return [todayTasks[idx], ...todayTasks.slice(0, idx), ...todayTasks.slice(idx + 1)];
        })()}
        pomodoroSettings={pomodoroSettings} breakDuration={breakDuration}
        onTaskDone={handleTaskDone}
      />
    </div>
  );
};

export default Index;
