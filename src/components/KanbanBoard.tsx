import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Plus, Archive, CalendarDays, CalendarCheck, CheckCircle2, Trash2, ArrowUpDown } from 'lucide-react';
import { Task, TaskColumn, PomodoroSettings, Chapter } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TaskItem } from '@/components/TaskItem';
import { AddTaskModal } from '@/components/AddTaskModal';
import { useIsMobile } from '@/hooks/use-mobile';

interface KanbanBoardProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  onToggleTask: (id: string) => void;
  onTimerComplete?: (taskId: string, duration: number) => void;
  onTaskDone?: (taskId: string, duration: number) => void;
  onStartFocus?: (taskId: string) => void;
  pomodoroSettings?: PomodoroSettings;
  chapters?: Chapter[];
}

const columns: { id: TaskColumn; label: string; icon: typeof Archive }[] = [
  { id: 'backlog', label: 'Backlog', icon: Archive },
  { id: 'week', label: 'This Week', icon: CalendarDays },
  { id: 'today', label: 'Today', icon: CalendarCheck },
  { id: 'done', label: 'Done', icon: CheckCircle2 },
];

const columnColors: Record<TaskColumn, string> = {
  backlog: 'bg-muted-foreground',
  week: 'bg-secondary-foreground',
  today: 'bg-primary',
  done: 'bg-green-500',
};

