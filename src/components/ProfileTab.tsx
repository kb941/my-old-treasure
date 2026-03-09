import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Target, BookOpen, Save, Timer, Coffee, RotateCcw, Star, Plus, Trash2, Video, Hash, AlertTriangle, Moon, Sun, LogOut, Download, Upload } from 'lucide-react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Subject, PomodoroSettings, SpacedRepetitionSettings, DEFAULT_SR_SCHEDULES, ContentType, DEFAULT_CONTENT_TYPES, MarkingScheme, DEFAULT_MARKING_SCHEME } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ProfileData } from '@/components/ProfileModal';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const EXAM_WEIGHTAGES: Record<string, Record<string, { avg: number; range?: [number, number] }>> = {
  'NEET PG': {
    anatomy: { avg: 8, range: [5, 12] }, physiology: { avg: 9, range: [5, 13] }, biochemistry: { avg: 11, range: [8, 15] },
    pathology: { avg: 14, range: [10, 19] }, pharmacology: { avg: 15, range: [12, 16] }, microbiology: { avg: 13, range: [11, 16] },
    forensic: { avg: 8, range: [6, 10] }, medicine: { avg: 19, range: [16, 23] }, surgery: { avg: 19, range: [15, 27] },
    obg: { avg: 20, range: [17, 25] }, pediatrics: { avg: 9, range: [4, 14] }, psychiatry: { avg: 5, range: [2, 7] },
    dermatology: { avg: 5, range: [4, 7] }, radiology: { avg: 6, range: [2, 8] }, anesthesia: { avg: 4, range: [2, 7] },
    orthopedics: { avg: 6, range: [4, 8] }, ophthalmology: { avg: 7, range: [6, 8] }, ent: { avg: 6, range: [4, 9] },
    psm: { avg: 16, range: [12, 17] },
  },
  'INICET': {
    anatomy: { avg: 12, range: [11, 13] }, physiology: { avg: 12, range: [10, 15] }, biochemistry: { avg: 10, range: [9, 13] },
    pathology: { avg: 18, range: [12, 22] }, pharmacology: { avg: 17, range: [12, 20] }, microbiology: { avg: 15, range: [12, 19] },
    forensic: { avg: 8, range: [5, 10] }, medicine: { avg: 19, range: [14, 23] }, surgery: { avg: 16, range: [11, 22] },
    obg: { avg: 16, range: [12, 21] }, pediatrics: { avg: 8, range: [6, 12] }, psychiatry: { avg: 4, range: [3, 7] },
    dermatology: { avg: 6, range: [4, 7] }, radiology: { avg: 4, range: [3, 6] }, anesthesia: { avg: 4, range: [2, 7] },
    orthopedics: { avg: 7, range: [6, 10] }, ophthalmology: { avg: 7, range: [4, 11] }, ent: { avg: 5, range: [3, 7] },
    psm: { avg: 12, range: [8, 18] },
  },
  'FMGE': {
    anatomy: { avg: 17 }, physiology: { avg: 17 }, biochemistry: { avg: 17 }, pathology: { avg: 13 }, pharmacology: { avg: 13 },
    microbiology: { avg: 13 }, forensic: { avg: 10 }, medicine: { avg: 33 }, surgery: { avg: 32 }, obg: { avg: 30 },
    pediatrics: { avg: 15 }, psychiatry: { avg: 5 }, dermatology: { avg: 5 }, radiology: { avg: 10 }, anesthesia: { avg: 5 },
    orthopedics: { avg: 5 }, ophthalmology: { avg: 15 }, ent: { avg: 15 }, psm: { avg: 30 },
  },
};

const EXAM_MARKING: Record<string, MarkingScheme> = {
  'NEET PG': { correctMarks: 4, incorrectMarks: -1, unansweredMarks: 0, totalMarks: 800 },
  'INICET': { correctMarks: 1, incorrectMarks: -1/3, unansweredMarks: 0, totalMarks: 200 },
  'FMGE': { correctMarks: 1, incorrectMarks: 0, unansweredMarks: 0, totalMarks: 300 },
};

