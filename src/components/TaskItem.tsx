import { motion } from 'framer-motion';
import { Play, Clock, BookOpen, Brain, FileText, Check, GripVertical, ArrowRight, ArrowLeft, Pause, RotateCcw, Coffee, CheckCircle2, Star, Trash2, Pencil } from 'lucide-react';
import { Task, TaskColumn, PomodoroSettings } from '@/types';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';

const typeIcons: Record<string, typeof BookOpen> = {
  study: BookOpen,
  revision: Brain,
  mcq: FileText,
  mock: FileText,
  pyq: FileText,
  test: FileText,
};

const priorityColors = {
  high: 'border-l-destructive',
  medium: 'border-l-primary',
  low: 'border-l-muted-foreground',
};

const columnOrder: TaskColumn[] = ['backlog', 'week', 'today', 'done'];

const DEFAULT_POMODORO: PomodoroSettings = {
  studyDuration: 25, shortBreakDuration: 5, longBreakDuration: 15, sessionsBeforeLongBreak: 4,
};

type TimerPhase = 'study' | 'short-break' | 'long-break';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onMove: (taskId: string, direction: 'left' | 'right') => void;
  onTimerComplete?: (taskId: string, duration: number) => void;
  onDone?: (taskId: string, elapsedMinutes: number, confidence?: number) => void;
  onDelete?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onStartFocus?: (taskId: string) => void;
  showTimer?: boolean;
  isDraggable?: boolean;
  pomodoroSettings?: PomodoroSettings;
}

