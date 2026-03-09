import { Subject, MockTest } from '@/types';

export const initialSubjects: Subject[] = [
  // Pre-clinical
  { id: 'anatomy', name: 'Anatomy', category: 'Pre-clinical', weightage: 23, progress: 0, accuracy: 0, lastRevised: null, topicsCount: 163, topicsCompleted: 0 },
  { id: 'physiology', name: 'Physiology', category: 'Pre-clinical', weightage: 22, progress: 0, accuracy: 0, lastRevised: null, topicsCount: 43, topicsCompleted: 0 },
  { id: 'biochemistry', name: 'Biochemistry', category: 'Pre-clinical', weightage: 20, progress: 0, accuracy: 0, lastRevised: null, topicsCount: 132, topicsCompleted: 0 },
  
  // Para-clinical
  { id: 'pathology', name: 'Pathology', category: 'Para-clinical', weightage: 25, progress: 0, accuracy: 0, lastRevised: null, topicsCount: 110, topicsCompleted: 0 },
  { id: 'pharmacology', name: 'Pharmacology', category: 'Para-clinical', weightage: 23, progress: 0, accuracy: 0, lastRevised: null, topicsCount: 92, topicsCompleted: 0 },
  { id: 'microbiology', name: 'Microbiology', category: 'Para-clinical', weightage: 20, progress: 0, accuracy: 0, lastRevised: null, topicsCount: 39, topicsCompleted: 0 },
  { id: 'forensic', name: 'Forensic Medicine', category: 'Para-clinical', weightage: 12, progress: 0, accuracy: 0, lastRevised: null, topicsCount: 48, topicsCompleted: 0 },
  
  // Clinical
  { id: 'medicine', name: 'Medicine', category: 'Clinical', weightage: 45, progress: 0, accuracy: 0, lastRevised: null, topicsCount: 148, topicsCompleted: 0 },
  { id: 'surgery', name: 'Surgery', category: 'Clinical', weightage: 30, progress: 0, accuracy: 0, lastRevised: null, topicsCount: 66, topicsCompleted: 0 },
  { id: 'obg', name: 'OBG', category: 'Clinical', weightage: 25, progress: 0, accuracy: 0, lastRevised: null, topicsCount: 55, topicsCompleted: 0 },
  { id: 'pediatrics', name: 'Pediatrics', category: 'Clinical', weightage: 22, progress: 0, accuracy: 0, lastRevised: null, topicsCount: 62, topicsCompleted: 0 },
  // Short Subjects
  { id: 'psychiatry', name: 'Psychiatry', category: 'Short Subjects', weightage: 12, progress: 0, accuracy: 0, lastRevised: null, topicsCount: 13, topicsCompleted: 0 },
  { id: 'dermatology', name: 'Dermatology', category: 'Short Subjects', weightage: 12, progress: 0, accuracy: 0, lastRevised: null, topicsCount: 22, topicsCompleted: 0 },
  { id: 'radiology', name: 'Radiology', category: 'Short Subjects', weightage: 10, progress: 0, accuracy: 0, lastRevised: null, topicsCount: 25, topicsCompleted: 0 },
  { id: 'anesthesia', name: 'Anesthesia', category: 'Short Subjects', weightage: 8, progress: 0, accuracy: 0, lastRevised: null, topicsCount: 20, topicsCompleted: 0 },
  { id: 'orthopedics', name: 'Orthopedics', category: 'Short Subjects', weightage: 15, progress: 0, accuracy: 0, lastRevised: null, topicsCount: 24, topicsCompleted: 0 },
  { id: 'ophthalmology', name: 'Ophthalmology', category: 'Clinical', weightage: 15, progress: 0, accuracy: 0, lastRevised: null, topicsCount: 30, topicsCompleted: 0 },
  { id: 'ent', name: 'ENT', category: 'Clinical', weightage: 15, progress: 0, accuracy: 0, lastRevised: null, topicsCount: 47, topicsCompleted: 0 },
  
  { id: 'psm', name: 'PSM', category: 'Clinical', weightage: 25, progress: 0, accuracy: 0, lastRevised: null, topicsCount: 93, topicsCompleted: 0 },
];

