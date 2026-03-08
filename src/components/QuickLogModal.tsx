import { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, BookOpen, Brain, FileText, Clock, Minus, ChevronDown, ChevronRight, ChevronLeft, ClipboardList, AlertTriangle, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { initialSubjects } from '@/data/subjects';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Chapter, ContentType } from '@/types';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLog: (data: LogData) => void;
  onOpenMockModal?: () => void;
  onOpenTestModal?: () => void;
  onOpenPyqMockModal?: () => void;
  chapters?: Chapter[];
  contentTypes?: ContentType[];
  pyqYearFrom?: number;
  pyqYearTo?: number;
  examName?: string;
}

export type VideoType = 'main' | 'rr' | 'btr' | 'extra';

export interface LogData {
  type: 'study' | 'mcq' | 'revision' | 'pyq' | 'test';
  subjectId: string;
  chapterId?: string;
  topicId?: string;
  duration: number;
  questionsAttempted?: number;
  questionsCorrect?: number;
  videoType?: VideoType;
  pyqYears?: number[];
  pyqSessions?: string[];
  pyqExam?: string;
  pyqMode?: 'chapter' | 'exam';
  testName?: string;
  testSource?: string;
}

const durationPresets = [15, 30, 45, 60, 90, 120];

const VIDEO_TYPE_MAP: Record<string, { type: VideoType; label: string }> = {
  'main-video': { type: 'main', label: 'Main Video' },
  'rr-video': { type: 'rr', label: 'RR Video' },
  'btr-video': { type: 'btr', label: 'BTR Video' },
  'extra-video': { type: 'extra', label: 'Extra' },
};

