import { useMemo } from 'react';
import { Chapter, RevisionReminder, SPACED_REPETITION_SCHEDULE } from '@/types';
import { isBefore, isToday, isTomorrow, startOfDay } from 'date-fns';

export function useRevisionReminders(chapters: Chapter[]) {
  const reminders = useMemo(() => {
    const allReminders: RevisionReminder[] = [];
    const today = startOfDay(new Date());

    chapters.forEach(chapter => {
      chapter.topics.forEach(topic => {
        if (topic.nextRevisionDate) {
          const dueDate = startOfDay(new Date(topic.nextRevisionDate));
          const isOverdue = isBefore(dueDate, today) && !isToday(dueDate);
          const isDueToday = isToday(dueDate);
          const isDueTomorrow = isTomorrow(dueDate);

          if (isOverdue || isDueToday || isDueTomorrow) {
            const sessionInfo = SPACED_REPETITION_SCHEDULE[topic.revisionSession] ||
                               SPACED_REPETITION_SCHEDULE[SPACED_REPETITION_SCHEDULE.length - 1];

            allReminders.push({
              topicId: topic.id,
              topicName: topic.name,
              subjectId: topic.subjectId,
              chapterId: chapter.id,
              dueDate: new Date(topic.nextRevisionDate),
              sessionNumber: topic.revisionSession + 1,
              sessionName: sessionInfo?.name || 'Review',
              isOverdue,
              isDueTomorrow,
            });
          }
        }
      });
    });

    return allReminders.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      if (a.isDueTomorrow && !b.isDueTomorrow) return 1;
      if (!a.isDueTomorrow && b.isDueTomorrow) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  }, [chapters]);

  const overdueCount = useMemo(() =>
    reminders.filter(r => r.isOverdue).length,
    [reminders]
  );

  const todayCount = useMemo(() =>
    reminders.filter(r => !r.isOverdue && !r.isDueTomorrow).length,
    [reminders]
  );

  const tomorrowCount = useMemo(() =>
    reminders.filter(r => r.isDueTomorrow).length,
    [reminders]
  );

  return {
    reminders,
    overdueCount,
    todayCount,
    tomorrowCount,
    hasReminders: reminders.length > 0,
  };
}