export const mockTasks = [
  { id: '1', title: 'Complete Cardiac Cycle Video', type: 'study' as const, subjectId: 'physiology', duration: 45, completed: false, column: 'today' as const, priority: 'high' as const },
  { id: '2', title: 'Revise CNS Pathology', type: 'revision' as const, subjectId: 'pathology', duration: 30, completed: false, column: 'today' as const, priority: 'high' as const },
  { id: '3', title: 'Pharmacology MCQs (50 Qs)', type: 'mcq' as const, subjectId: 'pharmacology', duration: 60, completed: false, column: 'today' as const, priority: 'medium' as const },
  { id: '4', title: 'Antibiotics Classification', type: 'study' as const, subjectId: 'pharmacology', duration: 40, completed: false, column: 'week' as const, priority: 'medium' as const },
  { id: '5', title: 'Anatomy PYQs 2022', type: 'mcq' as const, subjectId: 'anatomy', duration: 90, completed: false, column: 'week' as const, priority: 'high' as const },
  { id: '6', title: 'Mini Mock Test', type: 'mock' as const, duration: 120, completed: false, column: 'backlog' as const, priority: 'high' as const },
  { id: '7', title: 'Biochemistry Metabolism', type: 'study' as const, subjectId: 'biochemistry', duration: 50, completed: false, column: 'backlog' as const, priority: 'medium' as const },
  { id: '8', title: 'Microbiology Revision', type: 'revision' as const, subjectId: 'microbiology', duration: 35, completed: false, column: 'backlog' as const, priority: 'low' as const },
];

export const mockStats = {
  totalXP: 2450,
  level: 8,
  currentStreak: 12,
  longestStreak: 23,
  totalStudyHours: 156,
  todayStudyMinutes: 245,
  averageAccuracy: 72,
  topicsCompleted: 48,
  subjectsCompleted: 2,
};

export const achievements = [
  // Study Streak Badges
  { id: 'streak-7', name: '7-Day Streak', description: '7-day study streak', icon: '🔥', unlockedAt: null, progress: 0, target: 7 },
  { id: 'streak-30', name: '30-Day Streak', description: '30-day study streak', icon: '🔥🔥', unlockedAt: null, progress: 0, target: 30 },
  { id: 'streak-60', name: '60-Day Streak', description: '60-day study streak', icon: '🔥🔥🔥', unlockedAt: null, progress: 0, target: 60 },
  { id: 'streak-100', name: '100-Day Streak', description: '100-day study streak', icon: '🔥🔥🔥🔥', unlockedAt: null, progress: 0, target: 100 },

  // Syllabus Completion
  { id: 'syllabus-bronze', name: 'Bronze Scholar', description: 'First subject 100% complete', icon: '🥉', unlockedAt: null, progress: 0, target: 1 },
  { id: 'syllabus-silver', name: 'Silver Scholar', description: '10 subjects 100% complete', icon: '🥈', unlockedAt: null, progress: 0, target: 10 },
  { id: 'syllabus-gold', name: 'Gold Scholar', description: 'All subjects 100% complete', icon: '🥇', unlockedAt: null, progress: 0, target: 19 },

  // Revision Achievements
  { id: 'revision-first', name: 'First Revision', description: 'Complete your first revision', icon: '🔄', unlockedAt: null, progress: 0, target: 1 },
  { id: 'revision-10', name: 'Revision Starter', description: 'Complete 10 revisions', icon: '📖', unlockedAt: null, progress: 0, target: 10 },
  { id: 'revision-50', name: 'Revision Pro', description: 'Complete 50 revisions', icon: '📚', unlockedAt: null, progress: 0, target: 50 },
  { id: 'revision-100', name: 'Revision Master', description: 'Complete 100 revisions', icon: '🔁', unlockedAt: null, progress: 0, target: 100 },
  { id: 'revision-streak-7', name: 'Revision Streak', description: '7-day revision streak', icon: '⚡', unlockedAt: null, progress: 0, target: 7 },
  { id: 'revision-streak-30', name: 'Revision Champion', description: '30-day revision streak', icon: '🏅', unlockedAt: null, progress: 0, target: 30 },
  { id: 'revision-cycle-3', name: 'Cycle Master', description: '3 revision cycles for 50 topics', icon: '🎯', unlockedAt: null, progress: 0, target: 50 },

  // Question Solver
  { id: 'qs-1k', name: '1K Solver', description: '1,000 questions solved', icon: '✏️', unlockedAt: null, progress: 0, target: 1000 },
  { id: 'qs-5k', name: '5K Solver', description: '5,000 questions solved', icon: '🖊️', unlockedAt: null, progress: 0, target: 5000 },
  { id: 'qs-10k', name: '10K Solver', description: '10,000 questions solved', icon: '🏆', unlockedAt: null, progress: 0, target: 10000 },

  // Mock Warrior
  { id: 'mock-10', name: 'Mock Rookie', description: '10 mocks completed', icon: '📝', unlockedAt: null, progress: 0, target: 10 },
  { id: 'mock-25', name: 'Mock Warrior', description: '25 mocks completed', icon: '⚔️', unlockedAt: null, progress: 0, target: 25 },
  { id: 'mock-50', name: 'Mock Legend', description: '50 mocks completed', icon: '🛡️', unlockedAt: null, progress: 0, target: 50 },

  // Accuracy Ace
  { id: 'accuracy-streak', name: 'Accuracy Streak', description: '>75% accuracy for 5 consecutive mocks', icon: '🎯', unlockedAt: null, progress: 0, target: 5 },
  { id: 'accuracy-subject', name: 'Subject Ace', description: '>85% in any subject (min 200 Qs)', icon: '💎', unlockedAt: null, progress: 0, target: 1 },

  // Consistency King
  { id: 'consistency-month', name: 'Consistency King', description: 'Study 6/7 days per week for a month', icon: '👑', unlockedAt: null, progress: 0, target: 4 },
  { id: 'consistency-40h', name: 'Marathon Week', description: 'Log 40+ hours in a single week', icon: '⏱️', unlockedAt: null, progress: 0, target: 40 },

  // Comeback Champion
  { id: 'comeback', name: 'Comeback Champion', description: 'Improve a subject accuracy by >20%', icon: '🚀', unlockedAt: null, progress: 0, target: 1 },
];

