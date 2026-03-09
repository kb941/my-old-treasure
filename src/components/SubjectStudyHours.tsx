import { useMemo } from 'react';
import { Clock, BookOpen } from 'lucide-react';
import { StudyLog, Subject } from '@/types';
import { cn } from '@/lib/utils';

interface SubjectStudyHoursProps {
  studyLogs: StudyLog[];
  subjects: Subject[];
}

export function SubjectStudyHours({ studyLogs, subjects }: SubjectStudyHoursProps) {
  const subjectHours = useMemo(() => {
    const map = new Map<string, number>();
    studyLogs.forEach(log => {
      if (log.subjectId) {
        map.set(log.subjectId, (map.get(log.subjectId) || 0) + log.minutesStudied);
      }
    });

    const result = subjects.map(s => ({
      id: s.id,
      name: s.name,
      minutes: map.get(s.id) || 0,
      category: s.category,
    })).filter(s => s.minutes > 0).sort((a, b) => b.minutes - a.minutes);

    return result;
  }, [studyLogs, subjects]);

  const totalMinutes = subjectHours.reduce((sum, s) => sum + s.minutes, 0);
  const maxMinutes = subjectHours[0]?.minutes || 1;

  const categoryColors: Record<string, string> = {
    'Pre-clinical': 'bg-blue-500',
    'Para-clinical': 'bg-purple-500',
    'Clinical': 'bg-emerald-500',
    'Short Subjects': 'bg-amber-500',
  };

  if (subjectHours.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-4 text-center">
        <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No study hours logged yet</p>
        <p className="text-[10px] text-muted-foreground mt-1">Log sessions to see your per-subject breakdown</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Study Hours by Subject</h3>
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          {(totalMinutes / 60).toFixed(1)}h total
        </span>
      </div>

      <div className="space-y-2">
        {subjectHours.map(s => {
          const hours = (s.minutes / 60).toFixed(1);
          const percentage = Math.round((s.minutes / maxMinutes) * 100);
          return (
            <div key={s.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium truncate">{s.name}</span>
                <span className="text-[10px] text-muted-foreground font-medium">{hours}h</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", categoryColors[s.category] || 'bg-primary')}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
