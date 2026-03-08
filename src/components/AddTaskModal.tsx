import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ChevronDown, ChevronRight, Minus, Search, BookOpen, Brain, FileText, ClipboardList, Beaker, AlertTriangle, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Task, TaskColumn, Chapter } from '@/types';
import { initialSubjects } from '@/data/subjects';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Omit<Task, 'id'>) => void;
  defaultColumn: TaskColumn;
  chapters?: Chapter[];
  pyqYearFrom?: number;
  pyqYearTo?: number;
  examName?: string;
}

const durationPresets = [15, 30, 45, 60, 90, 120];

const taskTypes = [
  { value: 'study' as const, label: 'Study', icon: BookOpen },
  { value: 'revision' as const, label: 'Revision', icon: Brain },
  { value: 'mcq' as const, label: 'MCQs', icon: FileText },
  { value: 'pyq' as const, label: 'PYQs', icon: FileText },
  { value: 'test' as const, label: 'Test', icon: ClipboardList },
  { value: 'mock' as const, label: 'Mock', icon: Beaker },
];

const typeLabels: Record<Task['type'], string> = {
  study: 'Study', revision: 'Revise', mcq: 'MCQs', pyq: 'PYQs', test: 'Test', mock: 'Mock Test',
};

export function AddTaskModal({ isOpen, onClose, onAdd, defaultColumn, chapters = [], pyqYearFrom = 2017, pyqYearTo = 2024, examName = '' }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Task['type']>('study');
  const [subjectId, setSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [duration, setDuration] = useState(30);
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [notes, setNotes] = useState('');
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // PYQ-specific
  const [pyqMode, setPyqMode] = useState<'chapter' | 'exam'>('chapter');
  const [pyqExam, setPyqExam] = useState('NEET PG');
  const [pyqYears, setPyqYears] = useState<number[]>([2024]);
  const [pyqSessions, setPyqSessions] = useState<string[]>([]);
  const [pyqFullMock, setPyqFullMock] = useState(false);
  // Test/Mock specific
  const [testSource, setTestSource] = useState('');

  const subjectListRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Reset everything on close
  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setType('study');
      resetSelections();
      setDuration(30);
      setPriority('medium');
      setNotes('');
      setTestSource('');
      setPyqFullMock(false);
    }
  }, [isOpen]);

  const resetSelections = useCallback(() => {
    setSubjectId('');
    setChapterId('');
    setTopicId('');
    setExpandedSubject(null);
    setExpandedChapter(null);
    setSearchQuery('');
    setPyqMode('chapter');
    setPyqExam('NEET PG');
    setPyqYears([2024]);
    setPyqSessions([]);
  }, []);

  // Reset selections when type changes
  const handleTypeChange = (newType: Task['type']) => {
    const oldType = type;
    setType(newType);
    // Reset selections
    setSubjectId('');
    setChapterId('');
    setTopicId('');
    setExpandedSubject(null);
    setExpandedChapter(null);
    setSearchQuery('');
    setPyqFullMock(false);
    setTestSource('');
    // Update title prefix if auto-generated
    if (title && Object.values(typeLabels).some(l => title.startsWith(l + ' - '))) {
      const suffix = title.split(' - ').slice(1).join(' - ');
      if (suffix) setTitle(`${typeLabels[newType]} - ${suffix}`);
      else setTitle('');
    } else if (!title) {
      // keep empty
    }
  };

  // Scroll to selected subject after search selection
  useEffect(() => {
    if (selectedRef.current && subjectListRef.current) {
      setTimeout(() => {
        selectedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
    }
  }, [subjectId, chapterId, topicId]);

  const selectedSubjectChapters = chapters.filter(c => c.subjectId === subjectId);
  const selectedChapter = selectedSubjectChapters.find(c => c.id === chapterId);

  // Revision items grouped by due date
  const revisionGroups = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() + 7);
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    const backlog: { topicId: string; topicName: string; chapterId: string; subjectId: string; subjectName: string }[] = [];
    const todayItems: typeof backlog = [];
    const thisWeek: typeof backlog = [];

    chapters.forEach(ch => {
      ch.topics.forEach(t => {
        if (!t.nextRevisionDate) return;
        const revDate = new Date(t.nextRevisionDate).toISOString().split('T')[0];
        const subjectName = initialSubjects.find(s => s.id === ch.subjectId)?.name || '';
        const item = { topicId: t.id, topicName: t.name, chapterId: ch.id, subjectId: ch.subjectId, subjectName };
        if (revDate < today) backlog.push(item);
        else if (revDate === today) todayItems.push(item);
        else if (revDate <= weekEndStr) thisWeek.push(item);
      });
    });
    return { backlog, today: todayItems, thisWeek };
  }, [chapters]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const results: { subjectId: string; subjectName: string; chapterId: string; chapterName: string; topicId?: string; topicName?: string }[] = [];
    chapters.forEach(ch => {
      const subjectName = initialSubjects.find(s => s.id === ch.subjectId)?.name || '';
      if (ch.name.toLowerCase().includes(q)) {
        results.push({ subjectId: ch.subjectId, subjectName, chapterId: ch.id, chapterName: ch.name });
      }
      ch.topics.forEach(t => {
        if (t.name.toLowerCase().includes(q)) {
          results.push({ subjectId: ch.subjectId, subjectName, chapterId: ch.id, chapterName: ch.name, topicId: t.id, topicName: t.name });
        }
      });
    });
    return results.slice(0, 20);
  }, [searchQuery, chapters]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      type,
      subjectId: subjectId || undefined,
      chapterId: chapterId || undefined,
      topicId: topicId || undefined,
      duration,
      completed: false,
      column: defaultColumn,
      priority,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  // Auto-generate title based on current selections
  const buildAutoTitle = useCallback((
    overrideType?: Task['type'],
    overrideSubjectId?: string,
    overrideChapterId?: string,
    overrideTopicId?: string,
    overrideTestSource?: string,
    overridePyqFullMock?: boolean,
    overridePyqExam?: string,
    overridePyqYears?: number[],
    overridePyqSessions?: string[],
  ) => {
    const t = overrideType ?? type;
    const sId = overrideSubjectId ?? subjectId;
    const cId = overrideChapterId ?? chapterId;
    const tId = overrideTopicId ?? topicId;
    const src = overrideTestSource ?? testSource;
    const fullMock = overridePyqFullMock ?? pyqFullMock;
    const exam = overridePyqExam ?? pyqExam;
    const years = overridePyqYears ?? pyqYears;
    const sessions = overridePyqSessions ?? pyqSessions;

    const subName = initialSubjects.find(s => s.id === sId)?.name || '';
    const chName = chapters.find(c => c.id === cId)?.name || '';
    const topName = (() => {
      if (!tId) return '';
      const ch = chapters.find(c => c.id === cId);
      return ch?.topics.find(tp => tp.id === tId)?.name || '';
    })();

    const prefix = typeLabels[t];
    let parts: string[] = [];

    switch (t) {
      case 'study':
      case 'mcq':
      case 'revision':
        if (topName) parts = [topName];
        else if (chName) parts = [chName];
        else if (subName) parts = [subName];
        break;
      case 'pyq':
        if (fullMock) {
          parts = ['Full Mock'];
          if (exam) parts.push(exam);
          if (sessions.length > 0) parts.push(sessions.join(', '));
          else if (years.length > 0) parts.push(years.join(', '));
        } else {
          if (subName) parts = [subName];
          if (chName) parts.push(chName);
        }
        break;
      case 'test':
        if (src) parts.push(src);
        if (subName) parts.push(subName);
        if (topName) parts.push(topName);
        else if (chName) parts.push(chName);
        break;
      case 'mock':
        if (src) parts.push(src);
        break;
    }

    if (parts.length > 0) return `${prefix} - ${parts.join(' • ')}`;
    return '';
  }, [type, subjectId, chapterId, topicId, testSource, pyqFullMock, pyqExam, pyqYears, pyqSessions, chapters]);

  const updateAutoTitle = useCallback((...args: Parameters<typeof buildAutoTitle>) => {
    const newTitle = buildAutoTitle(...args);
    setTitle(newTitle);
  }, [buildAutoTitle]);

  const handleSearchResultClick = (result: NonNullable<typeof searchResults>[0]) => {
    setSubjectId(result.subjectId);
    setChapterId(result.chapterId);
    if (result.topicId) {
      setTopicId(result.topicId);
    } else {
      setTopicId('');
    }
    setSearchQuery('');
    setExpandedSubject(result.subjectId);
    setExpandedChapter(result.chapterId);
    // Defer title update
    setTimeout(() => {
      updateAutoTitle(undefined, result.subjectId, result.chapterId, result.topicId || '');
    }, 0);
  };

  const handleSubjectSelect = (id: string) => {
    if (subjectId === id) {
      setExpandedSubject(expandedSubject === id ? null : id);
    } else {
      setSubjectId(id);
      setChapterId('');
      setTopicId('');
      setExpandedSubject(id);
      setExpandedChapter(null);
      updateAutoTitle(undefined, id, '', '');
    }
  };

  const adjustDuration = (delta: number) => setDuration(prev => Math.max(5, prev + delta));

  const getSelectionLabel = () => {
    if (topicId && selectedChapter) {
      const topic = selectedChapter.topics.find(t => t.id === topicId);
      return topic?.name;
    }
    if (chapterId) return selectedChapter?.name;
    if (subjectId) return initialSubjects.find(s => s.id === subjectId)?.name;
    return null;
  };

  const selectionLabel = getSelectionLabel();

  // Shared subject/chapter/topic picker
  const renderSubjectPicker = (showTopics: boolean) => (
    <div>
      <label className="text-sm font-medium mb-2 block">
        {type === 'test' ? 'Subject (Optional)' : 'Subject / Topic'}
      </label>

      {/* Search bar */}
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search topics, chapters..."
          className="pl-9 h-9 text-sm"
          autoFocus={false}
        />
      </div>

      {/* Search Results */}
      {searchResults && searchResults.length > 0 && (
        <div className="mb-2 border border-border rounded-lg max-h-40 overflow-y-auto">
          {searchResults.map((r, i) => (
            <button
              key={`${r.chapterId}-${r.topicId || 'ch'}-${i}`}
              onClick={() => handleSearchResultClick(r)}
              className="w-full p-2 text-left text-xs hover:bg-secondary/50 transition-all border-b border-border last:border-b-0"
            >
              <span className="font-medium text-foreground">{r.topicName || r.chapterName}</span>
              <span className="text-muted-foreground ml-1">
                • {r.subjectName}{r.topicName ? ` › ${r.chapterName}` : ''}
              </span>
            </button>
          ))}
        </div>
      )}
      {searchResults && searchResults.length === 0 && (
        <p className="text-xs text-muted-foreground mb-2 text-center py-2">No results found</p>
      )}

      {/* Selection indicator */}
      {selectionLabel && (
        <div className="mb-2 p-2 bg-primary/10 rounded-lg text-sm flex items-center justify-between">
          <span>
            <span className="text-muted-foreground">Selected: </span>
            <span className="font-medium text-primary">{selectionLabel}</span>
          </span>
          <button onClick={() => { setSubjectId(''); setChapterId(''); setTopicId(''); setExpandedSubject(null); setExpandedChapter(null); }} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
        </div>
      )}

      {/* Subject list */}
      {!searchQuery && (
        <div ref={subjectListRef} className="space-y-1 max-h-48 overflow-y-auto rounded-lg border border-border">
          {initialSubjects.map(s => {
            const subjectChapters = chapters.filter(c => c.subjectId === s.id);
            const isSelected = subjectId === s.id;
            const isExpanded = expandedSubject === s.id;

            return (
              <div key={s.id} className="overflow-hidden">
                <button
                  ref={isSelected ? selectedRef : undefined}
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
                                ref={isChapterSelected ? selectedRef : undefined}
                                onClick={() => {
                                  const newId = isChapterSelected ? '' : chapter.id;
                                  setChapterId(newId);
                                  setTopicId('');
                                  setExpandedChapter(isChapterSelected ? null : chapter.id);
                                  updateAutoTitle(undefined, subjectId, newId, '');
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
                                  <span className="text-xs text-muted-foreground ml-auto">{chapter.topics.length}</span>
                                )}
                              </button>
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
                                          ref={topicId === topic.id ? selectedRef : undefined}
                                          onClick={() => {
                                            const newId = topicId === topic.id ? '' : topic.id;
                                            setTopicId(newId);
                                            if (newId) updateAutoTitle(undefined, subjectId, chapterId, newId);
                                          }}
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
      )}
    </div>
  );

  // Revision group renderer
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
          {items.slice(0, 8).map(item => (
            <button
              key={item.topicId}
              onClick={() => {
                setSubjectId(item.subjectId);
                setChapterId(item.chapterId);
                setTopicId(item.topicId);
                updateAutoTitle(undefined, item.subjectId, item.chapterId, item.topicId);
              }}
              className={`w-full p-2 rounded-lg text-left text-xs transition-all ${
                topicId === item.topicId ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/50'
              }`}
            >
              <span className="font-medium">{item.topicName}</span>
              <span className="text-muted-foreground ml-1">• {item.subjectName}</span>
            </button>
          ))}
          {items.length > 8 && (
            <p className="text-xs text-muted-foreground pl-2">+{items.length - 8} more</p>
          )}
        </div>
      </div>
    );
  };

  // PYQ exam mode fields
  const renderPyqExamMode = () => (
    <>
      {/* Subject pills */}
      <div>
        <label className="text-sm font-medium mb-2 block">Subject</label>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
          {initialSubjects.map(s => (
            <button
              key={s.id}
              onClick={() => { setSubjectId(s.id); updateAutoTitle(undefined, s.id); }}
              className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                subjectId === s.id ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 hover:bg-secondary text-muted-foreground'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>
      {/* Exam */}
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">Exam</label>
        <div className="flex flex-wrap gap-1.5">
          {['NEET PG', 'INICET', 'FMGE', 'All'].map(exam => (
            <button
              key={exam}
              onClick={() => { setPyqExam(exam); setPyqSessions([]); setTimeout(() => updateAutoTitle(undefined, subjectId, '', '', '', pyqFullMock, exam, pyqYears, []), 0); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                pyqExam === exam ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 hover:bg-secondary'
              }`}
            >
              {exam}
            </button>
          ))}
        </div>
      </div>
      {/* Years/Sessions */}
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">
          {pyqExam === 'INICET' || pyqExam === 'FMGE' ? 'Session(s)' : 'Year(s)'}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {(() => {
            const years = Array.from({ length: pyqYearTo - pyqYearFrom + 1 }, (_, i) => pyqYearTo - i);
            if (pyqExam === 'INICET') {
              return years.flatMap(y => [`May ${y}`, `Nov ${y}`]).map(session => (
                <button
                  key={session}
                  onClick={() => { const newSessions = pyqSessions.includes(session) ? pyqSessions.filter(s => s !== session) : [...pyqSessions, session]; setPyqSessions(newSessions); setTimeout(() => updateAutoTitle(undefined, subjectId, '', '', '', pyqFullMock, pyqExam, pyqYears, newSessions), 0); }}
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
                  onClick={() => { const newSessions = pyqSessions.includes(session) ? pyqSessions.filter(s => s !== session) : [...pyqSessions, session]; setPyqSessions(newSessions); setTimeout(() => updateAutoTitle(undefined, subjectId, '', '', '', pyqFullMock, pyqExam, pyqYears, newSessions), 0); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    pyqSessions.includes(session) ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 hover:bg-secondary'
                  }`}
                >
                  {session}
                </button>
              ));
            }
            return years.map(year => (
              <button
                key={year}
                onClick={() => { const newYears = pyqYears.includes(year) ? pyqYears.filter(y => y !== year) : [...pyqYears, year].sort((a, b) => b - a); setPyqYears(newYears); setTimeout(() => updateAutoTitle(undefined, subjectId, '', '', '', pyqFullMock, pyqExam, newYears, pyqSessions), 0); }}
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
  );

  // Type-specific content
  const renderTypeSpecificFields = () => {
    switch (type) {
      case 'study':
      case 'mcq':
        return renderSubjectPicker(true);

      case 'revision':
        return (
          <div className="space-y-3">
            {/* Due revisions */}
            {renderRevisionGroup('Overdue', revisionGroups.backlog, <AlertTriangle className="w-4 h-4" />, 'text-red-500')}
            {renderRevisionGroup('Due Today', revisionGroups.today, <CalendarClock className="w-4 h-4" />, 'text-primary')}
            {renderRevisionGroup('This Week', revisionGroups.thisWeek, <CalendarClock className="w-4 h-4" />, 'text-muted-foreground')}
            {revisionGroups.backlog.length === 0 && revisionGroups.today.length === 0 && revisionGroups.thisWeek.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-3">No revisions due this week 🎉</p>
            )}
            {!topicId && (
              <>
                <div className="text-xs text-muted-foreground text-center">— or select manually —</div>
                {renderSubjectPicker(true)}
              </>
            )}
          </div>
        );

      case 'pyq':
        return (
          <div className="space-y-3">
            {/* Full PYQ Mock option */}
            <button
              onClick={() => {
                const newVal = !pyqFullMock;
                setPyqFullMock(newVal);
                if (newVal) {
                  setSubjectId('');
                  setChapterId('');
                  setTopicId('');
                  updateAutoTitle(undefined, '', '', '', '', newVal);
                } else {
                  setTitle('');
                }
              }}
              className={`w-full p-2.5 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-2 ${
                pyqFullMock ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50 text-muted-foreground hover:text-primary'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="text-xs font-medium">Full PYQ Mock</span>
            </button>

            {pyqFullMock && renderPyqExamMode()}

            {!pyqFullMock && (
              <>
                {/* Mode toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setPyqMode('chapter'); setSubjectId(''); setChapterId(''); setTitle(''); }}
                    className={`flex-1 p-2 rounded-lg border-2 text-xs font-medium transition-all text-center ${
                      pyqMode === 'chapter' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                    }`}
                  >
                    Subject + Chapter
                  </button>
                  <button
                    onClick={() => { setPyqMode('exam'); setSubjectId(''); setChapterId(''); setTitle(''); }}
                    className={`flex-1 p-2 rounded-lg border-2 text-xs font-medium transition-all text-center ${
                      pyqMode === 'exam' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                    }`}
                  >
                    Subject + Exam + Year
                  </button>
                </div>

                {pyqMode === 'chapter' && renderSubjectPicker(false)}
                {pyqMode === 'exam' && renderPyqExamMode()}
              </>
            )}
          </div>
        );

      case 'test':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Source</label>
              <Input
                value={testSource}
                onChange={e => setTestSource(e.target.value)}
                placeholder="e.g., Marrow, PrepLadder..."
                autoFocus={false}
              />
            </div>
            {renderSubjectPicker(true)}
          </div>
        );

      case 'mock':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Source</label>
              <Input
                value={testSource}
                onChange={e => setTestSource(e.target.value)}
                placeholder="e.g., Marrow, PrepLadder..."
                autoFocus={false}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
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
            className="fixed inset-x-0 bottom-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-card rounded-t-2xl md:rounded-2xl shadow-card-hover border border-border z-50 max-h-[90vh] flex flex-col"
          >
            {/* Drag Handle - Mobile */}
            <div className="md:hidden flex justify-center pt-3">
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-4 shrink-0">
              <h2 className="text-lg font-bold">Add Task</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <ScrollArea className="flex-1 overflow-auto">
              <div className="px-4 pb-4 space-y-4">
                {/* Title */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Task Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={type === 'mock' ? 'e.g., Marrow GT 5' : type === 'test' ? 'e.g., Anatomy Test 3' : 'e.g., Complete CNS Videos'}
                    autoFocus={false}
                  />
                </div>

                {/* Type Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {taskTypes.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => handleTypeChange(value)}
                        className={`p-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                          type === value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary/50 hover:bg-secondary text-muted-foreground'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'high', label: 'High', color: 'bg-red-500/20 text-red-500 border-red-500/30' },
                      { value: 'medium', label: 'Medium', color: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30' },
                      { value: 'low', label: 'Low', color: 'bg-green-500/20 text-green-500 border-green-500/30' },
                    ].map(({ value, label, color }) => (
                      <button
                        key={value}
                        onClick={() => setPriority(value as Task['priority'])}
                        className={`p-2.5 rounded-lg text-sm font-medium border transition-all ${
                          priority === value
                            ? color
                            : 'bg-secondary/50 hover:bg-secondary text-muted-foreground border-transparent'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Duration</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {durationPresets.map(preset => (
                      <button
                        key={preset}
                        onClick={() => setDuration(preset)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          duration === preset
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary/50 hover:bg-secondary'
                        }`}
                      >
                        {preset}m
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => adjustDuration(-5)} className="h-10 w-10">
                      <Minus className="w-4 h-4" />
                    </Button>
                    <div className="text-center min-w-16">
                      <span className="text-2xl font-bold">{duration}</span>
                      <span className="text-sm text-muted-foreground ml-1">min</span>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => adjustDuration(5)} className="h-10 w-10">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Type-specific fields */}
                {renderTypeSpecificFields()}

                {/* Notes */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Notes (Optional)</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes for this task..."
                    className="min-h-[60px] text-sm"
                  />
                </div>
              </div>
            </ScrollArea>

            {/* Submit */}
            <div className="p-4 border-t border-border shrink-0">
              <Button
                onClick={handleSubmit}
                className="w-full h-12 text-base gradient-primary text-primary-foreground"
                disabled={!title.trim()}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Task
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