export const sampleMockTests: MockTest[] = [
  {
    id: '1',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    testName: 'Grand Test 1',
    source: 'Marrow',
    totalQuestions: 200,
    attemptedQuestions: 185,
    correctAnswers: 125,
    score: 500,
    percentile: 65,
    rank: 12500,
    timeTaken: 180,
    subjectScores: [
      { subjectId: 'anatomy', subjectName: 'Anatomy', total: 20, correct: 14, accuracy: 70 },
      { subjectId: 'physiology', subjectName: 'Physiology', total: 18, correct: 12, accuracy: 67 },
      { subjectId: 'medicine', subjectName: 'Medicine', total: 35, correct: 25, accuracy: 71 },
    ],
    weakSubjects: ['biochemistry', 'pharmacology'],
  },
  {
    id: '2',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    testName: 'Grand Test 2',
    source: 'Marrow',
    totalQuestions: 200,
    attemptedQuestions: 190,
    correctAnswers: 135,
    score: 540,
    percentile: 70,
    rank: 10000,
    timeTaken: 175,
    subjectScores: [
      { subjectId: 'anatomy', subjectName: 'Anatomy', total: 20, correct: 15, accuracy: 75 },
      { subjectId: 'physiology', subjectName: 'Physiology', total: 18, correct: 14, accuracy: 78 },
      { subjectId: 'medicine', subjectName: 'Medicine', total: 35, correct: 28, accuracy: 80 },
    ],
    weakSubjects: ['biochemistry'],
  },
  {
    id: '3',
    date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    testName: 'Subject Test - Medicine',
    source: 'Prepladder',
    totalQuestions: 100,
    attemptedQuestions: 95,
    correctAnswers: 72,
    score: 576,
    percentile: 75,
    rank: 8000,
    timeTaken: 90,
    subjectScores: [
      { subjectId: 'medicine', subjectName: 'Medicine', total: 100, correct: 72, accuracy: 72 },
    ],
    weakSubjects: [],
  },
];