const EXAM_OPTIONS = ['NEET PG', 'INICET', 'FMGE'];

interface ProfileTabProps {
  examDate: Date;
  examName: string;
  targetScore: number;
  targetRank: number;
  subjects: Subject[];
  pomodoroSettings: PomodoroSettings;
  srSettings: SpacedRepetitionSettings;
  contentTypes: ContentType[];
  breakDuration: number;
  markingScheme: MarkingScheme;
  pyqYearFrom: number;
  pyqYearTo: number;
  mcqGoalPerSubject: number;
  pushNotificationSettings: PushNotificationSettings;
  onSave: (data: ProfileData) => void;
  onResetAll?: () => void;
  onResetSyllabus?: () => void;
  onClearSampleData?: () => void;
  onRecalculateReadinessFromStages?: () => void;
}

export function ProfileTab(props: ProfileTabProps) {
  const { subjects, onSave, onResetAll, onResetSyllabus, onClearSampleData, onRecalculateReadinessFromStages } = props;
  const navigate = useNavigate();

  // Initialize/reset local state from props
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const [newExamDate, setNewExamDate] = useState<Date>(props.examDate);
  const [newExamName, setNewExamName] = useState(props.examName);
  const [newTargetScore, setNewTargetScore] = useState(props.targetScore);
  const [newTargetRank, setNewTargetRank] = useState(props.targetRank);
  const [dailyStudyTarget, setDailyStudyTarget] = useState(6);
  const [weeklyMockTarget, setWeeklyMockTarget] = useState(2);
  const [weightages, setWeightages] = useState<Record<string, number>>(
    Object.fromEntries(subjects.map(s => [s.id, s.weightage]))
  );
  const [studyDuration, setStudyDuration] = useState(props.pomodoroSettings.studyDuration);
  const [shortBreakDuration, setShortBreakDuration] = useState(props.pomodoroSettings.shortBreakDuration);
  const [longBreakDuration, setLongBreakDuration] = useState(props.pomodoroSettings.longBreakDuration);
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(props.pomodoroSettings.sessionsBeforeLongBreak);
  const [breakDurationSetting, setBreakDurationSetting] = useState(props.breakDuration);
  const [localMarkingScheme, setLocalMarkingScheme] = useState<MarkingScheme>({ ...props.markingScheme });
  const [localPyqYearFrom, setLocalPyqYearFrom] = useState(props.pyqYearFrom);
  const [localPyqYearTo, setLocalPyqYearTo] = useState(props.pyqYearTo);
  const [localMcqGoal, setLocalMcqGoal] = useState(props.mcqGoalPerSubject);
  const PYQ_YEARS = Array.from({ length: 15 }, (_, i) => 2025 - i);
  const [hasChanges, setHasChanges] = useState(false);

  const [srSchedules, setSrSchedules] = useState(() => {
    const s = props.srSettings.schedules;
    const result: Record<number, typeof s[1]> = {};
    for (let i = 1; i <= 5; i++) {
      result[i] = (s[i] || DEFAULT_SR_SCHEDULES[i] || []).map(x => ({ ...x }));
    }
    return result;
  });

  const [localContentTypes, setLocalContentTypes] = useState<ContentType[]>(() =>
    props.contentTypes.map(ct => ({ ...ct }))
  );
  const [newCustomType, setNewCustomType] = useState('');

  // Reset form when props change (navigating back to profile)
  useEffect(() => {
    setNewExamDate(props.examDate);
    setNewExamName(props.examName);
    setNewTargetScore(props.targetScore);
    setNewTargetRank(props.targetRank);
    setWeightages(Object.fromEntries(subjects.map(s => [s.id, s.weightage])));
    setStudyDuration(props.pomodoroSettings.studyDuration);
    setShortBreakDuration(props.pomodoroSettings.shortBreakDuration);
    setLongBreakDuration(props.pomodoroSettings.longBreakDuration);
    setSessionsBeforeLongBreak(props.pomodoroSettings.sessionsBeforeLongBreak);
    setBreakDurationSetting(props.breakDuration);
    setLocalMarkingScheme({ ...props.markingScheme });
    setLocalPyqYearFrom(props.pyqYearFrom);
    setLocalPyqYearTo(props.pyqYearTo);
    setLocalMcqGoal(props.mcqGoalPerSubject);
    setLocalContentTypes(props.contentTypes.map(ct => ({ ...ct })));
    const s = props.srSettings.schedules;
    const result: Record<number, typeof s[1]> = {};
    for (let i = 1; i <= 5; i++) {
      result[i] = (s[i] || DEFAULT_SR_SCHEDULES[i] || []).map(x => ({ ...x }));
    }
    setSrSchedules(result);
    setHasChanges(false);
  }, [props.examDate, props.examName, props.targetScore, props.targetRank, props.pomodoroSettings, props.breakDuration, props.markingScheme, props.pyqYearFrom, props.pyqYearTo, props.mcqGoalPerSubject]);

  // Theme state
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const markChanged = () => setHasChanges(true);

  const handleExamChange = useCallback((exam: string) => {
    setNewExamName(exam);
    const ms = EXAM_MARKING[exam];
    if (ms) setLocalMarkingScheme({ ...ms });
    const w = EXAM_WEIGHTAGES[exam];
    if (w) {
      const mapped: Record<string, number> = {};
      Object.entries(w).forEach(([k, v]) => { mapped[k] = v.avg; });
      setWeightages(prev => ({ ...prev, ...mapped }));
    }
    markChanged();
  }, []);

  const handleSave = () => {
    onSave({
      examDate: newExamDate,
      examName: newExamName,
      targetScore: newTargetScore,
      targetRank: newTargetRank,
      subjectWeightages: weightages,
      dailyStudyTarget,
      weeklyMockTarget,
      pomodoroSettings: { studyDuration, shortBreakDuration, longBreakDuration, sessionsBeforeLongBreak },
      srSettings: { schedules: srSchedules },
      contentTypes: localContentTypes,
      breakDuration: breakDurationSetting,
      markingScheme: localMarkingScheme,
      pyqYearFrom: localPyqYearFrom,
      pyqYearTo: localPyqYearTo,
      mcqGoalPerSubject: localMcqGoal,
    });
    setHasChanges(false);
  };

  const updateSrDay = (tier: number, sessionIdx: number, days: number) => {
    setSrSchedules(prev => {
      const newSchedules = { ...prev };
      newSchedules[tier] = prev[tier].map((s, i) =>
        i === sessionIdx ? { ...s, daysAfterPrevious: Math.max(1, days) } : s
      );
      return newSchedules;
    });
    markChanged();
  };

  const resetSrDefaults = () => {
    const result: Record<number, typeof DEFAULT_SR_SCHEDULES[1]> = {};
    for (let i = 1; i <= 5; i++) {
      result[i] = DEFAULT_SR_SCHEDULES[i].map(x => ({ ...x }));
    }
    setSrSchedules(result);
    markChanged();
  };

  const toggleContentType = (id: string) => {
    setLocalContentTypes(prev => prev.map(ct =>
      ct.id === id && !ct.compulsory ? { ...ct, enabled: !ct.enabled } : ct
    ));
    markChanged();
  };

  const addCustomContentType = () => {
    if (!newCustomType.trim()) return;
    const id = `custom-${Date.now()}`;
    setLocalContentTypes(prev => [
      ...prev,
      { id, label: newCustomType.trim(), shortLabel: newCustomType.trim().slice(0, 4), compulsory: false, enabled: true }
    ]);
    setNewCustomType('');
    markChanged();
  };

  const removeContentType = (id: string) => {
    setLocalContentTypes(prev => prev.filter(ct => ct.id !== id || ct.compulsory));
    markChanged();
  };

  const updateWeightage = (subjectId: string, value: number) => {
    setWeightages(prev => ({ ...prev, [subjectId]: value }));
    markChanged();
  };

  const totalWeightage = Object.values(weightages).reduce((sum, w) => sum + w, 0);

  const handleLogout = () => {
    localStorage.removeItem('planos-user');
    navigate('/login');
  };

  const handleTogglePushNotifications = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setLocalPushSettings(prev => ({ ...prev, enabled: true }));
        setNotificationPermission('granted');
        markChanged();
        toast({ title: "Push notifications enabled", description: "You'll receive alerts for overdue revisions" });
      } else {
        toast({ 
          title: "Permission denied", 
          description: "Please enable notifications in your browser settings",
          variant: "destructive"
        });
        setNotificationPermission(Notification.permission);
      }
    } else {
      setLocalPushSettings(prev => ({ ...prev, enabled: false }));
      markChanged();
      toast({ title: "Push notifications disabled" });
    }
  };

  const handleExportData = () => {
    try {
      const allData: Record<string, any> = {};
      
      // Export all localStorage keys related to the app
      const keys = [
        'neetpg-tasks', 'neetpg-subjects', 'neetpg-chapters', 'neetpg-stats',
        'neetpg-mocktests', 'neetpg-examdate', 'neetpg-examname', 'neetpg-target',
        'neetpg-target-rank', 'neetpg-pomodoro', 'neetpg-sr', 'neetpg-content-types',
        'neetpg-break-duration', 'neetpg-marking-scheme', 'neetpg-study-logs',
        'neetpg-mcq-logs', 'neetpg-pyq-year-from', 'neetpg-pyq-year-to',
        'neetpg-mcq-goal', 'planos-pyq-tracker-v2', 'readiness-snapshots',
        'theme', 'planos-user'
      ];

      keys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value !== null) {
          allData[key] = value;
        }
      });

      const dataStr = JSON.stringify(allData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `planos-backup-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Data exported successfully!',
        description: 'Your backup file has been downloaded.',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Could not export data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImportFile(file);
    setShowImportConfirm(true);
    e.target.value = '';
  };

  const confirmImport = () => {
    if (!pendingImportFile) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (typeof data !== 'object' || data === null) throw new Error('Invalid format');
        Object.entries(data).forEach(([key, value]) => {
          localStorage.setItem(key, value as string);
        });
        toast({ title: 'Data imported successfully!', description: 'Reloading to apply changes...' });
        setTimeout(() => window.location.reload(), 1200);
      } catch {
        toast({ title: 'Import failed', description: 'The file is not a valid backup.', variant: 'destructive' });
      }
    };
    reader.readAsText(pendingImportFile);
    setPendingImportFile(null);
    setShowImportConfirm(false);
  };

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">Profile & Settings</h2>
              <p className="text-xs text-muted-foreground">Customize your study plan</p>
            </div>
          </div>
        </div>

        {/* Quick actions row */}
        <div className="px-4 py-3 flex items-center gap-3 border-t border-border">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors flex-1"
          >
            {dark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-500" />}
            <span className="text-xs font-medium">{dark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors"
          >
            <LogOut className="w-4 h-4 text-destructive" />
            <span className="text-xs font-medium text-destructive">Logout</span>
          </button>
        </div>
      </div>

      {/* Save banner */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-16 z-30 bg-primary text-primary-foreground rounded-xl px-4 py-3 flex items-center justify-between shadow-lg"
        >
          <span className="text-sm font-medium">You have unsaved changes</span>
          <Button size="sm" variant="secondary" onClick={handleSave} className="h-7 text-xs">
            <Save className="w-3 h-3 mr-1" /> Save
          </Button>
        </motion.div>
      )}

      {/* Settings Tabs */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <Tabs defaultValue="general">
          <TabsList className="mx-4 mt-3 grid grid-cols-4">
            <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
            <TabsTrigger value="timer" className="text-xs">Timer</TabsTrigger>
            <TabsTrigger value="revision" className="text-xs">Revision</TabsTrigger>
            <TabsTrigger value="subjects" className="text-xs">Subjects</TabsTrigger>
          </TabsList>

          {/* === General Tab === */}
          <TabsContent value="general" className="p-4 space-y-6 mt-0">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Exam Details
              </h3>
              <div className="mb-4">
                <label className="text-sm text-muted-foreground mb-1.5 block">Exam</label>
                <div className="flex gap-2">
                  {EXAM_OPTIONS.map(exam => (
                    <button
                      key={exam}
                      onClick={() => handleExamChange(exam)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                        newExamName === exam
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      {exam}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Exam Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-10 text-xs",
                          !newExamDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{newExamDate ? format(newExamDate, "dd MMM yyyy") : "Pick date"}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={newExamDate}
                        onSelect={(date) => { if (date) { setNewExamDate(date); markChanged(); } }}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Target Score</label>
                  <Input type="number" value={newTargetScore} onChange={(e) => { setNewTargetScore(Number(e.target.value)); markChanged(); }} min={0} max={localMarkingScheme.totalMarks} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Target Rank</label>
                  <Input type="number" value={newTargetRank} onChange={(e) => { setNewTargetRank(Number(e.target.value)); markChanged(); }} min={1} max={100000} placeholder="e.g. 5000" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Targets
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Study Hours/Day</label>
                  <Input type="number" value={dailyStudyTarget} onChange={(e) => { setDailyStudyTarget(Number(e.target.value)); markChanged(); }} min={1} max={16} className="h-9" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Mocks/Month</label>
                  <Input type="number" value={weeklyMockTarget} onChange={(e) => { setWeeklyMockTarget(Number(e.target.value)); markChanged(); }} min={0} max={30} className="h-9" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">MCQs/Topic Goal</label>
                  <Input type="number" value={localMcqGoal} onChange={(e) => { setLocalMcqGoal(Number(e.target.value)); markChanged(); }} min={10} max={500} step={10} className="h-9" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Hash className="w-4 h-4 text-primary" />
                Marking Scheme
                <span className="text-xs text-muted-foreground font-normal ml-auto">Auto-set by exam</span>
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Correct (+)</label>
                  <Input type="number" value={localMarkingScheme.correctMarks} onChange={(e) => { setLocalMarkingScheme(prev => ({ ...prev, correctMarks: Number(e.target.value) })); markChanged(); }} min={0} max={10} step={0.5} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Incorrect (−)</label>
                  <Input type="number" value={localMarkingScheme.incorrectMarks} onChange={(e) => { setLocalMarkingScheme(prev => ({ ...prev, incorrectMarks: Number(e.target.value) })); markChanged(); }} min={-10} max={0} step={0.5} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Unanswered</label>
                  <Input type="number" value={localMarkingScheme.unansweredMarks} onChange={(e) => { setLocalMarkingScheme(prev => ({ ...prev, unansweredMarks: Number(e.target.value) })); markChanged(); }} min={-5} max={0} step={0.5} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Total Marks</label>
                  <Input type="number" value={localMarkingScheme.totalMarks} onChange={(e) => { setLocalMarkingScheme(prev => ({ ...prev, totalMarks: Number(e.target.value) })); markChanged(); }} min={100} max={1600} step={50} />
                </div>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Total: {localMarkingScheme.totalMarks} marks · Example: 150✓, 40✗, 10 skip → <span className="text-primary font-semibold">
                  {Math.round(150 * localMarkingScheme.correctMarks + 40 * localMarkingScheme.incorrectMarks + 10 * localMarkingScheme.unansweredMarks)}/{localMarkingScheme.totalMarks}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                PYQ Year Range
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">From Year</label>
                  <select value={localPyqYearFrom} onChange={(e) => { setLocalPyqYearFrom(Number(e.target.value)); markChanged(); }} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    {PYQ_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">To Year</label>
                  <select value={localPyqYearTo} onChange={(e) => { setLocalPyqYearTo(Number(e.target.value)); markChanged(); }} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    {PYQ_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Video className="w-4 h-4 text-primary" />
                Content Types
              </h3>
              <p className="text-xs text-muted-foreground">Choose which stages to track per topic.</p>
              <div className="space-y-2">
                {localContentTypes.map(ct => (
                  <div key={ct.id} className="flex items-center gap-3 bg-secondary/30 rounded-lg p-2">
                    <button
                      onClick={() => toggleContentType(ct.id)}
                      disabled={ct.compulsory}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        ct.enabled ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                      } ${ct.compulsory ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {ct.enabled && <span className="text-primary-foreground text-xs">✓</span>}
                    </button>
                    <span className="flex-1 text-sm">{ct.label}</span>
                    {ct.compulsory && <span className="text-xs text-muted-foreground">Required</span>}
                    {!ct.compulsory && !DEFAULT_CONTENT_TYPES.find(d => d.id === ct.id) && (
                      <button onClick={() => removeContentType(ct.id)} className="p-1 hover:bg-destructive/10 rounded">
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input value={newCustomType} onChange={(e) => setNewCustomType(e.target.value)} placeholder="Add custom type..." className="h-8 text-sm" onKeyDown={(e) => e.key === 'Enter' && addCustomContentType()} />
                <Button size="sm" variant="outline" onClick={addCustomContentType} className="h-8">
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Data Management */}
            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="font-semibold flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-amber-500" />
                Clear Sample Data
              </h3>
              <Button variant="outline" className="w-full border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10" onClick={() => onClearSampleData?.()}>
                <Trash2 className="w-4 h-4 mr-2" /> Clear Mock Tests & Reset Stats
              </Button>
              <p className="text-xs text-muted-foreground">Removes sample mock tests and resets stats to zero.</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="font-semibold flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-primary" />
                Syllabus Data
              </h3>
              <Button variant="outline" className="w-full" onClick={() => onResetSyllabus?.()}>
                <RotateCcw className="w-4 h-4 mr-2" /> Reset to Default Syllabus
              </Button>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="font-semibold flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-primary" />
                Repair Readiness (Legacy)
              </h3>
              <Button
                variant="outline"
                className="w-full"
                disabled={!onRecalculateReadinessFromStages}
                onClick={() => onRecalculateReadinessFromStages?.()}
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Recalculate from topic stages
              </Button>
              <p className="text-xs text-muted-foreground">
                Syncs MCQ/PYQ completion fields from your existing topic checkmarks (no data is deleted).
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="font-semibold flex items-center gap-2">
                <Download className="w-4 h-4 text-primary" />
                Export Data
              </h3>
              <Button variant="outline" className="w-full" onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" /> Download Full Backup
              </Button>
              <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImportData} />
              <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" /> Import Backup
              </Button>
              <p className="text-xs text-muted-foreground">
                Export or import all your data (tasks, chapters, stats, mock tests) as JSON for backup or migration.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="font-semibold flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-4 h-4" />
                Danger Zone
              </h3>
              {!showResetConfirm ? (
                <Button variant="outline" className="w-full border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => setShowResetConfirm(true)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Reset All Data
                </Button>
              ) : (
                <div className="p-3 bg-destructive/10 rounded-xl space-y-3">
                  <p className="text-sm text-destructive font-medium">This will permanently delete all your data. Cannot be undone.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowResetConfirm(false)}>Cancel</Button>
                    <Button variant="destructive" size="sm" className="flex-1" onClick={() => { onResetAll?.(); setShowResetConfirm(false); }}>Yes, Reset Everything</Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* === Timer Tab === */}
          <TabsContent value="timer" className="p-4 space-y-6 mt-0">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Timer className="w-4 h-4 text-primary" />
                Pomodoro Timer
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Study (min)</label>
                  <Input type="number" value={studyDuration} onChange={(e) => { setStudyDuration(Number(e.target.value)); markChanged(); }} min={5} max={90} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Short Break (min)</label>
                  <Input type="number" value={shortBreakDuration} onChange={(e) => { setShortBreakDuration(Number(e.target.value)); markChanged(); }} min={1} max={30} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Long Break (min)</label>
                  <Input type="number" value={longBreakDuration} onChange={(e) => { setLongBreakDuration(Number(e.target.value)); markChanged(); }} min={5} max={60} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Sessions for Long Break</label>
                  <Input type="number" value={sessionsBeforeLongBreak} onChange={(e) => { setSessionsBeforeLongBreak(Number(e.target.value)); markChanged(); }} min={2} max={8} />
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                <Coffee className="w-4 h-4 text-amber-500" />
                <p className="text-xs text-muted-foreground">
                  After {sessionsBeforeLongBreak} sessions ({studyDuration * sessionsBeforeLongBreak}min), take a {longBreakDuration}min break
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Coffee className="w-4 h-4 text-primary" />
                Focus Mode Break
              </h3>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Default Break Duration (min)</label>
                <Input type="number" value={breakDurationSetting} onChange={(e) => { setBreakDurationSetting(Number(e.target.value)); markChanged(); }} min={1} max={60} />
              </div>
            </div>
          </TabsContent>

          {/* === Revision Tab === */}
          <TabsContent value="revision" className="p-4 space-y-6 mt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-primary" />
                  Spaced Repetition
                </h3>
                <Button variant="ghost" size="sm" onClick={resetSrDefaults} className="text-xs">Reset Defaults</Button>
              </div>
              <p className="text-xs text-muted-foreground">Configure revision intervals based on confidence level.</p>
              {([1, 2, 3, 4, 5] as const).map(tier => (
                <div key={tier} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-3 h-3 ${s <= tier ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{tier} Star{tier > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(srSchedules[tier] || []).map((session, idx) => (
                      <div key={idx} className="flex items-center gap-1 bg-secondary/30 rounded-lg px-2 py-1">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{session.name}:</span>
                        <Input type="number" value={session.daysAfterPrevious} onChange={(e) => updateSrDay(tier, idx, Number(e.target.value))} className="w-12 h-6 text-center text-xs p-0" min={1} max={120} />
                        <span className="text-xs text-muted-foreground">d</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* === Subjects Tab === */}
          <TabsContent value="subjects" className="p-4 space-y-4 mt-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Subject Weightages
              </h3>
              <span className={`text-sm font-medium ${totalWeightage === (EXAM_MARKING[newExamName]?.totalMarks === 300 ? 300 : 200) ? 'text-green-500' : 'text-amber-500'}`}>
                Total: {totalWeightage}/{EXAM_MARKING[newExamName]?.totalMarks === 300 ? 300 : 200}
              </span>
            </div>
            <div className="space-y-2">
              {['Pre-clinical', 'Para-clinical', 'Clinical', 'Short Subjects'].map(category => (
                <div key={category} className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-2">{category}</p>
                  {subjects
                    .filter(s => s.category === category)
                    .map(subject => (
                      <div key={subject.id} className="flex items-center gap-2 bg-secondary/30 rounded-lg p-2">
                        <span className="flex-1 text-sm truncate">{subject.name}</span>
                        {(() => {
                          const info = EXAM_WEIGHTAGES[newExamName]?.[subject.id];
                          return info?.range ? (
                            <span className="text-[10px] text-muted-foreground shrink-0">({info.range[0]}–{info.range[1]})</span>
                          ) : null;
                        })()}
                        <Input
                          type="number"
                          value={weightages[subject.id] || 0}
                          onChange={(e) => updateWeightage(subject.id, Number(e.target.value))}
                          className="w-14 h-7 text-center text-xs"
                          min={0} max={50}
                        />
                        <span className="text-xs text-muted-foreground w-3">Q</span>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Save Button - always visible at bottom */}
        <div className="p-4 border-t border-border">
          <Button onClick={handleSave} className="w-full gradient-primary text-primary-foreground" disabled={!hasChanges}>
            <Save className="w-4 h-4 mr-2" />
            {hasChanges ? 'Save Changes' : 'All Saved'}
          </Button>
        </div>
      </div>

      {/* Import Confirmation Dialog */}
      <AlertDialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Import Data - Overwrite Warning
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will overwrite all your current data with the backup file. Your existing progress, tasks, and settings will be replaced.
              <br /><br />
              <strong>This action cannot be undone.</strong> Make sure you have a recent backup before proceeding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowImportConfirm(false);
              setPendingImportFile(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Import & Overwrite
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
