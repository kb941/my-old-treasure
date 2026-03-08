import { useMemo } from 'react';
import { BookOpen, FileQuestion, FileText } from 'lucide-react';
import { Chapter, ContentType } from '@/types';
import { PYQEntry } from '@/components/PYQTracker';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface SyllabusProgressCardProps {
  chapters: Chapter[];
  contentTypes: ContentType[];
  mcqGoalPerSubject: number;
}

export function SyllabusProgressCard({ chapters, contentTypes, mcqGoalPerSubject }: SyllabusProgressCardProps) {
  const [pyqData] = useLocalStorage<PYQEntry[]>('planos-pyq-tracker-v2', []);

  const { topicsDone, totalTopics, mcqsDone, totalMcqGoal, pyqsDone, totalPyqSessions } = useMemo(() => {
    let topicsDone = 0;
    let totalTopics = 0;
    let mcqsDone = 0;

    // Non-MCQ/PYQ stages
    const studyStageIds = contentTypes
      .filter(ct => ct.enabled && ct.id !== 'mcqs' && ct.id !== 'pyqs')
      .map(ct => ct.id);

    chapters.forEach(ch => {
      ch.topics.forEach(topic => {
        totalTopics++;
        // Topic "done" = at least one study stage completed
        const hasStudyStage = topic.completedStages.some(s => studyStageIds.includes(s));
        if (hasStudyStage) topicsDone++;
        // MCQ done = stage clicked or goal reached
        if (topic.completedStages.includes('mcqs') || topic.questionsSolved >= mcqGoalPerSubject) {
          mcqsDone++;
        }
      });
    });

    // PYQ sessions done
    const pyqSubjectEntries = pyqData.filter(e => e.subjectId !== 'all');
    const pyqsDone = pyqSubjectEntries.filter(e => e.done).length;
    const totalPyqSessions = pyqSubjectEntries.length;

    return {
      topicsDone,
      totalTopics,
      mcqsDone,
      totalMcqGoal: totalTopics,
      pyqsDone,
      totalPyqSessions,
    };
  }, [chapters, contentTypes, mcqGoalPerSubject, pyqData]);

  const topicPct = totalTopics > 0 ? Math.round((topicsDone / totalTopics) * 100) : 0;
  const mcqPct = totalMcqGoal > 0 ? Math.round((mcqsDone / totalMcqGoal) * 100) : 0;
  const pyqPct = totalPyqSessions > 0 ? Math.round((pyqsDone / totalPyqSessions) * 100) : 0;

  const metrics = [
    { icon: BookOpen, label: 'Topics', done: topicsDone, total: totalTopics, pct: topicPct, color: 'text-blue-500' },
    { icon: FileQuestion, label: 'MCQs', done: mcqsDone, total: totalMcqGoal, pct: mcqPct, color: 'text-amber-500' },
    { icon: FileText, label: 'PYQs', done: pyqsDone, total: totalPyqSessions, pct: pyqPct, color: 'text-emerald-500' },
  ];

  return (
    <div className="bg-card rounded-xl p-3 border border-border">
      <div className="grid grid-cols-3 gap-2">
        {metrics.map(m => (
          <div key={m.label} className="text-center space-y-1.5">
            <div className="flex items-center justify-center gap-1">
              <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
              <span className="text-[10px] font-medium text-muted-foreground">{m.label}</span>
            </div>
            <p className="text-sm font-bold">{m.pct}%</p>
            <div className="h-1 bg-secondary rounded-full overflow-hidden mx-2">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${m.pct}%`,
                  background: m.label === 'Topics' ? 'hsl(var(--primary))' : m.label === 'MCQs' ? 'hsl(45, 93%, 47%)' : 'hsl(152, 60%, 42%)',
                }}
              />
            </div>
            <p className="text-[9px] text-muted-foreground">{m.done}/{m.total}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
