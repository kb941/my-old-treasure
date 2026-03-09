import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Calendar, Target, BookOpen, Save, Timer, Coffee, RotateCcw, Star, Plus, Trash2, Video, Hash, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Subject, PomodoroSettings, SpacedRepetitionSettings, DEFAULT_SR_SCHEDULES, ContentType, DEFAULT_CONTENT_TYPES, MarkingScheme, DEFAULT_MARKING_SCHEME } from '@/types';
import { PushNotificationSettings } from '@/hooks/usePushNotifications';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Exam-specific weightages (avg questions per subject)
// { avg, range: [min, max] }
type WeightageInfo = { avg: number; range?: [number, number] };
const EXAM_WEIGHTAGES: Record<string, Record<string, WeightageInfo>> = {
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

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  onSave: (data: ProfileData) => void;
  onResetAll?: () => void;
  onResetSyllabus?: () => void;
  onClearSampleData?: () => void;
}

export interface ProfileData {
  examDate: Date;
  examName?: string;
  targetScore: number;
  targetRank?: number;
  subjectWeightages: Record<string, number>;
  dailyStudyTarget: number;
  weeklyMockTarget: number;
  pomodoroSettings: PomodoroSettings;
  srSettings: SpacedRepetitionSettings;
  contentTypes: ContentType[];
  breakDuration: number;
  markingScheme: MarkingScheme;
  pyqYearFrom?: number;
  pyqYearTo?: number;
  mcqGoalPerSubject?: number;
  pushNotificationSettings?: PushNotificationSettings;
}