export function QuickLogModal({ isOpen, onClose, onLog, onOpenMockModal, onOpenTestModal, onOpenPyqMockModal, chapters = [], contentTypes = [], pyqYearFrom = 2017, pyqYearTo = 2024, examName = '' }: QuickLogModalProps) {
  const [logType, setLogType] = useState<'study' | 'mcq' | 'revision' | 'pyq' | null>(null);
  const [videoType, setVideoType] = useState<VideoType>('main');
  const [subjectId, setSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [duration, setDuration] = useState(30);
  const [questionsAttempted, setQuestionsAttempted] = useState(50);
  const [questionsCorrect, setQuestionsCorrect] = useState(35);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [pyqYears, setPyqYears] = useState<number[]>([2024]);
  const [pyqExam, setPyqExam] = useState('NEET PG');
  const [pyqMode, setPyqMode] = useState<'chapter' | 'exam'>('chapter');
  const [pyqSessions, setPyqSessions] = useState<string[]>([]);

  const resetAll = () => {
    setLogType(null);
    setVideoType('main');
    setSubjectId('');
    setChapterId('');
    setTopicId('');
    setDuration(30);
    setQuestionsAttempted(50);
    setQuestionsCorrect(35);
    setExpandedSubject(null);
    setExpandedChapter(null);
    setPyqYears([2024]);
    setPyqExam('NEET PG');
    setPyqMode('chapter');
    setPyqSessions([]);
  };

  useEffect(() => {
    if (!isOpen) resetAll();
  }, [isOpen]);

  const handleLogTypeChange = (type: 'study' | 'mcq' | 'revision' | 'pyq') => {
    setLogType(type);
    setSubjectId('');
    setChapterId('');
    setTopicId('');
    setExpandedSubject(null);
    setExpandedChapter(null);
  };

  const enabledVideoTypes = contentTypes.length > 0
    ? Object.entries(VIDEO_TYPE_MAP)
        .filter(([ctId]) => contentTypes.find(ct => ct.id === ctId)?.enabled)
        .map(([, vt]) => vt)
    : [
        { type: 'main' as VideoType, label: 'Main Video' },
        { type: 'rr' as VideoType, label: 'RR Video' },
        { type: 'btr' as VideoType, label: 'BTR Video' },
        { type: 'extra' as VideoType, label: 'Extra' },
      ];

  const selectedSubjectChapters = chapters.filter(c => c.subjectId === subjectId);
  const selectedChapter = selectedSubjectChapters.find(c => c.id === chapterId);

  // Revision items grouped by due date
  const revisionGroups = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() + 7);
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    const backlog: { topicId: string; topicName: string; chapterId: string; subjectId: string; subjectName: string }[] = [];
    const todayItems: typeof backlog = [];
    const tomorrowItems: typeof backlog = [];
    const thisWeek: typeof backlog = [];

    chapters.forEach(ch => {
      ch.topics.forEach(t => {
        if (!t.nextRevisionDate) return;
        const revDate = new Date(t.nextRevisionDate).toISOString().split('T')[0];
        const subjectName = initialSubjects.find(s => s.id === ch.subjectId)?.name || '';
        const item = { topicId: t.id, topicName: t.name, chapterId: ch.id, subjectId: ch.subjectId, subjectName };
        
        if (revDate < today) backlog.push(item);
        else if (revDate === today) todayItems.push(item);
        else if (revDate === tomorrowStr) tomorrowItems.push(item);
        else if (revDate <= weekEndStr) thisWeek.push(item);
      });
    });

    return { backlog, today: todayItems, tomorrow: tomorrowItems, thisWeek };
  }, [chapters]);

  const handleSubmit = () => {
    if (!logType) return;
    onLog({
      type: logType,
      subjectId,
      chapterId: chapterId || undefined,
      topicId: topicId || undefined,
      duration,
      questionsAttempted: (logType === 'mcq' || logType === 'pyq') ? questionsAttempted : undefined,
      questionsCorrect: (logType === 'mcq' || logType === 'pyq') ? questionsCorrect : undefined,
      videoType: logType === 'study' ? videoType : undefined,
      pyqYears: logType === 'pyq' ? pyqYears : undefined,
      pyqSessions: logType === 'pyq' ? pyqSessions : undefined,
      pyqExam: logType === 'pyq' ? pyqExam : undefined,
      pyqMode: logType === 'pyq' ? pyqMode : undefined,
    });
    onClose();
  };


  const accuracy = questionsAttempted > 0 
    ? Math.round((questionsCorrect / questionsAttempted) * 100) 
    : 0;

  const adjustDuration = (delta: number) => setDuration(prev => Math.max(5, prev + delta));

  const adjustQuestions = (field: 'attempted' | 'correct', delta: number) => {
    if (field === 'attempted') {
      setQuestionsAttempted(prev => Math.max(1, prev + delta));
    } else {
      setQuestionsCorrect(prev => Math.max(0, Math.min(questionsAttempted, prev + delta)));
    }
  };

  const handleSubjectSelect = (id: string) => {
    if (subjectId === id) {
      setExpandedSubject(expandedSubject === id ? null : id);
    } else {
      setSubjectId(id);
      setChapterId('');
      setTopicId('');
      setExpandedSubject(id);
    }
  };

  const getSelectionLabel = () => {
    if (topicId && selectedChapter) {
      const topic = selectedChapter.topics.find(t => t.id === topicId);
      return topic?.name;
    }
    if (chapterId) return selectedChapter?.name;
    if (subjectId) return initialSubjects.find(s => s.id === subjectId)?.name;
    return 'Select subject...';
  };

  // Shared subject+chapter picker (no topics for PYQ)
  const renderSubjectChapterPicker = (showTopics: boolean) => (
    <div>
      <label className="text-sm font-medium mb-2 block">What did you {logType === 'pyq' ? 'solve' : 'study'}?</label>
      <div className="space-y-1 max-h-48 overflow-y-auto rounded-lg border border-border">
        {initialSubjects.map(s => {
          const subjectChapters = chapters.filter(c => c.subjectId === s.id);
          const isSelected = subjectId === s.id;
          const isExpanded = expandedSubject === s.id;

          return (
            <div key={s.id} className="overflow-hidden">
              <button
                onClick={() => handleSubjectSelect(s.id)}
                className={`w-full p-3 flex items-center justify-between text-left text-sm transition-all ${
                  isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/50'
                }`}
              >
                <span className="font-medium">{s.name}</span>
                {subjectChapters.length > 0 && (
                  <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                )}
              </button>
              <AnimatePresence>
                {isExpanded && subjectChapters.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-secondary/20"
                  >
                    <div className="pl-4 py-1">
                      {subjectChapters.map(chapter => {
                        const isChapterSelected = chapterId === chapter.id;
                        const isChapterExpanded = expandedChapter === chapter.id;
                        return (
                          <div key={chapter.id}>
                            <button
                              onClick={() => {
                                setChapterId(isChapterSelected ? '' : chapter.id);
                                setTopicId('');
                                setExpandedChapter(isChapterSelected ? null : chapter.id);
                              }}
                              className={`w-full p-2 rounded flex items-center gap-2 text-sm ${
                                isChapterSelected ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/50'
                              }`}
                            >
                              {showTopics && chapter.topics.length > 0 && (
                                <ChevronRight className={`w-3 h-3 transition-transform ${isChapterExpanded ? 'rotate-90' : ''}`} />
                              )}
                              <span>{chapter.name}</span>
                              {showTopics && (
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {chapter.topics.length} topics
                                </span>
                              )}
                            </button>
                            {/* Topics - only if showTopics */}
                            {showTopics && (
                              <AnimatePresence>
                                {isChapterExpanded && chapter.topics.length > 0 && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden ml-4 pl-2 border-l border-border"
                                  >
                                    {chapter.topics.map(topic => (
                                      <button
                                        key={topic.id}
                                        onClick={() => setTopicId(topicId === topic.id ? '' : topic.id)}
                                        className={`w-full p-1.5 rounded text-xs text-left my-0.5 ${
                                          topicId === topic.id ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/50'
                                        }`}
                                      >
                                        {topic.name}
                                      </button>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      {subjectId && (
        <div className="mt-2 p-2 bg-primary/10 rounded-lg text-sm">
          <span className="text-muted-foreground">Logging for: </span>
          <span className="font-medium text-primary">{getSelectionLabel()}</span>
        </div>
      )}
    </div>
  );

  // Duration picker
  const renderDurationPicker = () => (
    <div>
      <label className="text-sm font-medium mb-2 block flex items-center gap-2">
        <Clock className="w-4 h-4" /> Duration
      </label>
      <div className="flex flex-wrap gap-2 mb-3">
        {durationPresets.map(preset => (
          <button
            key={preset}
            onClick={() => setDuration(preset)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              duration === preset ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 hover:bg-secondary'
            }`}
          >
            {preset}m
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="icon" onClick={() => adjustDuration(-5)} className="h-12 w-12">
          <Minus className="w-5 h-5" />
        </Button>
        <div className="text-center min-w-20">
          <span className="text-3xl font-bold">{duration}</span>
          <span className="text-sm text-muted-foreground ml-1">min</span>
        </div>
        <Button variant="outline" size="icon" onClick={() => adjustDuration(5)} className="h-12 w-12">
          <Plus className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );

  // MCQ/PYQ questions fields
  const renderQuestionsFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Questions Attempted</label>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => adjustQuestions('attempted', -5)}>
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-2xl font-bold min-w-12 text-center">{questionsAttempted}</span>
            <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => adjustQuestions('attempted', 5)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Correct Answers</label>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => adjustQuestions('correct', -5)}>
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-2xl font-bold min-w-12 text-center">{questionsCorrect}</span>
            <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => adjustQuestions('correct', 5)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      {/* Accuracy bar */}
      <div className="p-3 bg-secondary/50 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Accuracy</span>
          <span className={`text-lg font-bold ${
            accuracy >= 75 ? 'text-green-500' : accuracy >= 50 ? 'text-yellow-500' : 'text-red-500'
          }`}>{accuracy}%</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full mt-2">
          <div
            className={`h-full rounded-full transition-all ${
              accuracy >= 75 ? 'bg-green-500' : accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${accuracy}%` }}
          />
        </div>
      </div>
    </div>
  );

  // Render revision group
  const renderRevisionGroup = (label: string, items: typeof revisionGroups.backlog, icon: React.ReactNode, colorClass: string) => {
    if (items.length === 0) return null;
    return (
      <div>
        <div className={`flex items-center gap-2 mb-2 ${colorClass}`}>
          {icon}
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{items.length}</span>
        </div>
        <div className="space-y-1 ml-1">
          {items.slice(0, 10).map(item => (
            <button
              key={item.topicId}
              onClick={() => {
                setSubjectId(item.subjectId);
                setChapterId(item.chapterId);
                setTopicId(item.topicId);
              }}
              className={`w-full p-2 rounded-lg text-left text-xs transition-all ${
                topicId === item.topicId ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/50'
              }`}
            >
              <span className="font-medium">{item.topicName}</span>
              <span className="text-muted-foreground ml-1">• {item.subjectName}</span>
            </button>
          ))}
          {items.length > 10 && (
            <p className="text-xs text-muted-foreground pl-2">+{items.length - 10} more</p>
          )}
        </div>
      </div>
    );
  };

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
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-card rounded-t-2xl md:rounded-2xl shadow-card-hover border border-border z-50 max-h-[95vh] md:max-h-[85vh] flex flex-col"
          >
            {/* Drag Handle */}
            <div className="md:hidden flex justify-center pt-3">
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-4 shrink-0">
              <div className="flex items-center gap-2">
                {logType && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setLogType(null); setSubjectId(''); setChapterId(''); setTopicId(''); }}>
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                )}
                <h2 className="text-lg font-bold">
                  {!logType ? 'Quick Log' : logType === 'study' ? 'Log Study' : logType === 'mcq' ? 'Log MCQs' : logType === 'revision' ? 'Log Revision' : 'Log PYQs'}
                </h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <ScrollArea className="flex-1 overflow-auto">
              <div className="px-4 pb-4 space-y-4">
                {/* Type Selection - only when nothing selected */}
                <AnimatePresence mode="wait">
                  {!logType && (
                    <motion.div
                      key="type-selection"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { type: 'study' as const, icon: BookOpen, label: 'Study' },
                          { type: 'mcq' as const, icon: FileText, label: 'MCQs' },
                          { type: 'revision' as const, icon: Brain, label: 'Revision' },
                          { type: 'pyq' as const, icon: FileText, label: 'PYQs' },
                        ].map(({ type, icon: Icon, label }) => (
                          <button
                            key={type}
                            onClick={() => handleLogTypeChange(type)}
                            className="p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-secondary/30 transition-all flex items-center gap-3"
                          >
                            <Icon className="w-5 h-5 text-muted-foreground" />
                            <span className="text-sm font-medium">{label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Mock & Test buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => { onClose(); onOpenMockModal?.(); }}
                          className="p-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                        >
                          <FileText className="w-4 h-4" />
                          <span className="text-xs font-medium">Log Full Mock</span>
                        </button>
                        <button
                          onClick={() => { onClose(); onOpenTestModal?.(); }}
                          className="p-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                        >
                          <ClipboardList className="w-4 h-4" />
                          <span className="text-xs font-medium">Log Test</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                {logType && (
                  <motion.div
                    key={`form-${logType}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* ═══════ STUDY ═══════ */}
                    {logType === 'study' && (
                      <>
                        {enabledVideoTypes.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {enabledVideoTypes.map(({ type, label }) => (
                              <button
                                key={type}
                                onClick={() => setVideoType(type)}
                                className={`px-3 py-1.5 rounded-lg border transition-all text-xs font-medium ${
                                  videoType === type
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border hover:border-primary/50 text-muted-foreground'
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        )}
                        {renderSubjectChapterPicker(true)}
                        {renderDurationPicker()}
                        <Button onClick={handleSubmit} disabled={!subjectId} className="w-full gradient-primary text-primary-foreground">
                          Log Session (+10 XP)
                        </Button>
                      </>
                    )}

                    {/* ═══════ MCQ ═══════ */}
                    {logType === 'mcq' && (
                      <>
                        {renderSubjectChapterPicker(true)}
                        {renderDurationPicker()}
                        {renderQuestionsFields()}
                        <Button onClick={handleSubmit} disabled={!subjectId} className="w-full gradient-primary text-primary-foreground">
                          Log MCQs (+10 XP)
                        </Button>
                      </>
                    )}

                    {/* ═══════ REVISION ═══════ */}
                    {logType === 'revision' && (
                      <>
                        <div className="space-y-3">
                          {renderRevisionGroup('Overdue', revisionGroups.backlog, <AlertTriangle className="w-4 h-4" />, 'text-red-500')}
                          {renderRevisionGroup('Today', revisionGroups.today, <CalendarClock className="w-4 h-4" />, 'text-primary')}
                          {renderRevisionGroup('Tomorrow', revisionGroups.tomorrow, <CalendarClock className="w-4 h-4" />, 'text-yellow-500')}
                          {renderRevisionGroup('This Week', revisionGroups.thisWeek, <CalendarClock className="w-4 h-4" />, 'text-muted-foreground')}
                          {revisionGroups.backlog.length === 0 && revisionGroups.today.length === 0 && revisionGroups.tomorrow.length === 0 && revisionGroups.thisWeek.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">No revisions due this week 🎉</p>
                          )}
                        </div>
                        {!topicId && (
                          <>
                            <div className="text-xs text-muted-foreground text-center">— or select manually —</div>
                            {renderSubjectChapterPicker(true)}
                          </>
                        )}
                        {renderDurationPicker()}
                        <Button onClick={handleSubmit} disabled={!subjectId} className="w-full gradient-primary text-primary-foreground">
                          Log Revision (+10 XP)
                        </Button>
                      </>
                    )}

                    {/* ═══════ PYQ ═══════ */}
                    {logType === 'pyq' && (
                      <>
                        {/* Full PYQ Mock at top */}
                        <button
                          onClick={() => { onClose(); onOpenPyqMockModal?.(); }}
                          className="w-full p-2.5 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                        >
                          <FileText className="w-4 h-4" />
                          <span className="text-xs font-medium">Log Full PYQ Mock</span>
                        </button>

                        <div className="flex gap-2">
                          <button
                            onClick={() => { setPyqMode('chapter'); setSubjectId(''); setChapterId(''); }}
                            className={`flex-1 p-2 rounded-lg border-2 text-xs font-medium transition-all text-center ${
                              pyqMode === 'chapter' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                            }`}
                          >
                            Subject + Chapter
                          </button>
                          <button
                            onClick={() => { setPyqMode('exam'); setSubjectId(''); setChapterId(''); }}
                            className={`flex-1 p-2 rounded-lg border-2 text-xs font-medium transition-all text-center ${
                              pyqMode === 'exam' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                            }`}
                          >
                            Subject + Exam + Year
                          </button>
                        </div>

                        {pyqMode === 'chapter' && renderSubjectChapterPicker(false)}

                        {pyqMode === 'exam' && (
                          <>
                            <div>
                              <label className="text-sm font-medium mb-2 block">Subject</label>
                              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                                {initialSubjects.map(s => (
                                  <button
                                    key={s.id}
                                    onClick={() => setSubjectId(s.id)}
                                    className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                                      subjectId === s.id ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 hover:bg-secondary text-muted-foreground'
                                    }`}
                                  >
                                    {s.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground mb-1.5 block">Exam</label>
                              <div className="flex flex-wrap gap-1.5">
                                {(() => {
                                  const allExams = ['NEET PG', 'INICET', 'FMGE', 'All'];
                                  return allExams.map(exam => (
                                    <button
                                      key={exam}
                                      onClick={() => { setPyqExam(exam); setPyqSessions([]); }}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                        pyqExam === exam ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 hover:bg-secondary'
                                      }`}
                                    >
                                      {exam}
                                    </button>
                                  ));
                                })()}
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground mb-1.5 block">
                                {pyqExam === 'INICET' || pyqExam === 'FMGE' ? 'Session(s)' : 'Year(s)'}{' '}
                                <span className="text-muted-foreground/60">— tap to toggle</span>
                              </label>
                              <div className="flex flex-wrap gap-1.5">
                                {(() => {
                                  const years = Array.from({ length: pyqYearTo - pyqYearFrom + 1 }, (_, i) => pyqYearTo - i);
                                  if (pyqExam === 'INICET') {
                                    return years.flatMap(y => [`May ${y}`, `Nov ${y}`]).map(session => (
                                      <button
                                        key={session}
                                        onClick={() => setPyqSessions(prev => prev.includes(session) ? prev.filter(s => s !== session) : [...prev, session])}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                          pyqSessions.includes(session) ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 hover:bg-secondary'
                                        }`}
                                      >
                                        {session}
                                      </button>
                                    ));
                                  }
                                  if (pyqExam === 'FMGE') {
                                    return years.flatMap(y => [`June ${y}`, `Dec ${y}`]).map(session => (
                                      <button
                                        key={session}
                                        onClick={() => setPyqSessions(prev => prev.includes(session) ? prev.filter(s => s !== session) : [...prev, session])}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                          pyqSessions.includes(session) ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 hover:bg-secondary'
                                        }`}
                                      >
                                        {session}
                                      </button>
                                    ));
                                  }
                                  // NEET PG or All — just years
                                  return years.map(year => (
                                    <button
                                      key={year}
                                      onClick={() => setPyqYears(prev => prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year].sort((a, b) => b - a))}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                        pyqYears.includes(year) ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 hover:bg-secondary'
                                      }`}
                                    >
                                      {year}
                                    </button>
                                  ));
                                })()}
                              </div>
                            </div>
                          </>
                        )}

                        {renderDurationPicker()}
                        {renderQuestionsFields()}
                        <Button onClick={handleSubmit} disabled={!subjectId} className="w-full gradient-primary text-primary-foreground">
                          Log PYQs (+10 XP)
                        </Button>
                      </>
                    )}
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
