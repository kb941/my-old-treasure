import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, BookOpen, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Chapter, Subject } from '@/types';
import { cn } from '@/lib/utils';

interface TopicSearchProps {
  chapters: Chapter[];
  subjects: Subject[];
  onTopicSelect?: (subjectId: string) => void;
}

export function TopicSearch({ chapters, subjects, onTopicSelect }: TopicSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    const matches: { topicName: string; chapterName: string; subjectId: string; subjectName: string; stagesCompleted: number; totalStages: number }[] = [];

    chapters.forEach(chapter => {
      const subject = subjects.find(s => s.id === chapter.subjectId);
      chapter.topics.forEach(topic => {
        if (topic.name.toLowerCase().includes(q) || chapter.name.toLowerCase().includes(q)) {
          matches.push({
            topicName: topic.name,
            chapterName: chapter.name,
            subjectId: chapter.subjectId,
            subjectName: subject?.name || chapter.subjectId,
            stagesCompleted: (topic.completedStages || []).length,
            totalStages: 6,
          });
        }
      });
    });

    return matches.slice(0, 30);
  }, [query, chapters, subjects]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search topics across all subjects..."
          className="pl-9 pr-9 h-10 bg-secondary/50"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-secondary rounded"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-card-hover z-50 overflow-hidden"
          >
            <ScrollArea className="max-h-72">
              {results.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No topics found for "{query}"
                </div>
              ) : (
                <div className="p-1">
                  <p className="text-xs text-muted-foreground px-3 py-1.5">{results.length} result{results.length !== 1 ? 's' : ''}</p>
                  {results.map((r, i) => (
                    <button
                      key={`${r.subjectId}-${r.chapterName}-${r.topicName}-${i}`}
                      onClick={() => {
                        onTopicSelect?.(r.subjectId);
                        setIsOpen(false);
                        setQuery('');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-secondary/50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{r.topicName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {r.subjectName} → {r.chapterName}
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-1">
                        <span className={cn(
                          "text-xs px-1.5 py-0.5 rounded",
                          r.stagesCompleted > 0 ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                        )}>
                          {r.stagesCompleted}/{r.totalStages}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