export function ProfileModal({ 
  isOpen, onClose, examDate, examName, targetScore, targetRank, subjects, pomodoroSettings,
  srSettings, contentTypes, breakDuration, markingScheme, pyqYearFrom, pyqYearTo, mcqGoalPerSubject, onSave, onResetAll, onResetSyllabus, onClearSampleData
}: ProfileModalProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [newExamDate, setNewExamDate] = useState<Date>(examDate);
  const [newExamName, setNewExamName] = useState(examName);
  const [newTargetScore, setNewTargetScore] = useState(targetScore);
  const [newTargetRank, setNewTargetRank] = useState(targetRank);
  const [dailyStudyTarget, setDailyStudyTarget] = useState(6);
  const [weeklyMockTarget, setWeeklyMockTarget] = useState(2);
  const [weightages, setWeightages] = useState<Record<string, number>>(
    Object.fromEntries(subjects.map(s => [s.id, s.weightage]))
  );
  const [studyDuration, setStudyDuration] = useState(pomodoroSettings.studyDuration);
  const [shortBreakDuration, setShortBreakDuration] = useState(pomodoroSettings.shortBreakDuration);
  const [longBreakDuration, setLongBreakDuration] = useState(pomodoroSettings.longBreakDuration);
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(pomodoroSettings.sessionsBeforeLongBreak);
  const [breakDurationSetting, setBreakDurationSetting] = useState(breakDuration);
  const [localMarkingScheme, setLocalMarkingScheme] = useState<MarkingScheme>({ ...markingScheme });
  const [localPyqYearFrom, setLocalPyqYearFrom] = useState(pyqYearFrom);
  const [localPyqYearTo, setLocalPyqYearTo] = useState(pyqYearTo);
  const [localMcqGoal, setLocalMcqGoal] = useState(mcqGoalPerSubject);
  const PYQ_YEARS = Array.from({ length: 15 }, (_, i) => 2025 - i);

  const [srSchedules, setSrSchedules] = useState(() => {
    const s = srSettings.schedules;
    const result: Record<number, typeof s[1]> = {};
    for (let i = 1; i <= 5; i++) {
      result[i] = (s[i] || DEFAULT_SR_SCHEDULES[i] || []).map(x => ({ ...x }));
    }
    return result;
  });

  const [localContentTypes, setLocalContentTypes] = useState<ContentType[]>(() =>
    contentTypes.map(ct => ({ ...ct }))
  );
  const [newCustomType, setNewCustomType] = useState('');

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
    onClose();
  };

  const updateSrDay = (tier: number, sessionIdx: number, days: number) => {
    setSrSchedules(prev => {
      const newSchedules = { ...prev };
      newSchedules[tier] = prev[tier].map((s, i) =>
        i === sessionIdx ? { ...s, daysAfterPrevious: Math.max(1, days) } : s
      );
      return newSchedules;
    });
  };

  const resetSrDefaults = () => {
    const result: Record<number, typeof DEFAULT_SR_SCHEDULES[1]> = {};
    for (let i = 1; i <= 5; i++) {
      result[i] = DEFAULT_SR_SCHEDULES[i].map(x => ({ ...x }));
    }
    setSrSchedules(result);
  };

  const toggleContentType = (id: string) => {
    setLocalContentTypes(prev => prev.map(ct =>
      ct.id === id && !ct.compulsory ? { ...ct, enabled: !ct.enabled } : ct
    ));
  };

  const addCustomContentType = () => {
    if (!newCustomType.trim()) return;
    const id = `custom-${Date.now()}`;
    setLocalContentTypes(prev => [
      ...prev,
      { id, label: newCustomType.trim(), shortLabel: newCustomType.trim().slice(0, 4), compulsory: false, enabled: true }
    ]);
    setNewCustomType('');
  };

  const removeContentType = (id: string) => {
    setLocalContentTypes(prev => prev.filter(ct => ct.id !== id || ct.compulsory));
  };

  const updateWeightage = (subjectId: string, value: number) => {
    setWeightages(prev => ({ ...prev, [subjectId]: value }));
  };

  const totalWeightage = Object.values(weightages).reduce((sum, w) => sum + w, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:inset-auto md:w-full md:max-w-lg md:max-h-[85vh] bg-card rounded-2xl shadow-card-hover border border-border flex flex-col z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Profile & Settings</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Tabbed Content */}
            <Tabs defaultValue="general" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="mx-4 mt-3 grid grid-cols-4 shrink-0">
                <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
                <TabsTrigger value="timer" className="text-xs">Timer</TabsTrigger>
                <TabsTrigger value="revision" className="text-xs">Revision</TabsTrigger>
                <TabsTrigger value="subjects" className="text-xs">Subjects</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 overflow-auto">
                {/* === General Tab === */}
                <TabsContent value="general" className="p-4 space-y-6 mt-0">
                  {/* Exam Details */}
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
                              onSelect={(date) => date && setNewExamDate(date)}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Target Score</label>
                        <Input type="number" value={newTargetScore} onChange={(e) => setNewTargetScore(Number(e.target.value))} min={0} max={localMarkingScheme.totalMarks} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Target Rank</label>
                        <Input type="number" value={newTargetRank} onChange={(e) => setNewTargetRank(Number(e.target.value))} min={1} max={100000} placeholder="e.g. 5000" />
                      </div>
                    </div>
                  </div>

                  {/* Daily Targets */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Targets
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Study Hours/Day</label>
                        <Input type="number" value={dailyStudyTarget} onChange={(e) => setDailyStudyTarget(Number(e.target.value))} min={1} max={16} className="h-9" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Mocks/Month</label>
                        <Input type="number" value={weeklyMockTarget} onChange={(e) => setWeeklyMockTarget(Number(e.target.value))} min={0} max={30} className="h-9" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">MCQs/Topic Goal</label>
                        <Input type="number" value={localMcqGoal} onChange={(e) => setLocalMcqGoal(Number(e.target.value))} min={10} max={500} step={10} className="h-9" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">MCQs/Topic: goal of {localMcqGoal} questions per topic to mark MCQs as done.</p>
                  </div>

                  {/* Marking Scheme */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Hash className="w-4 h-4 text-primary" />
                      Marking Scheme
                      <span className="text-xs text-muted-foreground font-normal ml-auto">Auto-set by exam</span>
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Correct (+)</label>
                        <Input
                          type="number"
                          value={localMarkingScheme.correctMarks}
                          onChange={(e) => setLocalMarkingScheme(prev => ({ ...prev, correctMarks: Number(e.target.value) }))}
                          min={0} max={10} step={0.5}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Incorrect (−)</label>
                        <Input
                          type="number"
                          value={localMarkingScheme.incorrectMarks}
                          onChange={(e) => setLocalMarkingScheme(prev => ({ ...prev, incorrectMarks: Number(e.target.value) }))}
                          min={-10} max={0} step={0.5}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Unanswered</label>
                        <Input
                          type="number"
                          value={localMarkingScheme.unansweredMarks}
                          onChange={(e) => setLocalMarkingScheme(prev => ({ ...prev, unansweredMarks: Number(e.target.value) }))}
                          min={-5} max={0} step={0.5}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Total Marks</label>
                        <Input
                          type="number"
                          value={localMarkingScheme.totalMarks}
                          onChange={(e) => setLocalMarkingScheme(prev => ({ ...prev, totalMarks: Number(e.target.value) }))}
                          min={100} max={1600} step={50}
                        />
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

                  {/* PYQ Year Range */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      PYQ Year Range
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Select which years of PYQs you want to track and complete.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">From Year</label>
                        <select
                          value={localPyqYearFrom}
                          onChange={(e) => setLocalPyqYearFrom(Number(e.target.value))}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                        >
                          {PYQ_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">To Year</label>
                        <select
                          value={localPyqYearTo}
                          onChange={(e) => setLocalPyqYearTo(Number(e.target.value))}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                        >
                          {PYQ_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Content Types */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Video className="w-4 h-4 text-primary" />
                      Content Types
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Choose which stages to track per topic. MCQs & PYQs are compulsory.
                    </p>
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
                      <Input
                        value={newCustomType}
                        onChange={(e) => setNewCustomType(e.target.value)}
                        placeholder="Add custom type..."
                        className="h-8 text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && addCustomContentType()}
                      />
                      <Button size="sm" variant="outline" onClick={addCustomContentType} className="h-8">
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Clear Sample Data */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-amber-500" />
                      Clear Sample Data
                    </h3>
                    <Button
                      variant="outline"
                      className="w-full border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                      onClick={() => {
                        onClearSampleData?.();
                        onClose();
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear Mock Tests & Reset Stats
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Removes sample mock tests and resets stats to zero. Your syllabus progress and tasks are preserved.
                    </p>
                  </div>

                  {/* Reset Syllabus Data */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <h3 className="font-semibold flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-primary" />
                      Syllabus Data
                    </h3>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => onResetSyllabus?.()}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset to Default Syllabus
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Restores all subjects, chapters and topics to the original NEET PG syllabus. Your progress will be reset.
                    </p>
                  </div>

                  {/* Reset All Data */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <h3 className="font-semibold flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-4 h-4" />
                      Danger Zone
                    </h3>
                    {!showResetConfirm ? (
                      <Button
                        variant="outline"
                        className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
                        onClick={() => setShowResetConfirm(true)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Reset All Data
                      </Button>
                    ) : (
                      <div className="p-3 bg-destructive/10 rounded-xl space-y-3">
                        <p className="text-sm text-destructive font-medium">
                          This will permanently delete all your study data, tasks, mock tests, and settings. This cannot be undone.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setShowResetConfirm(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              onResetAll?.();
                              setShowResetConfirm(false);
                              onClose();
                            }}
                          >
                            Yes, Reset Everything
                          </Button>
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
                        <Input type="number" value={studyDuration} onChange={(e) => setStudyDuration(Number(e.target.value))} min={5} max={90} />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Short Break (min)</label>
                        <Input type="number" value={shortBreakDuration} onChange={(e) => setShortBreakDuration(Number(e.target.value))} min={1} max={30} />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Long Break (min)</label>
                        <Input type="number" value={longBreakDuration} onChange={(e) => setLongBreakDuration(Number(e.target.value))} min={5} max={60} />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Sessions for Long Break</label>
                        <Input type="number" value={sessionsBeforeLongBreak} onChange={(e) => setSessionsBeforeLongBreak(Number(e.target.value))} min={2} max={8} />
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
                      <Input type="number" value={breakDurationSetting} onChange={(e) => setBreakDurationSetting(Number(e.target.value))} min={1} max={60} />
                      <p className="text-xs text-muted-foreground mt-1">Used when taking a break in Focus Mode 🎮</p>
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
                      <Button variant="ghost" size="sm" onClick={resetSrDefaults} className="text-xs">
                        Reset Defaults
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Configure revision intervals (in days) based on topic confidence level.
                    </p>

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
                              <Input
                                type="number"
                                value={session.daysAfterPrevious}
                                onChange={(e) => updateSrDay(tier, idx, Number(e.target.value))}
                                className="w-12 h-6 text-center text-xs p-0"
                                min={1} max={120}
                              />
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
              </ScrollArea>
            </Tabs>

            {/* Footer */}
            <div className="p-4 border-t border-border shrink-0">
              <Button onClick={handleSave} className="w-full gradient-primary text-primary-foreground">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}