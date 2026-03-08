# Content from https://raw.githubusercontent.com/kb941/neet-pg-ace/main/src/types/index.ts

```
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
  completedStages: string[]; // Independent stage tracking
  confidence: number;
  targetQuestions: number;
  questionsSolved: number;
  pyqDone: boolean;
  nextRevisionDate: Date | null;
  revisionSession: number;
  lastStudied: Date | null;
}

// Content type configuration
export interface ContentType {
  id: string;
  label: string;
  shortLabel: string;
  compulsory: boolean;
  enabled: boolean;
}

export const DEFAULT_CONTENT_TYPES: ContentType[] = [\
  { id: 'main-video', label: 'Main Video', shortLabel: 'Main', compulsory: false, enabled: true },\
  { id: 'rr-video', label: 'RR Video', shortLabel: 'RR', compulsory: false, enabled: true },\
  { id: 'btr-video', label: 'BTR Video', shortLabel: 'BTR', compulsory: false, enabled: true },\
  { id: 'extra-video', label: 'Extra Video', shortLabel: 'Extra', compulsory: false, enabled: true },\
  { id: 'mcqs', label: 'MCQs', shortLabel: 'MCQ', compulsory: true, enabled: true },\
  { id: 'pyqs', label: 'PYQs', shortLabel: 'PYQ', compulsory: true, enabled: true },\
];

export type TaskColumn = 'backlog' | 'week' | 'today' | 'done';

export interface Task {
  id: string;
  title: string;
  type: 'study' | 'revision' | 'mcq' | 'mock';
  subjectId?: string;
  topicId?: string;
  chapterId?: string;
  duration: number; // in minutes
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
  duration: number; // in minutes
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
  score: number; // normalized to 800
  percentile?: number;
  rank?: number;
  timeTaken: number; // in minutes
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

// Marking scheme for predicted marks calculation
export interface MarkingScheme {
  correctMarks: number;   // e.g., +4
  incorrectMarks: number; // e.g., -1 (stored as negative)
  unansweredMarks: number; // e.g., 0
}

export const DEFAULT_MARKING_SCHEME: MarkingScheme = {
  correctMarks: 4,
  incorrectMarks: -1,
  unansweredMarks: 0,
};

// Study session log for heatmap/productivity tracking
export interface StudyLog {
  date: string; // YYYY-MM-DD
  minutesStudied: number;
  hour: number; // 0-23 for time-of-day tracking
}

// Pomodoro settings
export interface PomodoroSettings {
  studyDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsBeforeLongBreak: number;
}

// Spaced repetition session definitions
export interface SpacedRepetitionSession {
  sessionNumber: number;
  name: string;
  daysAfterPrevious: number;
}

// Confidence-based spaced repetition schedules
export interface ConfidenceSchedule {
  label: string;
  sessions: SpacedRepetitionSession[];
}

export interface SpacedRepetitionSettings {
  schedules: Record<number, SpacedRepetitionSession[]>; // key: confidence level (1-5)
}

// Default schedules based on confidence (5 tiers, one per star)
export const DEFAULT_SR_SCHEDULES: Record<number, SpacedRepetitionSession[]> = {
  1: [ // 1 star - very frequent reviews\
    { sessionNumber: 1, name: '1st Review', daysAfterPrevious: 1 },\
    { sessionNumber: 2, name: '2nd Review', daysAfterPrevious: 2 },\
    { sessionNumber: 3, name: '3rd Review', daysAfterPrevious: 4 },\
    { sessionNumber: 4, name: '4th Review', daysAfterPrevious: 7 },\
    { sessionNumber: 5, name: '5th Review', daysAfterPrevious: 14 },\
    { sessionNumber: 6, name: '6th Review', daysAfterPrevious: 21 },\
    { sessionNumber: 7, name: 'Final', daysAfterPrevious: 30 },\
  ],
  2: [ // 2 stars - frequent reviews\
    { sessionNumber: 1, name: '1st Review', daysAfterPrevious: 1 },\
    { sessionNumber: 2, name: '2nd Review', daysAfterPrevious: 3 },\
    { sessionNumber: 3, name: '3rd Review', daysAfterPrevious: 7 },\
    { sessionNumber: 4, name: '4th Review', daysAfterPrevious: 14 },\
    { sessionNumber: 5, name: '5th Review', daysAfterPrevious: 21 },\
    { sessionNumber: 6, name: 'Final', daysAfterPrevious: 30 },\
  ],
  3: [ // 3 stars - standard schedule\
    { sessionNumber: 1, name: '1st Review', daysAfterPrevious: 1 },\
    { sessionNumber: 2, name: '2nd Review', daysAfterPrevious: 3 },\
    { sessionNumber: 3, name: '3rd Review', daysAfterPrevious: 7 },\
    { sessionNumber: 4, name: '4th Review', daysAfterPrevious: 14 },\
    { sessionNumber: 5, name: '5th Review', daysAfterPrevious: 30 },\
    { sessionNumber: 6, name: 'Final', daysAfterPrevious: 60 },\
  ],
  4: [ // 4 stars - relaxed schedule\
    { sessionNumber: 1, name: '1st Review', daysAfterPrevious: 2 },\
    { sessionNumber: 2, name: '2nd Review', daysAfterPrevious: 7 },\
    { sessionNumber: 3, name: '3rd Review', daysAfterPrevious: 14 },\
    { sessionNumber: 4, name: '4th Review', daysAfterPrevious: 30 },\
    { sessionNumber: 5, name: 'Final', daysAfterPrevious: 60 },\
  ],
  5: [ // 5 stars - minimal reviews\
    { sessionNumber: 1, name: '1st Review', daysAfterPrevious: 3 },\
    { sessionNumber: 2, name: '2nd Review', daysAfterPrevious: 14 },\
    { sessionNumber: 3, name: '3rd Review', daysAfterPrevious: 30 },\
    { sessionNumber: 4, name: 'Final', daysAfterPrevious: 60 },\
  ],
};

// Backward compat - use medium confidence as default
export const SPACED_REPETITION_SCHEDULE: SpacedRepetitionSession[] = DEFAULT_SR_SCHEDULES[2];

// Helper to get schedule for a topic based on confidence (1:1 mapping)
export function getScheduleForConfidence(
  confidence: number,
  settings?: SpacedRepetitionSettings
): SpacedRepetitionSession[] {
  const schedules = settings?.schedules || DEFAULT_SR_SCHEDULES;
  const tier = Math.max(1, Math.min(5, confidence || 3));
  return schedules[tier] || schedules[3];
}

// Revision reminder
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
```