export function TaskItem({
  task, onToggle, onMove, onTimerComplete, onDone, onDelete, onEdit, onStartFocus,
  showTimer = false, isDraggable = false,
  pomodoroSettings = DEFAULT_POMODORO
}: TaskItemProps) {
  const Icon = typeIcons[task.type];
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [phase, setPhase] = useState<TimerPhase>('study');
  const [sessionCount, setSessionCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(pomodoroSettings.studyDuration * 60);
  const [totalElapsedStudyTime, setTotalElapsedStudyTime] = useState(0);
  const [showConfidencePicker, setShowConfidencePicker] = useState(false);
  const [selectedConfidence, setSelectedConfidence] = useState(3);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentColumnIndex = columnOrder.indexOf(task.column);
  const canMoveLeft = currentColumnIndex > 0;
  const canMoveRight = currentColumnIndex < columnOrder.length - 1;

  const getPhaseDuration = (p: TimerPhase) => {
    switch (p) {
      case 'study': return pomodoroSettings.studyDuration * 60;
      case 'short-break': return pomodoroSettings.shortBreakDuration * 60;
      case 'long-break': return pomodoroSettings.longBreakDuration * 60;
    }
  };

  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (phase === 'study') {
              const newSessionCount = sessionCount + 1;
              setSessionCount(newSessionCount);
              if (newSessionCount % pomodoroSettings.sessionsBeforeLongBreak === 0) {
                setPhase('long-break');
                return pomodoroSettings.longBreakDuration * 60;
              } else {
                setPhase('short-break');
                return pomodoroSettings.shortBreakDuration * 60;
              }
            } else {
              setPhase('study');
              return pomodoroSettings.studyDuration * 60;
            }
          }
          return prev - 1;
        });
        if (phase === 'study') {
          setTotalElapsedStudyTime(prev => prev + 1);
        }
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isTimerRunning, timeRemaining, phase, sessionCount, pomodoroSettings]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setPhase('study');
    setSessionCount(0);
    setTimeRemaining(pomodoroSettings.studyDuration * 60);
    setTotalElapsedStudyTime(0);
  };

  const handleDone = () => {
    setIsTimerRunning(false);
    if (task.topicId) {
      setShowConfidencePicker(true);
    } else {
      const elapsedMinutes = Math.ceil(totalElapsedStudyTime / 60);
      onDone?.(task.id, elapsedMinutes);
      onTimerComplete?.(task.id, elapsedMinutes);
      resetTimer();
    }
  };

  const confirmDoneWithConfidence = () => {
    const elapsedMinutes = Math.ceil(totalElapsedStudyTime / 60);
    onDone?.(task.id, elapsedMinutes, selectedConfidence);
    onTimerComplete?.(task.id, elapsedMinutes);
    resetTimer();
    setShowConfidencePicker(false);
  };

  const progress = ((getPhaseDuration(phase) - timeRemaining) / getPhaseDuration(phase)) * 100;

  return (
    <motion.div
      layout={!isDraggable}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className={cn(
        "bg-card rounded-lg p-3 shadow-card border border-border border-l-[3px] transition-all",
        priorityColors[task.priority],
        task.completed && "opacity-50",
        isDraggable && "cursor-grab active:cursor-grabbing"
      )}
    >
      <div className="flex items-start gap-2">
        {isDraggable && (
          <GripVertical className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 mt-1" />
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
          className={cn(
            "w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
            task.completed ? "bg-primary border-primary" : "border-muted-foreground/40 hover:border-primary"
          )}
        >
          {task.completed && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
        </button>

        <div className="flex-1 min-w-0">
          <p className={cn("font-medium text-sm leading-tight", task.completed && "line-through text-muted-foreground")}>
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Icon className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground capitalize">{task.type}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{task.duration}m</span>
          </div>

          {/* Timer */}
          {showTimer && task.column === 'today' && !task.completed && (
            <div className="mt-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  {phase === 'study' ? <BookOpen className="w-3 h-3 text-primary" /> : <Coffee className="w-3 h-3 text-accent" />}
                  <span className={cn("text-[11px] font-medium capitalize", phase === 'study' ? "text-primary" : "text-accent")}>
                    {phase.replace('-', ' ')}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">Session {sessionCount + 1}</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full", phase === 'study' ? "bg-primary" : "bg-accent")}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-semibold w-12 text-right">{formatTime(timeRemaining)}</span>
              </div>

              {totalElapsedStudyTime > 0 && (
                <p className="text-[10px] text-muted-foreground mt-1 text-center">
                  Total: {Math.floor(totalElapsedStudyTime / 60)}m {totalElapsedStudyTime % 60}s
                </p>
              )}

              <div className="flex items-center gap-1 mt-2">
                {!isTimerRunning && onStartFocus ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); onStartFocus(task.id); }}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium bg-primary/10 text-primary hover:bg-primary/15 transition-colors"
                  >
                    <Play className="w-3 h-3" />Start
                  </button>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsTimerRunning(!isTimerRunning); }}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-colors",
                      isTimerRunning ? "bg-accent/10 text-accent hover:bg-accent/15" : "bg-primary/10 text-primary hover:bg-primary/15"
                    )}
                  >
                    {isTimerRunning ? <><Pause className="w-3 h-3" />Pause</> : <><Play className="w-3 h-3" />Start</>}
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDone(); }}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/15 transition-colors"
                >
                  <CheckCircle2 className="w-3 h-3" />Done
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); resetTimer(); }}
                  className="p-1.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <RotateCcw className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>

              {showConfidencePicker && (
                <div className="mt-2 p-2.5 bg-secondary/50 rounded-lg border border-border space-y-2">
                  <p className="text-xs font-medium text-center">How confident are you?</p>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={(e) => { e.stopPropagation(); setSelectedConfidence(star); }} className="p-0.5">
                        <Star className={cn("w-5 h-5 transition-all", star <= selectedConfidence ? "text-accent fill-accent" : "text-muted-foreground/20")} />
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); confirmDoneWithConfidence(); }}
                    className="w-full py-1.5 rounded-md text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/15 transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-0.5">
          {canMoveLeft && (
            <button onClick={(e) => { e.stopPropagation(); onMove(task.id, 'left'); }} className="p-1 hover:bg-secondary rounded transition-colors">
              <ArrowLeft className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
          {canMoveRight && (
            <button onClick={(e) => { e.stopPropagation(); onMove(task.id, 'right'); }} className="p-1 hover:bg-secondary rounded transition-colors">
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
          {onDelete && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="p-1 hover:bg-destructive/10 rounded transition-colors">
              <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
