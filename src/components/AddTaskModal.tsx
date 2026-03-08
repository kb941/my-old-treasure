import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ChevronDown, ChevronRight, Minus, Search, BookOpen, Brain, FileText, ClipboardList, Beaker } from 'lucide-react';
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

export function AddTaskModal({ isOpen, onClose, onAdd, defaultColumn, chapters = [] }: AddTaskModalProps) {
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

  // Reset everything on close/open
  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setType('study');
      setSubjectId('');
      setChapterId('');
      setTopicId('');
      setDuration(30);
      setPriority('medium');
      setNotes('');
      setExpandedSubject(null);
      setExpandedChapter(null);
      setSearchQuery('');
    }
  }, [isOpen]);

  const selectedSubjectChapters = chapters.filter(c => c.subjectId === subjectId);
  const selectedChapter = selectedSubjectChapters.find(c => c.id === chapterId);

  // Search results across all subjects/chapters/topics
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const results: { subjectId: string; subjectName: string; chapterId: string; chapterName: string; topicId?: string; topicName?: string }[] = [];

    chapters.forEach(ch => {
      const subjectName = initialSubjects.find(s => s.id === ch.subjectId)?.name || '';
      // Check chapter name match
      if (ch.name.toLowerCase().includes(q)) {
        results.push({ subjectId: ch.subjectId, subjectName, chapterId: ch.id, chapterName: ch.name });
      }
      // Check topics
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

  const autoFillTitle = (subName?: string, topName?: string) => {
    const label = typeLabels[type];
    if (topName) setTitle(`${label} - ${topName}`);
    else if (subName) setTitle(`${label} - ${subName}`);
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
      const sub = initialSubjects.find(s => s.id === id);
      if (sub && !title) autoFillTitle(sub.name);
    }
  };

  const handleSearchResultClick = (result: NonNullable<typeof searchResults>[0]) => {
    setSubjectId(result.subjectId);
    setChapterId(result.chapterId);
    if (result.topicId) {
      setTopicId(result.topicId);
      autoFillTitle(undefined, result.topicName);
    } else {
      setTopicId('');
      autoFillTitle(result.chapterName);
    }
    setSearchQuery('');
    setExpandedSubject(result.subjectId);
    setExpandedChapter(result.chapterId);
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
                    placeholder="e.g., Complete CNS Videos"
                  />
                </div>

                {/* Type Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {taskTypes.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => {
                          setType(value);
                          // Update title prefix if auto-generated
                          if (title && Object.values(typeLabels).some(l => title.startsWith(l + ' - '))) {
                            const suffix = title.split(' - ').slice(1).join(' - ');
                            if (suffix) setTitle(`${typeLabels[value]} - ${suffix}`);
                          }
                        }}
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

                {/* Subject/Chapter/Topic Selection with Search */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject / Topic (Optional)</label>

                  {/* Search bar */}
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search topics, chapters..."
                      className="pl-9 h-9 text-sm"
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

                  {/* Subject list (hidden when searching) */}
                  {!searchQuery && (
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
                                              const newId = isChapterSelected ? '' : chapter.id;
                                              setChapterId(newId);
                                              setTopicId('');
                                              setExpandedChapter(isChapterSelected ? null : chapter.id);
                                              if (newId && !title) autoFillTitle(chapter.name);
                                            }}
                                            className={`w-full p-2 rounded flex items-center gap-2 text-sm ${
                                              isChapterSelected ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/50'
                                            }`}
                                          >
                                            <ChevronRight className={`w-3 h-3 transition-transform ${isChapterExpanded ? 'rotate-90' : ''}`} />
                                            <span>{chapter.name}</span>
                                            <span className="text-xs text-muted-foreground ml-auto">
                                              {chapter.topics.length}
                                            </span>
                                          </button>
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
                                                    onClick={() => {
                                                      const newId = topicId === topic.id ? '' : topic.id;
                                                      setTopicId(newId);
                                                      if (newId) {
                                                        setTitle(`${typeLabels[type]} - ${topic.name}`);
                                                      }
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