export function KanbanBoard({ tasks, onTasksChange, onToggleTask, onTimerComplete, onTaskDone, onStartFocus, pomodoroSettings, chapters = [] }: KanbanBoardProps) {
  const isMobile = useIsMobile();
  const [activeColumn, setActiveColumn] = useState<TaskColumn>('today');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addToColumn, setAddToColumn] = useState<TaskColumn>('today');
  const [reorderMode, setReorderMode] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const getColumnTasks = (columnId: TaskColumn) =>
    tasks.filter(t => t.column === columnId);

  const moveTask = (taskId: string, direction: 'left' | 'right') => {
    const columnOrder: TaskColumn[] = ['backlog', 'week', 'today', 'done'];
    onTasksChange(tasks.map(t => {
      if (t.id === taskId) {
        const currentIndex = columnOrder.indexOf(t.column);
        const newIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1;
        if (newIndex >= 0 && newIndex < columnOrder.length) {
          const newColumn = columnOrder[newIndex];
          return { ...t, column: newColumn, completed: newColumn === 'done' };
        }
      }
      return t;
    }));
  };

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = { ...task, id: Date.now().toString() };
    onTasksChange([...tasks, newTask]);
  };

  const deleteTask = (taskId: string) => {
    onTasksChange(tasks.filter(t => t.id !== taskId));
  };

  const editTask = (updatedTask: Task) => {
    onTasksChange(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setAddToColumn(task.column);
    setAddModalOpen(true);
  };

  const clearDone = () => {
    onTasksChange(tasks.filter(t => t.column !== 'done'));
  };

  const openAddModal = (column: TaskColumn) => {
    setAddToColumn(column);
    setAddModalOpen(true);
  };

  const reorderColumn = (columnId: TaskColumn, newOrder: Task[]) => {
    const otherTasks = tasks.filter(t => t.column !== columnId);
    onTasksChange([...otherTasks, ...newOrder]);
  };

  const renderTaskList = (columnId: TaskColumn, columnTasks: Task[]) => {
    if (reorderMode) {
      return (
        <Reorder.Group
          axis="y"
          values={columnTasks}
          onReorder={(newOrder) => reorderColumn(columnId, newOrder)}
          className="space-y-2"
        >
          {columnTasks.map(task => (
            <Reorder.Item key={task.id} value={task}>
              <TaskItem
                task={task}
                onToggle={onToggleTask}
                onMove={moveTask}
                onDelete={deleteTask}
                onTimerComplete={onTimerComplete}
                onDone={onTaskDone}
                onStartFocus={onStartFocus}
                showTimer={columnId === 'today'}
                isDraggable={true}
                pomodoroSettings={pomodoroSettings}
              />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      );
    }

    return (
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {columnTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggleTask}
              onMove={moveTask}
              onDelete={deleteTask}
              onTimerComplete={onTimerComplete}
              onDone={onTaskDone}
              onStartFocus={onStartFocus}
              showTimer={columnId === 'today'}
              isDraggable={false}
              pomodoroSettings={pomodoroSettings}
            />
          ))}
        </AnimatePresence>
      </div>
    );
  };

  // Mobile: Tab view
  if (isMobile) {
    const columnTasks = getColumnTasks(activeColumn);

    return (
      <div className="space-y-3">
        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-secondary/60 rounded-xl overflow-x-auto">
          {columns.map(col => {
            const Icon = col.icon;
            const count = getColumnTasks(col.id).length;
            return (
              <button
                key={col.id}
                onClick={() => setActiveColumn(col.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                  activeColumn === col.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className={cn(
                  "min-w-4 h-4 flex items-center justify-center rounded-full text-[10px]",
                  activeColumn === col.id ? "text-primary font-bold" : ""
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", columnColors[activeColumn])} />
            <h2 className="text-base font-semibold">{columns.find(c => c.id === activeColumn)?.label}</h2>
          </div>
          <div className="flex items-center gap-1.5">
            {columnTasks.length > 1 && (
              <Button
                variant={reorderMode ? "default" : "ghost"}
                size="sm"
                onClick={() => setReorderMode(!reorderMode)}
                className={cn("h-8 px-2 text-xs", reorderMode && "gradient-primary text-primary-foreground")}
              >
                <ArrowUpDown className="w-3.5 h-3.5 mr-1" />
                {reorderMode ? 'Done' : 'Reorder'}
              </Button>
            )}
            {activeColumn === 'done' && columnTasks.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearDone} className="text-destructive h-8">
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Clear
              </Button>
            )}
            {activeColumn !== 'done' && (
              <Button variant="outline" size="sm" onClick={() => openAddModal(activeColumn)} className="h-8">
                <Plus className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Tasks */}
        {columnTasks.length === 0 ? (
          <div className="p-8 border border-dashed border-border rounded-xl text-center text-muted-foreground">
            <p className="text-sm">{activeColumn === 'done' ? 'No completed tasks' : 'No tasks here yet'}</p>
            {activeColumn !== 'done' && (
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => openAddModal(activeColumn)}>
                <Plus className="w-4 h-4 mr-1" /> Add task
              </Button>
            )}
          </div>
        ) : (
          renderTaskList(activeColumn, columnTasks)
        )}

        <AddTaskModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onAdd={addTask}
          defaultColumn={addToColumn}
          chapters={chapters}
        />
      </div>
    );
  }

  // Desktop: Full Kanban
  return (
    <div className="space-y-3">
      {/* Reorder toggle */}
      <div className="flex justify-end">
        <Button
          variant={reorderMode ? "default" : "outline"}
          size="sm"
          onClick={() => setReorderMode(!reorderMode)}
          className={cn("h-8 text-xs", reorderMode && "gradient-primary text-primary-foreground")}
        >
          <ArrowUpDown className="w-3.5 h-3.5 mr-1.5" />
          {reorderMode ? 'Done Reordering' : 'Reorder Tasks'}
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {columns.map(col => {
          const Icon = col.icon;
          const columnTasks = getColumnTasks(col.id);

          return (
            <div key={col.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", columnColors[col.id])} />
                  <h3 className="font-semibold text-sm">{col.label}</h3>
                  <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                    {columnTasks.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {col.id === 'done' && columnTasks.length > 0 && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearDone}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  )}
                  {col.id !== 'done' && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openAddModal(col.id)}>
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="min-h-[200px]">
                {columnTasks.length === 0 ? (
                  <div className="p-4 border border-dashed border-border rounded-xl text-center text-muted-foreground">
                    <p className="text-xs">{col.id === 'done' ? 'Completed tasks appear here' : 'Drop tasks here'}</p>
                  </div>
                ) : (
                  renderTaskList(col.id, columnTasks)
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AddTaskModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={addTask}
        defaultColumn={addToColumn}
        chapters={chapters}
      />
    </div>
  );
}
