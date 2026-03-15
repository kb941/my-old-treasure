import { useCallback } from 'react';
import { Task, Chapter, Topic, StudySession, SPACED_REPETITION_SCHEDULE, getScheduleForConfidence, getCumulativeDays } from '@/types';
import { addDays } from 'date-fns';

interface UseActivitySyncProps {
  chapters: Chapter[];
  onChaptersChange: (chapters: Chapter[]) => void;
  onAddSession?: (session: StudySession) => void;
}

export function useActivitySync({ chapters, onChaptersChange, onAddSession }: UseActivitySyncProps) {
  const syncTaskCompletion = useCallback((task: Task, duration: number) => {
    if (!task.topicId || !task.subjectId) return;

    const updatedChapters = chapters.map(chapter => {
      if (chapter.subjectId !== task.subjectId) return chapter;

      return {
        ...chapter,
        topics: chapter.topics.map(topic => {
          if (topic.id !== task.topicId) return topic;

          const updates: Partial<Topic> = {
            lastStudied: new Date(),
          };

          if (task.type === 'revision') {
            const topicSchedule = getScheduleForConfidence(topic.confidence);
            const nextSession = Math.min(topic.revisionSession + 1, topicSchedule.length);
            updates.revisionSession = nextSession;
            if (nextSession <= topicSchedule.length) {
              const baseDate = topic.lastStudied ? new Date(topic.lastStudied) : new Date();
              updates.nextRevisionDate = addDays(baseDate, getCumulativeDays(topicSchedule, nextSession));
            } else {
              updates.nextRevisionDate = null;
            }
          }

          return { ...topic, ...updates };
        })
      };
    });

    onChaptersChange(updatedChapters);

    if (onAddSession) {
      const session: StudySession = {
        id: `session-${Date.now()}`,
        date: new Date(),
        duration,
        type: task.type,
        subjectId: task.subjectId,
        topicId: task.topicId,
        chapterId: task.chapterId,
      };
      onAddSession(session);
    }
  }, [chapters, onChaptersChange, onAddSession]);

  const syncQuickLog = useCallback((
    subjectId: string,
    topicId: string | undefined,
    chapterId: string | undefined,
    type: 'study' | 'mcq' | 'revision',
    duration: number,
    questionsAttempted?: number,
    questionsCorrect?: number
  ) => {
    if (!topicId) return;

    const updatedChapters = chapters.map(chapter => {
      const matchesChapter = chapterId ? chapter.id === chapterId : chapter.subjectId === subjectId;
      if (!matchesChapter) return chapter;

      return {
        ...chapter,
        topics: chapter.topics.map(topic => {
          if (topic.id !== topicId) return topic;

          const updates: Partial<Topic> = {
            lastStudied: new Date(),
          };

          if (type === 'mcq' && questionsAttempted) {
            updates.questionsSolved = topic.questionsSolved + questionsAttempted;
          }

          if (type === 'revision') {
            const topicSchedule = getScheduleForConfidence(topic.confidence);
            const nextSession = Math.min(topic.revisionSession + 1, topicSchedule.length);
            updates.revisionSession = nextSession;
            if (nextSession <= topicSchedule.length) {
              const baseDate = topic.lastStudied ? new Date(topic.lastStudied) : new Date();
              updates.nextRevisionDate = addDays(baseDate, getCumulativeDays(topicSchedule, nextSession - 1));
            } else {
              updates.nextRevisionDate = null;
            }
          }

          return { ...topic, ...updates };
        })
      };
    });

    onChaptersChange(updatedChapters);

    if (onAddSession) {
      const session: StudySession = {
        id: `session-${Date.now()}`,
        date: new Date(),
        duration,
        type,
        subjectId,
        topicId,
        chapterId,
        questionsAttempted,
        questionsCorrect,
      };
      onAddSession(session);
    }
  }, [chapters, onChaptersChange, onAddSession]);

  const completeRevision = useCallback((topicId: string) => {
    const updatedChapters = chapters.map(chapter => ({
      ...chapter,
      topics: chapter.topics.map(topic => {
        if (topic.id !== topicId) return topic;

        const topicSchedule = getScheduleForConfidence(topic.confidence);
        const nextSession = Math.min(topic.revisionSession + 1, topicSchedule.length);
        const baseDate = topic.lastStudied ? new Date(topic.lastStudied) : new Date();

        return {
          ...topic,
          revisionSession: nextSession,
          nextRevisionDate: nextSession <= topicSchedule.length
            ? addDays(baseDate, getCumulativeDays(topicSchedule, nextSession - 1))
            : null,
        };
      })
    }));

    onChaptersChange(updatedChapters);
  }, [chapters, onChaptersChange]);

  const startSpacedRepetition = useCallback((topicId: string) => {
    const updatedChapters = chapters.map(chapter => ({
      ...chapter,
      topics: chapter.topics.map(topic => {
        if (topic.id !== topicId) return topic;

        const topicSchedule = getScheduleForConfidence(topic.confidence);
        const now = new Date();

        return {
          ...topic,
          revisionSession: 0,
          lastStudied: now,
          nextRevisionDate: addDays(now, topicSchedule[0].daysAfterPrevious),
        };
      })
    }));

    onChaptersChange(updatedChapters);
  }, [chapters, onChaptersChange]);

  return {
    syncTaskCompletion,
    syncQuickLog,
    completeRevision,
    startSpacedRepetition,
  };
}
