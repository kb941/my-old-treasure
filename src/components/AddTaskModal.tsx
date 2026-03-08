import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ChevronDown, ChevronRight, Minus } from 'lucide-react';
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

const durationPresets = [15, 30, 45, 60, 90];

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

  const selectedSubjectChapters = chapters.filter(c => c.subjectId === subjectId);
  const selectedChapter = selectedSubjectChapters.find(c => c.id === chapterId);

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

    // Reset form
    setTitle('');
    setType('study');
    setSubjectId('');
    setChapterId('');
    setTopicId('');
    setDuration(30);
    setPriority('medium');
    setNotes('');
    onClose();
  };

  // Auto-generate title based on selection
  const autoTitle = () => {
    const parts: string[] = [];
    const typeLabels = { study: 'Study', revision: 'Revise', mcq: 'MCQs', mock: 'Mock Test' };
    parts.push(typeLabels[type]);
    
    if (topicId && selectedChapter) {
      const topic = selectedChapter.topics.find(t => t.id === topicId);
      if (topic) parts.push(topic.name);
    } else if (chapterId && selectedChapter) {
      parts.push(selectedChapter.name);
    } else if (subjectId) {
      const sub = initialSubjects.find(s => s.id === subjectId);
      if (sub) parts.push(sub.name);
    }
    
    return parts.join(' - ');
  };

  const handleSubjectSelect = (id: string) => {
    if (subjectId === id) {
      setExpandedSubject(expandedSubject === id ? null : id);
    } else {
      setSubjectId(id);
      setChapterId('');
      setTopicId('');
      setExpandedSubject(id);
      // Auto-fill title
      const sub = initialSubjects.find(s => s.id === id);
      const typeLabels = { study: 'Study', revision: 'Revise', mcq: 'MCQs', mock: 'Mock Test' };
      if (sub && !title) setTitle(`${typeLabels[type]} - ${sub.name}`);
    }
  };

  const adjustDuration = (delta: number) => {
    setDuration(prev => Math.max(5, prev + delta));
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
                    placeholder="e.g., Complete CNS Videos"
                    autoFocus
                  />
                </div>

                {/* Type Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: 'study', label: 'Study' },
                      { value: 'revision', label: 'Revision' },
                      { value: 'mcq', label: 'MCQs' },
                      { value: 'mock', label: 'Mock' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setType(value as Task['type'])}
                        className={`p-2.5 rounded-lg text-sm font-medium transition-all ${
                          type === value 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-secondary/50 hover:bg-secondary text-muted-foreground'
                        }`}
                      >
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

                {/* Subject Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject (Optional)</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {initialSubjects.map(s => (
                      <div key={s.id} className="rounded-lg overflow-hidden border border-border">
                        <button
                          onClick={() => handleSubjectSelect(s.id)}
                          className={`w-full p-3 flex items-center justify-between text-left text-sm transition-all ${
                            subjectId === s.id
                              ? 'bg-primary/10 text-primary'
                              : 'bg-secondary/30 hover:bg-secondary/50'
                          }`}
                        >
                          <span className="font-medium">{s.name}</span>
                          {selectedSubjectChapters.length > 0 && subjectId === s.id && (
                            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSubject === s.id ? '' : '-rotate-90'}`} />
                          )}
                        </button>
                        
                        {/* Chapter/Topic Selection */}
                        {expandedSubject === s.id && selectedSubjectChapters.length > 0 && (
                          <div className="bg-background/50 border-t border-border p-2 space-y-1">
                            {selectedSubjectChapters.map(chapter => (
                              <div key={chapter.id}>
                                <button
                                  onClick={() => {
                                    setChapterId(chapterId === chapter.id ? '' : chapter.id);
                                    setTopicId('');
                                  }}
                                  className={`w-full p-2 rounded flex items-center gap-2 text-sm ${
                                    chapterId === chapter.id ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/50'
                                  }`}
                                >
                                  <ChevronRight className={`w-3 h-3 transition-transform ${chapterId === chapter.id ? 'rotate-90' : ''}`} />
                                  <span>{chapter.name}</span>
                                </button>
                                
                                {chapterId === chapter.id && chapter.topics.length > 0 && (
                                  <div className="ml-5 pl-2 border-l border-border space-y-1 mt-1">
                                    {chapter.topics.map(topic => (
                                      <button
                                        key={topic.id}
                                        onClick={() => {
                                          const newTopicId = topicId === topic.id ? '' : topic.id;
                                          setTopicId(newTopicId);
                                          if (newTopicId) {
                                            const typeLabels = { study: 'Study', revision: 'Revise', mcq: 'MCQs', mock: 'Mock Test' };
                                            setTitle(`${typeLabels[type]} - ${topic.name}`);
                                          }
                                        }}
                                        className={`w-full p-1.5 rounded text-xs text-left ${
                                          topicId === topic.id ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/50'
                                        }`}
                                      >
                                        {topic.name}
                                      </button>
                                    ))}

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
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
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
