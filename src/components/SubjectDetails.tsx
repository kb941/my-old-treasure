import { useState, useEffect, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Plus, X, Check, Trash2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Subject, Chapter, Topic, TopicStatus, ContentType, DEFAULT_CONTENT_TYPES, SpacedRepetitionSettings, getScheduleForConfidence, StudyLog } from '@/types';
import { addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TopicChecklist } from './TopicChecklist';

interface SubjectDetailsProps {
  subject: Subject;
  chapters: Chapter[];
  onChaptersChange: (subjectId: string, chapters: Chapter[]) => void;
  contentTypes?: ContentType[];
  srSettings?: SpacedRepetitionSettings;
  forceExpanded?: boolean;
  examName?: string;
  studyLogs?: StudyLog[];
}

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

const categoryColors: Record<string, string> = {
  'Pre-clinical': 'from-blue-500 to-cyan-500',
  'Para-clinical': 'from-purple-500 to-pink-500',
  'Clinical': 'from-emerald-500 to-teal-500',
  'Short Subjects': 'from-amber-500 to-orange-500',
};

export function SubjectDetails({ subject, chapters, onChaptersChange, contentTypes, srSettings, forceExpanded, examName, studyLogs = [] }: SubjectDetailsProps) {
  const activeTypes = (contentTypes || DEFAULT_CONTENT_TYPES).filter(ct => ct.enabled);
  const [isExpanded, setIsExpanded] = useState(forceExpanded || false);

  useEffect(() => {
    if (forceExpanded) setIsExpanded(true);
  }, [forceExpanded]);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapterName, setNewChapterName] = useState('');
  const [addingTopicTo, setAddingTopicTo] = useState<string | null>(null);
  const [newTopicName, setNewTopicName] = useState('');
  const [clearConfirmTarget, setClearConfirmTarget] = useState<{ type: 'chapter' | 'subject'; id: string } | null>(null);

  const subjectChapters = chapters.filter(c => c.subjectId === subject.id);
  const totalTopics = subjectChapters.reduce((acc, c) => acc + c.topics.length, 0);
  const completedTopics = subjectChapters.reduce(
    (acc, c) => acc + c.topics.filter(t => t.status === 'mastered').length, 
    0
  );
  const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Last studied across all topics in this subject
  const lastStudied = useMemo(() => {
    const dates = subjectChapters.flatMap(c => c.topics)
      .map(t => t.lastStudied)
      .filter(Boolean)
      .map(d => new Date(d!).getTime());
    return dates.length > 0 ? new Date(Math.max(...dates)) : null;
  }, [subjectChapters]);

  // Chapter progress helper
  const getChapterProgress = (chapter: Chapter) => {
    if (chapter.topics.length === 0) return 0;
    const done = chapter.topics.filter(t => t.completedStages.length > 0).length;
    return Math.round((done / chapter.topics.length) * 100);
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => 
      prev.includes(chapterId) 
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const addChapter = () => {
    if (!newChapterName.trim()) return;
    const newChapter: Chapter = {
      id: `${subject.id}-ch-${Date.now()}`,
      name: newChapterName.trim(),
      subjectId: subject.id,
      topics: [],
    };
    onChaptersChange(subject.id, [...subjectChapters, newChapter]);
    setNewChapterName('');
    setIsAddingChapter(false);
  };

  const deleteChapter = (chapterId: string) => {
    onChaptersChange(subject.id, subjectChapters.filter(c => c.id !== chapterId));
  };

  const addTopic = (chapterId: string) => {
    if (!newTopicName.trim()) return;
    const newTopic: Topic = {
      id: `${chapterId}-t-${Date.now()}`,
      name: newTopicName.trim(),
      subjectId: subject.id,
      status: 'not-started',
      completedStages: [],
      confidence: 0,
      targetQuestions: 50,
      questionsSolved: 0,
      pyqDone: false,
      nextRevisionDate: null,
      revisionSession: 0,
      lastStudied: null,
    };
    onChaptersChange(
      subject.id, 
      subjectChapters.map(c => 
        c.id === chapterId ? { ...c, topics: [...c.topics, newTopic] } : c
      )
    );
    setNewTopicName('');
    setAddingTopicTo(null);
  };

  const deleteTopic = (chapterId: string, topicId: string) => {
    onChaptersChange(
      subject.id,
      subjectChapters.map(c =>
        c.id === chapterId ? { ...c, topics: c.topics.filter(t => t.id !== topicId) } : c
      )
    );
  };

  const updateTopic = (chapterId: string, topic: Topic) => {
    onChaptersChange(
      subject.id,
      subjectChapters.map(c =>
        c.id === chapterId
          ? { ...c, topics: c.topics.map(t => t.id === topic.id ? topic : t) }
          : c
      )
    );
  };

  const clearTopicProgress = (topic: Topic): Topic => ({
    ...topic,
    completedStages: [],
    confidence: 0,
    nextRevisionDate: null,
    revisionSession: 0,
    lastStudied: null,
    questionsSolved: 0,
    pyqDone: false,
  });

  const clearChapterProgress = (chapterId: string) => {
    onChaptersChange(
      subject.id,
      subjectChapters.map(c =>
        c.id === chapterId
          ? { ...c, topics: c.topics.map(clearTopicProgress) }
          : c
      )
    );
    setClearConfirmTarget(null);
  };

  const clearSubjectProgress = () => {
    onChaptersChange(
      subject.id,
      subjectChapters.map(c => ({
        ...c,
        topics: c.topics.map(clearTopicProgress),
      }))
    );
    setClearConfirmTarget(null);
  };

  const applyStageToggleToTopic = (topic: Topic, stageId: string, shouldHaveStage: boolean): Topic => {
    const stages = topic.completedStages || [];
    const alreadyHasStage = stages.includes(stageId);

    if (shouldHaveStage && alreadyHasStage) return topic;
    if (!shouldHaveStage && !alreadyHasStage) return topic;

    const isScorableStage = ['main-video', 'rr-video', 'btr-video'].includes(stageId);
    const updatedStages = shouldHaveStage
      ? [...stages, stageId]
      : stages.filter(s => s !== stageId);

    const updates: Partial<Topic> = { completedStages: updatedStages };

    if (stageId === 'mcqs') {
      updates.questionsSolved = shouldHaveStage
        ? Math.max(topic.questionsSolved, topic.targetQuestions)
        : Math.max(0, topic.questionsSolved - topic.targetQuestions);
    }

    if (stageId === 'pyqs') {
      updates.pyqDone = shouldHaveStage;
    }

    if (shouldHaveStage && isScorableStage && topic.confidence === 0) {
      updates.confidence = 3;
      updates.lastStudied = new Date();
      const sched = getScheduleForConfidence(3, srSettings);
      if (sched[0]) {
        updates.nextRevisionDate = addDays(new Date(), sched[0].daysAfterPrevious);
        updates.revisionSession = 0;
      }
    }

    return { ...topic, ...updates };
  };

  const markChapterStage = (chapterId: string, stageId: string) => {
    const chapter = subjectChapters.find(c => c.id === chapterId);
    const allHaveStage = chapter && chapter.topics.length > 0 && chapter.topics.every(t => (t.completedStages || []).includes(stageId));

    onChaptersChange(
      subject.id,
      subjectChapters.map(c =>
        c.id === chapterId
          ? {
              ...c,
              topics: c.topics.map(t => applyStageToggleToTopic(t, stageId, !allHaveStage)),
            }
          : c
      )
    );
  };

  const markSubjectStage = (stageId: string) => {
    const allTopicsInSubject = subjectChapters.flatMap(c => c.topics);
    const allHaveStage = allTopicsInSubject.length > 0 && allTopicsInSubject.every(t => (t.completedStages || []).includes(stageId));

    onChaptersChange(
      subject.id,
      subjectChapters.map(c => ({
        ...c,
        topics: c.topics.map(t => applyStageToggleToTopic(t, stageId, !allHaveStage)),
      }))
    );
  };

  const isChapterStageComplete = (chapterId: string, stageId: string): boolean => {
    const chapter = subjectChapters.find(c => c.id === chapterId);
    if (!chapter || chapter.topics.length === 0) return false;
    return chapter.topics.every(t => (t.completedStages || []).includes(stageId));
  };

  const isSubjectStageComplete = (stageId: string): boolean => {
    const allTopics = subjectChapters.flatMap(c => c.topics);
    if (allTopics.length === 0) return false;
    return allTopics.every(t => (t.completedStages || []).includes(stageId));
  };

  // Full screen view
  if (isExpanded) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col" style={{ height: '100dvh' }}>
        {/* Header */}
        <div className={cn(
          "shrink-0 p-3 border-b border-border bg-gradient-to-r text-white",
          categoryColors[subject.category]
        )}>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(false)}
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold truncate">{subject.name}</h1>
              <p className="text-xs text-white/80">
                {subject.weightage}Q{(() => {
                  const info = examName ? EXAM_WEIGHTAGES[examName]?.[subject.id] : null;
                  return info?.range ? ` (${info.range[0]}–${info.range[1]})` : '';
                })()} • {subjectChapters.length} ch • {totalTopics} topics • {progress}%
              </p>
              <div className="flex items-center gap-3 mt-0.5 text-[10px] text-white/70">
                {lastStudied && (
                  <span>Last studied: {formatDistanceToNow(lastStudied, { addSuffix: true })}</span>
                )}
                {(() => {
                  const totalMinutes = studyLogs.filter(l => l.subjectId === subject.id).reduce((sum, l) => sum + l.minutesStudied, 0);
                  const hours = (totalMinutes / 60).toFixed(1);
                  return totalMinutes > 0 ? <span>{hours}h logged</span> : null;
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Subject-level quick marks */}
        {subjectChapters.length > 0 && subjectChapters.some(c => c.topics.length > 0) && (
          <div className="shrink-0 p-2 bg-secondary/30 border-b border-border">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-medium text-muted-foreground">Mark All Topics:</p>
              <button
                onClick={() => setClearConfirmTarget({ type: 'subject', id: subject.id })}
                className="text-[10px] text-destructive hover:underline"
              >
                Reset All
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {activeTypes.map(ct => {
                const isComplete = isSubjectStageComplete(ct.id);
                return (
                  <button
                    key={ct.id}
                    onClick={() => markSubjectStage(ct.id)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] transition-all",
                      isComplete 
                        ? "bg-primary/20 text-primary" 
                        : "bg-background text-muted-foreground hover:bg-background/80"
                    )}
                  >
                    <CheckCircle2 className={cn("w-3 h-3", isComplete && "fill-primary")} />
                    {ct.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Chapters List - native scrolling */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-2 space-y-2 pb-6">
            {subjectChapters.map(chapter => {
              const isOpen = expandedChapters.includes(chapter.id);
              const chapterProgress = getChapterProgress(chapter);
              return (
                <div key={chapter.id} className="bg-card rounded-xl border border-border overflow-hidden">
                  {/* Chapter Header */}
                  <div className="p-2 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleChapter(chapter.id)}
                        className="flex items-center gap-1.5 flex-1 text-left min-w-0"
                      >
                        <ChevronDown 
                          className={cn(
                            "w-3.5 h-3.5 text-muted-foreground transition-transform shrink-0",
                            !isOpen && "-rotate-90"
                          )}
                        />
                        <span className="font-medium text-sm truncate">{chapter.name}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto mr-1 shrink-0">
                          {chapter.topics.filter(t => t.completedStages.length > 0).length}/{chapter.topics.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setAddingTopicTo(addingTopicTo === chapter.id ? null : chapter.id)}
                      className="p-1.5 hover:bg-secondary rounded-lg transition-colors shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => deleteChapter(chapter.id)}
                      className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                    </div>
                    {/* Chapter progress bar */}
                    {chapter.topics.length > 0 && (
                      <div className="flex items-center gap-2 px-1">
                        <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full bg-gradient-to-r transition-all", categoryColors[subject.category])}
                            style={{ width: `${chapterProgress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{chapterProgress}%</span>
                      </div>
                    )}
                  </div>

                  {/* Chapter Content - no animation to avoid layout issues */}
                  {isOpen && (
                    <div className="px-2 pb-2 space-y-1.5 border-t border-border pt-2">
                      {/* Chapter-level quick marks */}
                      {chapter.topics.length > 0 && (
                        <div className="bg-secondary/30 rounded-lg p-1.5">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] text-muted-foreground">Quick Mark:</p>
                            <button
                              onClick={() => setClearConfirmTarget({ type: 'chapter', id: chapter.id })}
                              className="text-[10px] text-destructive hover:underline"
                            >
                              Reset
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {activeTypes.map(ct => {
                              const isComplete = isChapterStageComplete(chapter.id, ct.id);
                              return (
                                <button
                                  key={ct.id}
                                  onClick={() => markChapterStage(chapter.id, ct.id)}
                                  className={cn(
                                    "flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] transition-all",
                                    isComplete 
                                      ? "bg-primary/20 text-primary" 
                                      : "bg-background text-muted-foreground hover:bg-background/80"
                                  )}
                                >
                                  <CheckCircle2 className={cn("w-2.5 h-2.5", isComplete && "fill-primary")} />
                                  {ct.shortLabel}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Add Topic Form */}
                      {addingTopicTo === chapter.id && (
                        <div className="flex items-center gap-2 p-2 bg-background/50 rounded-lg">
                          <Input
                            value={newTopicName}
                            onChange={(e) => setNewTopicName(e.target.value)}
                            placeholder="Topic name..."
                            className="h-8 text-sm"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && addTopic(chapter.id)}
                          />
                          <Button size="sm" onClick={() => addTopic(chapter.id)} className="h-8">
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setAddingTopicTo(null)} className="h-8">
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}

                      {/* Topic List */}
                      {chapter.topics.map(topic => (
                        <TopicChecklist
                          key={topic.id}
                          topic={topic}
                          onUpdate={(updatedTopic) => updateTopic(chapter.id, updatedTopic)}
                          onDelete={() => deleteTopic(chapter.id, topic.id)}
                          contentTypes={contentTypes}
                          srSettings={srSettings}
                        />
                      ))}

                      {chapter.topics.length === 0 && addingTopicTo !== chapter.id && (
                        <p className="text-xs text-muted-foreground text-center py-3">
                          No topics yet. Click + to add one.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add Chapter */}
            {isAddingChapter ? (
              <div className="flex items-center gap-2">
                <Input
                  value={newChapterName}
                  onChange={(e) => setNewChapterName(e.target.value)}
                  placeholder="Chapter name..."
                  className="h-10"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && addChapter()}
                />
                <Button size="sm" onClick={addChapter} className="h-10">
                  <Check className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsAddingChapter(false)} className="h-10">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                className="w-full h-10"
                onClick={() => setIsAddingChapter(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Chapter
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Compact card view
  return (
    <motion.div
      layout
      className="bg-card rounded-xl shadow-card border border-border overflow-hidden"
    >
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full p-3 flex items-center gap-3 hover:bg-secondary/50 transition-colors"
      >
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        
        <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm truncate">{subject.name}</h3>
            <span className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gradient-to-r text-white shrink-0",
              categoryColors[subject.category]
            )}>
              {subject.weightage}Q
            </span>
            {(() => {
              const info = examName ? EXAM_WEIGHTAGES[examName]?.[subject.id] : null;
              return info?.range ? (
                <span className="text-[10px] text-muted-foreground shrink-0">({info.range[0]}–{info.range[1]})</span>
              ) : null;
            })()}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] text-muted-foreground">
              {subjectChapters.length} ch • {totalTopics} topics
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full bg-gradient-to-r",
                  categoryColors[subject.category]
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[11px] font-medium">{progress}%</span>
          </div>
        </div>
      </button>
    </motion.div>
  );
}
