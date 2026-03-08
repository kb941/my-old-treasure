import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, Star, Trash2, RotateCcw, CalendarDays } from 'lucide-react';
import { Topic, ContentType, DEFAULT_CONTENT_TYPES, getScheduleForConfidence, SpacedRepetitionSettings } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { format, addDays } from 'date-fns';

interface TopicChecklistProps {
  topic: Topic;
  onUpdate: (topic: Topic) => void;
  onDelete: () => void;
  contentTypes?: ContentType[];
  srSettings?: SpacedRepetitionSettings;
}

const stageColors: Record<string, string> = {
  'main-video': 'bg-blue-500',
  'rr-video': 'bg-purple-500',
  'btr-video': 'bg-pink-500',
  'extra-video': 'bg-orange-500',
  'mcqs': 'bg-green-500',
  'pyqs': 'bg-amber-500',
};

export function TopicChecklist({ topic, onUpdate, onDelete, contentTypes, srSettings }: TopicChecklistProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const activeTypes = (contentTypes || DEFAULT_CONTENT_TYPES).filter(ct => ct.enabled);
  const stages = topic.completedStages || [];
  const schedule = getScheduleForConfidence(topic.confidence, srSettings);

  const isStageComplete = (stageId: string) => stages.includes(stageId);

  const toggleStage = (stageId: string) => {
    const isScorableStage = ['main-video', 'rr-video', 'btr-video'].includes(stageId);
    const wasComplete = isStageComplete(stageId);
    const newStages = wasComplete
      ? stages.filter(s => s !== stageId)
      : [...stages, stageId];
    const pyqDone = newStages.includes('pyqs');
    
    const updates: Partial<Topic> = { completedStages: newStages, pyqDone };
    
    // When marking MCQ stage as complete, increment questionsSolved by targetQuestions
    if (!wasComplete && stageId === 'mcqs') {
      updates.questionsSolved = topic.questionsSolved + topic.targetQuestions;
    }
    // When unmarking MCQ stage, reset questionsSolved
    if (wasComplete && stageId === 'mcqs') {
      updates.questionsSolved = Math.max(0, topic.questionsSolved - topic.targetQuestions);
    }
    
    // When marking a scorable stage (main/RR/BTR) as complete, auto-set confidence to 3 and start SR
    if (!wasComplete && isScorableStage && topic.confidence === 0) {
      updates.confidence = 3;
      updates.lastStudied = new Date();
      const newSchedule = getScheduleForConfidence(3, srSettings);
      if (newSchedule[0]) {
        updates.nextRevisionDate = addDays(new Date(), newSchedule[0].daysAfterPrevious);
        updates.revisionSession = 0;
      }
    }
    
    onUpdate({ ...topic, ...updates });
  };

  const setConfidence = (value: number) => {
    // Recalculate next revision based on new confidence
    const newSchedule = getScheduleForConfidence(value, srSettings);
    const updates: Partial<Topic> = { confidence: value };
    
    // If topic has a revision date, recalculate based on new schedule
    if (topic.lastStudied && topic.revisionSession < newSchedule.length) {
      const sessionInfo = newSchedule[topic.revisionSession];
      if (sessionInfo) {
        updates.nextRevisionDate = addDays(topic.lastStudied, sessionInfo.daysAfterPrevious);
      }
    }
    
    onUpdate({ ...topic, ...updates });
  };

  const startRevisionSchedule = () => {
    const firstSession = schedule[0];
    if (firstSession) {
      onUpdate({
        ...topic,
        lastStudied: new Date(),
        nextRevisionDate: addDays(new Date(), firstSession.daysAfterPrevious),
        revisionSession: 0,
      });
    }
  };

  const resetRevisionSchedule = () => {
    onUpdate({
      ...topic,
      nextRevisionDate: null,
      revisionSession: 0,
    });
  };

  const completedCount = activeTypes.filter(ct => isStageComplete(ct.id)).length;

  return (
    <div className="bg-background/50 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-2 sm:p-3 flex items-center gap-2 sm:gap-3 hover:bg-secondary/30 transition-colors"
      >
        <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium truncate text-left">{topic.name}</p>
          <div className="flex items-center gap-0.5 sm:gap-1 mt-1 flex-wrap">
            {activeTypes.map(ct => {
              const checked = isStageComplete(ct.id);
              const color = stageColors[ct.id] || 'bg-primary';
              return (
                <span key={ct.id} className={cn(
                  "inline-flex items-center gap-0.5 px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-medium transition-all",
                  checked ? `${color} text-white` : "bg-muted/50 text-muted-foreground"
                )}>
                  {checked && <Check className="w-2 h-2" />}
                  {ct.shortLabel}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} className={cn(
                "w-2.5 h-2.5 sm:w-3 sm:h-3",
                star <= topic.confidence ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"
              )} />
            ))}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-2 sm:px-3 pb-2 sm:pb-3 space-y-2 sm:space-y-3">
              {/* Stage toggles */}
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {activeTypes.map(ct => {
                  const checked = isStageComplete(ct.id);
                  const color = stageColors[ct.id] || 'bg-primary';
                  return (
                    <button key={ct.id} onClick={(e) => { e.stopPropagation(); toggleStage(ct.id); }}
                      className={cn(
                        "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all",
                        checked ? `${color} text-white shadow-sm` : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                      )}>
                      <div className={cn(
                        "w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border flex items-center justify-center transition-all",
                        checked ? "bg-white/20 border-white/30" : "border-muted-foreground/30"
                      )}>
                        {checked && <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5" />}
                      </div>
                      {ct.label}
                    </button>
                  );
                })}
              </div>

              {/* Confidence */}
              <div className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Confidence</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={(e) => { e.stopPropagation(); setConfidence(star); }} className="p-0.5">
                      <Star className={cn(
                        "w-5 h-5 transition-all",
                        star <= topic.confidence ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30 hover:text-amber-400/50"
                      )} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Spaced Repetition Info */}
              <div className="p-2.5 bg-secondary/30 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5" /> Spaced Repetition
                  </span>
                  {topic.nextRevisionDate ? (
                    <button onClick={(e) => { e.stopPropagation(); resetRevisionSchedule(); }}
                      className="text-[10px] text-destructive hover:underline">
                      Reset
                    </button>
                  ) : topic.lastStudied ? (
                    <button onClick={(e) => { e.stopPropagation(); startRevisionSchedule(); }}
                      className="text-[10px] text-primary hover:underline font-medium">
                      Start Schedule
                    </button>
                  ) : null}
                </div>

                {topic.nextRevisionDate ? (
                  <>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs">
                        Next: <span className="font-medium">{format(new Date(topic.nextRevisionDate), 'MMM d, yyyy')}</span>
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                        Review {topic.revisionSession + 1}/{schedule.length}
                      </span>
                    </div>
                    {/* Mini schedule timeline */}
                    <div className="flex gap-1 mt-1">
                      {schedule.map((s, i) => (
                        <div key={i} className={cn(
                          "flex-1 h-1.5 rounded-full",
                          i < topic.revisionSession ? "bg-primary" 
                          : i === topic.revisionSession ? "bg-amber-400" 
                          : "bg-secondary"
                        )} title={`${s.name}: ${s.daysAfterPrevious}d`} />
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {topic.lastStudied ? 'Schedule not active. Click "Start Schedule" above.' : 'Study this topic first to enable revision scheduling.'}
                  </p>
                )}
              </div>

              {/* Questions */}
              <div className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Questions</span>
                <span className="text-sm font-medium">{topic.questionsSolved}/{topic.targetQuestions}</span>
              </div>

              {/* Delete */}
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="w-4 h-4 mr-2" /> Remove Topic
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
