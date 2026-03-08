export type SubjectCategory = 'Pre-clinical' | 'Para-clinical' | 'Clinical' | 'Short Subjects';

export interface Subject {
  id: string;
  name: string;
  category: SubjectCategory;
  weightage: number;
  progress: number;
  accuracy: number;
  lastRevised: Date | null;
  topicsCount: number;
  topicsCompleted: number;
}

export type TopicStatus =
  | 'not-started'
  | 'main-videos'
  | 'rr-videos'
  | 'btr-videos'
  | 'extra-videos'
  | 'mcqs-in-progress'
  | 'pyq-done'
  | 'revision'
  | 'mastered';

export interface Topic {
  id: string;
  name: string;
  subjectId: string;
  status: TopicStatus;
  completedStages: string[];
  confidence: number;
  targetQuestions: number;
  questionsSolved: number;
  pyqDone: boolean;
  nextRevisionDate: Date | null;
  revisionSession: number;
  lastStudied: Date | null;
}

export interface ContentType {
  id: string;
  label: string;
  shortLabel: string;
  compulsory: boolean;
  enabled: boolean;
}

export const DEFAULT_CONTENT_TYPES: ContentType[] = [
  { id: 'main-video', label: 'Main Video', shortLabel: 'Main', compulsory: false, enabled: true },
  { id: 'rr-video', label: 'RR Video', shortLabel: 'RR', compulsory: false, enabled: true },
  { id: 'btr-video', label: 'BTR Video', shortLabel: 'BTR', compulsory: false, enabled: true },
  { id: 'extra-video', label: 'Extra Video', shortLabel: 'Extra', compulsory: false, enabled: true },
  { id: 'mcqs', label: 'MCQs', shortLabel: 'MCQ', compulsory: true, enabled: true },
  { id: 'pyqs', label: 'PYQs', shortLabel: 'PYQ', compulsory: true, enabled: true },
];

export type TaskColumn = 'backlog' | 'week' | 'today' | 'done';

export interface Task {
  id: string;
  title: string;
  type: 'study' | 'revision' | 'mcq' | 'mock' | 'pyq' | 'test';
  subjectId?: string;
  topicId?: string;
  chapterId?: string;
  duration: number;
  completed: boolean;
  column: TaskColumn;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

export interface Chapter {
  id: string;
  name: string;
  subjectId: string;
  topics: Topic[];
}

export interface StudySession {
  id: string;
  date: Date;
  duration: number;
  type: 'study' | 'revision' | 'mcq' | 'mock';
  subjectId?: string;
  topicId?: string;
  chapterId?: string;
  questionsAttempted?: number;
  questionsCorrect?: number;
  notes?: string;
}

export interface MockTest {
  id: string;
  date: Date;
  testName: string;
  source: string;
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  score: number;
  percentile?: number;
  rank?: number;
  timeTaken: number;
  subjectScores: SubjectScore[];
  weakSubjects: string[];
  notes?: string;
}

export interface SubjectScore {
  subjectId: string;
  subjectName: string;
  total: number;
  correct: number;
  accuracy: number;
}

export interface UserStats {
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalStudyHours: number;
  todayStudyMinutes: number;
  averageAccuracy: number;
  topicsCompleted: number;
  subjectsCompleted: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date | null;
  progress: number;
  target: number;
}

export interface MockPrediction {
  predictedScore: number;
  predictedRank: number;
  rankRange: { min: number; max: number };
  confidence: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface MarkingScheme {
  correctMarks: number;
  incorrectMarks: number;
  unansweredMarks: number;
  totalMarks: number;
}

export const DEFAULT_MARKING_SCHEME: MarkingScheme = {
  correctMarks: 4,
  incorrectMarks: -1,
  unansweredMarks: 0,
  totalMarks: 800,
};

export interface StudyLog {
  date: string;
  minutesStudied: number;
  hour: number;
}

export interface PomodoroSettings {
  studyDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
}

export interface SpacedRepetitionSession {
  sessionNumber: number;
  name: string;
  daysAfterPrevious: number;
}

export interface ConfidenceSchedule {
  label: string;
  sessions: SpacedRepetitionSession[];
}

export interface SpacedRepetitionSettings {
  schedules: Record<number, SpacedRepetitionSession[]>;
}

export const DEFAULT_SR_SCHEDULES: Record<number, SpacedRepetitionSession[]> = {
  1: [
    { sessionNumber: 1, name: '1st Review', daysAfterPrevious: 1 },
    { sessionNumber: 2, name: '2nd Review', daysAfterPrevious: 2 },
    { sessionNumber: 3, name: '3rd Review', daysAfterPrevious: 4 },
    { sessionNumber: 4, name: '4th Review', daysAfterPrevious: 7 },
    { sessionNumber: 5, name: '5th Review', daysAfterPrevious: 14 },
    { sessionNumber: 6, name: '6th Review', daysAfterPrevious: 21 },
    { sessionNumber: 7, name: 'Final', daysAfterPrevious: 30 },
  ],
  2: [
    { sessionNumber: 1, name: '1st Review', daysAfterPrevious: 1 },
    { sessionNumber: 2, name: '2nd Review', daysAfterPrevious: 3 },
    { sessionNumber: 3, name: '3rd Review', daysAfterPrevious: 7 },
    { sessionNumber: 4, name: '4th Review', daysAfterPrevious: 14 },
    { sessionNumber: 5, name: '5th Review', daysAfterPrevious: 21 },
    { sessionNumber: 6, name: 'Final', daysAfterPrevious: 30 },
  ],
  3: [
    { sessionNumber: 1, name: '1st Review', daysAfterPrevious: 1 },
    { sessionNumber: 2, name: '2nd Review', daysAfterPrevious: 3 },
    { sessionNumber: 3, name: '3rd Review', daysAfterPrevious: 7 },
    { sessionNumber: 4, name: '4th Review', daysAfterPrevious: 14 },
    { sessionNumber: 5, name: '5th Review', daysAfterPrevious: 30 },
    { sessionNumber: 6, name: 'Final', daysAfterPrevious: 60 },
  ],
  4: [
    { sessionNumber: 1, name: '1st Review', daysAfterPrevious: 2 },
    { sessionNumber: 2, name: '2nd Review', daysAfterPrevious: 7 },
    { sessionNumber: 3, name: '3rd Review', daysAfterPrevious: 14 },
    { sessionNumber: 4, name: '4th Review', daysAfterPrevious: 30 },
    { sessionNumber: 5, name: 'Final', daysAfterPrevious: 60 },
  ],
  5: [
    { sessionNumber: 1, name: '1st Review', daysAfterPrevious: 3 },
    { sessionNumber: 2, name: '2nd Review', daysAfterPrevious: 14 },
    { sessionNumber: 3, name: '3rd Review', daysAfterPrevious: 30 },
    { sessionNumber: 4, name: 'Final', daysAfterPrevious: 60 },
  ],
};

export const SPACED_REPETITION_SCHEDULE: SpacedRepetitionSession[] = DEFAULT_SR_SCHEDULES[2];

export function getScheduleForConfidence(
  confidence: number,
  settings?: SpacedRepetitionSettings
): SpacedRepetitionSession[] {
  const schedules = settings?.schedules || DEFAULT_SR_SCHEDULES;
  const tier = Math.max(1, Math.min(5, confidence || 3));
  return schedules[tier] || schedules[3];
}

export interface RevisionReminder {
  topicId: string;
  topicName: string;
  subjectId: string;
  chapterId: string;
  dueDate: Date;
  sessionNumber: number;
  sessionName: string;
  isOverdue: boolean;
  isDueTomorrow?: boolean;
}
