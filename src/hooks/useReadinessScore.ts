import { useMemo, useEffect } from 'react';
import { Chapter, Subject, MockTest, UserStats, StudyLog, MarkingScheme, ContentType } from '@/types';
import { PYQEntry } from '@/components/PYQTracker';

interface ReadinessInput {
  chapters: Chapter[];
  subjects: Subject[];
  mockTests: MockTest[];
  stats: UserStats;
  studyLogs: StudyLog[];
  mcqLogs: { date: string; count: number }[];
  pyqData: PYQEntry[];
  examDate: Date;
  mcqGoalPerSubject: number;
  markingScheme: MarkingScheme;
  pyqYearFrom: number;
  pyqYearTo: number;
  contentTypes: ContentType[];
}

export interface SubjectReadiness {
  subjectId: string;
  subjectName: string;
  weightage: number;
  syllabusPct: number;       // % of topics with any stage done
  mainVideoPct: number;      // % with main-video
  revisionPct: number;       // % with RR1+
  mcqProgress: number;       // questionsSolved vs goal
  contribution: number;      // how much this subject contributes to total
  gap: number;               // how much score is lost from this subject
}

export interface ReadinessBreakdown {
  base: {
    syllabus: number;
    revision: number;
    mcq: number;
    pyq: number;
    mocks: number;
    total: number;
  };
  bonuses: {
    earlyBird: number;
    streak: number;
    accuracy: number;
    balanced: number;
    momentum: number;
    total: number;
    details: string[];
  };
  penalties: {
    procrastination: number;
    criticalWeak: number;
    mockDeficit: number;
    inactive: number;
    accuracyDrop: number;
    imbalanced: number;
    total: number;
    details: string[];
  };
  subjectBreakdown: SubjectReadiness[];
}

export interface ReadinessResult {
  score: number;
  breakdown: ReadinessBreakdown;
  color: string;
  label: string;
  message: string;
  recommendations: string[];
}

export interface ReadinessSnapshot {
  date: string;
  score: number;
}

function getColorAndLabel(score: number): { color: string; label: string } {
  if (score >= 80) return { color: 'hsl(152, 60%, 42%)', label: 'Exam Ready' };
  if (score >= 70) return { color: 'hsl(142, 60%, 45%)', label: 'Nearly Ready' };
  if (score >= 60) return { color: 'hsl(45, 93%, 47%)', label: 'On Track' };
  if (score >= 50) return { color: 'hsl(30, 90%, 50%)', label: 'Needs Focus' };
  if (score >= 40) return { color: 'hsl(0, 72%, 55%)', label: 'Behind Schedule' };
  if (score >= 20) return { color: 'hsl(0, 65%, 50%)', label: 'Getting Started' };
  return { color: 'hsl(220, 10%, 50%)', label: 'Just Beginning' };
}

function getMessage(score: number): string {
  if (score >= 85) return "Excellent! You're extremely well-prepared 🏆";
  if (score >= 75) return "Great progress! Fine-tune and you're ready 🎯";
  if (score >= 65) return "Good work! Focus on weak areas now 💪";
  if (score >= 55) return "Decent progress. Intensify your efforts ⚡";
  if (score >= 45) return "Need to accelerate. Review your strategy ⚠️";
  if (score >= 30) return "Early stages — keep building momentum 📚";
  if (score >= 10) return "You've started! Every topic completed counts 🌱";
  return "Begin by marking topics as done in Subjects tab 📖";
}

export function useReadinessScore(input: ReadinessInput): ReadinessResult {
  const {
    chapters, subjects, mockTests, stats, studyLogs, mcqLogs,
    pyqData, examDate, mcqGoalPerSubject, markingScheme, pyqYearFrom, pyqYearTo, contentTypes,
  } = input;

  const result = useMemo(() => {
    const allTopics = chapters.flatMap(ch => ch.topics);
    const totalTopics = allTopics.length;
    const totalWeightage = subjects.reduce((s, sub) => s + sub.weightage, 0) || 200;

    // Activity gates for penalties
    const hasAnyProgress = allTopics.some(t => t.completedStages.length > 0);
    const hasStudyLogs = studyLogs.length > 0;

    // Critical subjects used across all scoring
    const CRITICAL_SUBJECT_IDS = ['medicine', 'pharmacology', 'microbiology', 'pathology', 'surgery', 'obgyn', 'psm'];

    // ===== 1. SYLLABUS COVERAGE (35%) =====
    // Only main-video, rr-video, btr-video count for syllabus score.
    // Weights by identity, based on which are enabled:
    // main only → 100%; rr only → 100%; btr only → 100%
    // main+rr → 70/30; rr+btr → 70/30; main+btr → 70/30
    // main+rr+btr → 50/30/20
    const SCORABLE_STAGES = ['main-video', 'rr-video', 'btr-video'] as const;
    const enabledStages = contentTypes
      .filter(ct => SCORABLE_STAGES.includes(ct.id as any) && ct.enabled)
      .map(ct => ct.id);

    // Build weights map based on which specific types are enabled
    const stageWeights: Record<string, number> = {};
    const hasMain = enabledStages.includes('main-video');
    const hasRR = enabledStages.includes('rr-video');
    const hasBTR = enabledStages.includes('btr-video');
    const enabledCount = enabledStages.length;

    if (enabledCount === 1) {
      stageWeights[enabledStages[0]] = 1.0;
    } else if (enabledCount === 2) {
      // First enabled gets 70%, second gets 30%
      stageWeights[enabledStages[0]] = 0.7;
      stageWeights[enabledStages[1]] = 0.3;
    } else if (enabledCount >= 3) {
      // main=50%, rr=30%, btr=20%
      if (hasMain) stageWeights['main-video'] = 0.5;
      if (hasRR) stageWeights['rr-video'] = 0.3;
      if (hasBTR) stageWeights['btr-video'] = 0.2;
    }

    let weightedSyllabusCoverage = 0;
    const subjectBreakdown: SubjectReadiness[] = [];

    subjects.forEach(sub => {
      const subTopics = allTopics.filter(t => t.subjectId === sub.id);
      if (subTopics.length === 0) {
        subjectBreakdown.push({
          subjectId: sub.id, subjectName: sub.name, weightage: sub.weightage,
          syllabusPct: 0, mainVideoPct: 0, revisionPct: 0, mcqProgress: 0,
          contribution: 0, gap: sub.weightage / totalWeightage * 35,
        });
        return;
      }

      const withMain = subTopics.filter(t => t.completedStages.includes('main-video')).length;
      const withAny = subTopics.filter(t => t.completedStages.length > 0).length;
      const withRR1 = subTopics.filter(t => t.revisionSession >= 1).length;
      const mcqsDone = subTopics.reduce((s, t) => s + t.questionsSolved, 0);
      const mcqGoal = mcqGoalPerSubject * subTopics.length;

      // Calculate weighted coverage using only scorable stages
      let subCoverage = 0;
      if (enabledStages.length === 0) {
        // Fallback: any completed stage
        subCoverage = withAny / subTopics.length;
      } else {
        for (const stageId of enabledStages) {
          const completed = subTopics.filter(t => t.completedStages.includes(stageId)).length;
          subCoverage += (completed / subTopics.length) * (stageWeights[stageId] || 0);
        }
      }

      const weight = sub.weightage / totalWeightage;
      weightedSyllabusCoverage += subCoverage * weight;

      const subContribution = subCoverage * weight * 35;
      const maxContribution = weight * 35;

      subjectBreakdown.push({
        subjectId: sub.id,
        subjectName: sub.name,
        weightage: sub.weightage,
        syllabusPct: Math.round((withAny / subTopics.length) * 100),
        mainVideoPct: Math.round((withMain / subTopics.length) * 100),
        revisionPct: subTopics.length > 0 ? Math.round((withRR1 / subTopics.length) * 100) : 0,
        mcqProgress: mcqGoal > 0 ? Math.round((mcqsDone / mcqGoal) * 100) : 0,
        contribution: Math.round(subContribution * 10) / 10,
        gap: Math.round((maxContribution - subContribution) * 10) / 10,
      });
    });

    const syllabusScore = weightedSyllabusCoverage * 35;

    // ===== 2. REVISION QUALITY (20%) — weightage-based per subject =====
    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const criticalSubjectIds = ['medicine', 'surgery', 'obg', 'pediatrics'];

    let weightedRevision = 0;
    let hasRevisionData = false;

    subjects.forEach(sub => {
      const subTopics = allTopics.filter(t => t.subjectId === sub.id);
      const subWithMain = subTopics.filter(t => t.completedStages.includes('main-video'));
      if (subWithMain.length === 0) return;

      const weight = sub.weightage / totalWeightage;
      const subMainCount = subWithMain.length;

      const rr1 = subWithMain.filter(t => t.revisionSession >= 1).length;
      const rr2 = subWithMain.filter(t => t.revisionSession >= 2).length;
      const rr3 = subWithMain.filter(t => t.revisionSession >= 3).length;

      if (rr1 > 0) hasRevisionData = true;

      const subRevision = (
        (rr1 / subMainCount) * 0.4 +
        (rr2 / subMainCount) * 0.35 +
        (rr3 / subMainCount) * 0.25
      );

      // Overdue penalty for this subject
      let subOverduePenalty = 0;
      const overdueTopics = subWithMain.filter(t =>
        t.lastStudied && new Date(t.lastStudied) < fourteenDaysAgo
      ).length;
      subOverduePenalty = (overdueTopics / subMainCount) * 0.15;

      // Extra penalty for critical subjects
      if (criticalSubjectIds.includes(sub.id)) {
        const critOverdue = overdueTopics;
        subOverduePenalty += (critOverdue / subMainCount) * 0.1;
      }

      weightedRevision += Math.max(0, subRevision - subOverduePenalty) * weight;
    });

    const revisionScore = weightedRevision * 20;

    // ===== 3. MCQ PRACTICE (20%) — weightage-based per subject =====
    let weightedMcqVolume = 0;
    let weightedAccuracy = 0;
    let hasAccuracyData = false;
    let hasMcqData = false;

    subjects.forEach(sub => {
      const subTopics = allTopics.filter(t => t.subjectId === sub.id);
      const mcqsDone = subTopics.reduce((s, t) => s + t.questionsSolved, 0);
      const mcqGoalForSub = mcqGoalPerSubject * subTopics.length;
      const weight = sub.weightage / totalWeightage;

      if (mcqsDone > 0) hasMcqData = true;
      weightedMcqVolume += Math.min(mcqsDone / (mcqGoalForSub || 1), 1) * weight;

      // Accuracy from mock test subject scores
      const subScores = mockTests.flatMap(m => m.subjectScores).filter(s => s.subjectId === sub.id);
      if (subScores.length > 0) {
        hasAccuracyData = true;
        const avgAcc = subScores.reduce((s, sc) => s + sc.accuracy, 0) / subScores.length;
        weightedAccuracy += (avgAcc / 100) * weight;
      }
    });
    if (!hasAccuracyData) weightedAccuracy = (stats.averageAccuracy || 0) / 100;

    const volumeProgress = weightedMcqVolume * 50;
    const accuracyTarget = 0.75;
    const accuracyScore = Math.min((weightedAccuracy / accuracyTarget) * 50, 50);
    const mcqScore = !hasMcqData ? 0 : (volumeProgress + accuracyScore) * 20 / 100;

    // ===== 4. PYQ COMPLETION (15%) =====
    // Priority: year/paper-based → 100% if available; chapter-based → 100% if no paper data
    // If both exist, use year-based only.

    // Dimension A: Chapter-wise PYQs (topic.pyqDone) — weightage-based
    let weightedChapterPyq = 0;
    let hasChapterPyqData = false;
    subjects.forEach(sub => {
      const subTopics = allTopics.filter(t => t.subjectId === sub.id);
      if (subTopics.length === 0) return;
      const pyqDoneCount = subTopics.filter(t => t.pyqDone).length;
      if (pyqDoneCount > 0) hasChapterPyqData = true;
      const weight = sub.weightage / totalWeightage;
      weightedChapterPyq += (pyqDoneCount / subTopics.length) * weight;
    });

    // Dimension B: Year/paper-based PYQs (from PYQ Tracker) — weightage-based
    let weightedPaperPyq = 0;
    let weightedPyqAccuracy = 0;
    let hasPaperPyqData = false;
    const pyqSubjectEntries = pyqData.filter(e => e.subjectId !== 'all');
    const pyqsDone = pyqSubjectEntries.filter(e => e.done).length;

    subjects.forEach(sub => {
      const subEntries = pyqSubjectEntries.filter(e => e.subjectId === sub.id);
      if (subEntries.length === 0) return;
      const done = subEntries.filter(e => e.done).length;
      if (done > 0) hasPaperPyqData = true;
      const weight = sub.weightage / totalWeightage;
      weightedPaperPyq += (done / subEntries.length) * weight;

      const withMarks = subEntries.filter(e => e.done && e.totalQuestions && e.totalQuestions > 0);
      if (withMarks.length > 0) {
        const avgAcc = withMarks.reduce((s, e) => s + ((e.correctAnswers || 0) / (e.totalQuestions || 1)), 0) / withMarks.length;
        weightedPyqAccuracy += avgAcc * weight;
      }
    });

    let pyqScore = 0;
    if (hasPaperPyqData) {
      // Year-based: 70% volume + 30% accuracy
      const volumeComponent = weightedPaperPyq * 70;
      const accComponent = Math.min((weightedPyqAccuracy / 0.8) * 30, 30);
      pyqScore = (volumeComponent + accComponent) * 15 / 100;
    } else if (hasChapterPyqData) {
      // Chapter-based only: 100% volume
      pyqScore = weightedChapterPyq * 15;
    }

    // ===== 5. MOCK TEST PERFORMANCE (10%) =====
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const recentMocks = mockTests
      .filter(m => new Date(m.date) > sixtyDaysAgo)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, Math.max(3, mockTests.filter(m => new Date(m.date) > sixtyDaysAgo).length));

    let mockScore = 0;
    if (recentMocks.length > 0) {
      const totalMarks = markingScheme.totalMarks || 800;
      const avgScore = recentMocks.reduce((s, m) => s + m.score, 0) / recentMocks.length;
      const avgPct = (avgScore / totalMarks) * 100;
      const scoreComponent = (avgPct / 100) * 70;

      let trendComponent = 20;
      if (recentMocks.length >= 3) {
        const scores = recentMocks.map(m => m.score).reverse();
        const n = scores.length;
        const xMean = (n - 1) / 2;
        const yMean = scores.reduce((a, b) => a + b, 0) / n;
        let num = 0, den = 0;
        scores.forEach((y, i) => { num += (i - xMean) * (y - yMean); den += (i - xMean) ** 2; });
        const trend = den !== 0 ? num / den : 0;
        if (trend > 15) trendComponent = 30;
        else if (trend > 5) trendComponent = 25;
        else if (trend > -5) trendComponent = 20;
        else if (trend > -15) trendComponent = 15;
        else trendComponent = 10;
      }

      let consistencyBonus = 0;
      if (recentMocks.length >= 3) {
        const scores = recentMocks.map(m => m.score);
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = scores.reduce((s, v) => s + (v - mean) ** 2, 0) / scores.length;
        const sd = Math.sqrt(variance);
        if (sd < 30) consistencyBonus = 3;
        else if (sd < 50) consistencyBonus = 2;
      }

      mockScore = (scoreComponent + trendComponent + consistencyBonus) * 10 / 100;
    }

    const baseScore = syllabusScore + revisionScore + mcqScore + pyqScore + mockScore;

    // ===== BONUSES =====
    const bonusDetails: string[] = [];
    const daysUntilExam = Math.ceil((new Date(examDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let earlyBirdBonus = 0;
    if (daysUntilExam > 240 && baseScore > 40) {
      earlyBirdBonus = 5;
      bonusDetails.push('Early Bird: Excellent head start! 🌱');
    }

    let streakBonus = 0;
    if (stats.currentStreak >= 60) { streakBonus = 3; bonusDetails.push(`Streak Master: ${stats.currentStreak}-day streak! 🔥`); }
    else if (stats.currentStreak >= 30) { streakBonus = 2; bonusDetails.push(`Streak: ${stats.currentStreak}-day streak ⚡`); }
    else if (stats.currentStreak >= 14) { streakBonus = 1; bonusDetails.push(`Streak: ${stats.currentStreak}-day streak 💪`); }

    let accuracyBonus = 0;
    const overallAccPct = weightedAccuracy * 100;
    if (overallAccPct >= 85) { accuracyBonus = 3; bonusDetails.push('Accuracy Elite: 85%+ accuracy 🎯'); }
    else if (overallAccPct >= 80) { accuracyBonus = 2; bonusDetails.push('Strong Accuracy: 80%+ 📈'); }

    let balancedBonus = 0;
    const criticalSubNames = ['medicine', 'surgery', 'obg', 'pediatrics', 'pathology', 'pharmacology', 'anatomy', 'physiology'];
    const weakCritical = subjects.filter(s => {
      if (!criticalSubNames.includes(s.id)) return false;
      const subTopics = allTopics.filter(t => t.subjectId === s.id);
      const done = subTopics.filter(t => t.completedStages.length > 0).length;
      return subTopics.length > 0 && (done / subTopics.length) < 0.4;
    });
    if (weakCritical.length === 0 && hasAnyProgress && totalTopics > 0) {
      balancedBonus = 2;
      bonusDetails.push('Balanced: All critical subjects strong 💎');
    }

    let momentumBonus = 0;
    const last7Days = studyLogs.filter(l => {
      const d = new Date(l.date);
      return d > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    });
    const avgLast7 = last7Days.reduce((s, l) => s + l.minutesStudied, 0) / 7;
    const dailyGoalMin = 480;
    if (avgLast7 > dailyGoalMin * 1.3) { momentumBonus = 2; bonusDetails.push('On fire this week! 🚀'); }
    else if (avgLast7 > dailyGoalMin * 1.1) { momentumBonus = 1; bonusDetails.push('Great momentum! 📊'); }

    const totalBonuses = earlyBirdBonus + streakBonus + accuracyBonus + balancedBonus + momentumBonus;

    // ===== PENALTIES (gated behind meaningful activity) =====
    const penaltyDetails: string[] = [];

    let procrastination = 0;
    if (hasAnyProgress) {
      if (daysUntilExam < 90 && baseScore < 60) { procrastination = -8; penaltyDetails.push(`Exam in ${daysUntilExam} days! Intensify prep`); }
      else if (daysUntilExam < 60 && baseScore < 70) { procrastination = -5; penaltyDetails.push(`${daysUntilExam} days left! Focus urgently`); }
      else if (daysUntilExam < 30 && baseScore < 80) { procrastination = -3; penaltyDetails.push('Final month! Maximum intensity'); }
    }

    let criticalWeakPenalty = 0;
    const critWeakSubs: Subject[] = [];
    if (hasAnyProgress && weightedSyllabusCoverage > 0.05) {
      const weak = subjects.filter(s => criticalSubjectIds.includes(s.id)).filter(sub => {
        const subTopics = allTopics.filter(t => t.subjectId === sub.id);
        const done = subTopics.filter(t => t.completedStages.includes('main-video')).length;
        return subTopics.length > 0 && (done / subTopics.length) < 0.5;
      });
      critWeakSubs.push(...weak);
      if (critWeakSubs.length > 0) {
        criticalWeakPenalty = Math.max(-7, critWeakSubs.reduce((s, sub) => {
          const subTopics = allTopics.filter(t => t.subjectId === sub.id);
          const done = subTopics.filter(t => t.completedStages.includes('main-video')).length;
          const gap = (0.5 - done / subTopics.length) * (sub.weightage / totalWeightage);
          return s + gap * -0.5 * 100;
        }, 0));
        penaltyDetails.push(`${critWeakSubs.length} critical subject(s) need attention`);
      }
    }

    let mockDeficit = 0;
    if (hasAnyProgress && daysUntilExam < 120) {
      if (daysUntilExam < 90 && mockTests.length < 5) {
        mockDeficit = -5;
        penaltyDetails.push(`Only ${mockTests.length} mocks taken`);
      } else if (daysUntilExam < 120 && mockTests.length < 3) {
        mockDeficit = -3;
        penaltyDetails.push('Take more mock tests');
      }
    }

    let inactive = 0;
    if (hasStudyLogs) {
      const lastLog = new Date(studyLogs[studyLogs.length - 1].date);
      const daysSinceStudy = Math.ceil((now.getTime() - lastLog.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceStudy > 3) { inactive = -4; penaltyDetails.push(`${daysSinceStudy} days since last study`); }
      else if (daysSinceStudy > 1) { inactive = -2; penaltyDetails.push('Missing study days'); }
    }

    let accuracyDrop = 0;
    if (recentMocks.length >= 2) {
      const latestAcc = recentMocks[0].correctAnswers / (recentMocks[0].attemptedQuestions || 1) * 100;
      const olderAcc = recentMocks[recentMocks.length - 1].correctAnswers / (recentMocks[recentMocks.length - 1].attemptedQuestions || 1) * 100;
      if (latestAcc < olderAcc - 10) { accuracyDrop = -3; penaltyDetails.push('Recent accuracy dropped significantly'); }
      else if (latestAcc < olderAcc - 5) { accuracyDrop = -1; penaltyDetails.push('Recent accuracy slipping'); }
    }

    let imbalanced = 0;
    if (hasAnyProgress && weightedSyllabusCoverage > 0.1) {
      const neglected = subjects.filter(sub => {
        if (sub.weightage < 20) return false;
        const subTopics = allTopics.filter(t => t.subjectId === sub.id);
        const started = subTopics.filter(t => t.completedStages.length > 0).length;
        return subTopics.length > 0 && (started / subTopics.length) < 0.1;
      });
      if (neglected.length > 0) {
        imbalanced = Math.max(-3, neglected.length * -1);
        penaltyDetails.push(`${neglected.length} high-weightage subject(s) neglected`);
      }
    }

    const totalPenalties = procrastination + criticalWeakPenalty + mockDeficit + inactive + accuracyDrop + imbalanced;

    const finalScore = Math.max(0, Math.min(100, baseScore + totalBonuses + totalPenalties));
    const { color, label } = getColorAndLabel(finalScore);

    // Sort subject breakdown by gap (biggest gaps first)
    subjectBreakdown.sort((a, b) => b.gap - a.gap);

    // Recommendations
    const recommendations: string[] = [];
    if (!hasAnyProgress) {
      recommendations.push('Start by going to Subjects tab and marking completed stages');
    }
    if (syllabusScore < 20 && hasAnyProgress) recommendations.push('Focus on completing Main videos for all subjects');
    if (revisionScore < 8 && hasAnyProgress) recommendations.push('Complete more revision cycles across subjects');
    if (mcqScore < 10 && hasAnyProgress) recommendations.push('Increase MCQ practice volume');
    if (critWeakSubs.length > 0) recommendations.push(`Prioritize: ${critWeakSubs.map(s => s.name).join(', ')}`);
    if (mockTests.length < 3 && hasAnyProgress) recommendations.push('Take your next mock test this week');
    if (pyqsDone < pyqSubjectEntries.length * 0.5 && hasAnyProgress) recommendations.push('Complete more PYQ sessions');
    if (subjectBreakdown.length > 0 && subjectBreakdown[0].gap > 2) {
      recommendations.push(`Biggest gap: ${subjectBreakdown[0].subjectName} (${subjectBreakdown[0].syllabusPct}% done)`);
    }
    if (recommendations.length === 0) recommendations.push('Keep up the great work! Stay consistent.');

    return {
      score: Math.round(finalScore * 10) / 10,
      breakdown: {
        base: {
          syllabus: Math.round(syllabusScore * 10) / 10,
          revision: Math.round(revisionScore * 10) / 10,
          mcq: Math.round(mcqScore * 10) / 10,
          pyq: Math.round(pyqScore * 10) / 10,
          mocks: Math.round(mockScore * 10) / 10,
          total: Math.round(baseScore * 10) / 10,
        },
        bonuses: {
          earlyBird: earlyBirdBonus,
          streak: streakBonus,
          accuracy: accuracyBonus,
          balanced: balancedBonus,
          momentum: momentumBonus,
          total: totalBonuses,
          details: bonusDetails,
        },
        penalties: {
          procrastination,
          criticalWeak: criticalWeakPenalty,
          mockDeficit,
          inactive,
          accuracyDrop,
          imbalanced,
          total: totalPenalties,
          details: penaltyDetails,
        },
        subjectBreakdown,
      },
      color,
      label,
      message: getMessage(finalScore),
      recommendations: recommendations.slice(0, 4),
    };
  }, [chapters, subjects, mockTests, stats, studyLogs, mcqLogs, pyqData, examDate, mcqGoalPerSubject, markingScheme, pyqYearFrom, pyqYearTo, contentTypes]);

  // Persist daily score snapshot for trend tracking
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const stored: ReadinessSnapshot[] = JSON.parse(localStorage.getItem('neetpg-readiness-trend') || '[]');
    const lastEntry = stored[stored.length - 1];

    // Update today's entry or add new one
    if (lastEntry && lastEntry.date === today) {
      lastEntry.score = result.score;
      localStorage.setItem('neetpg-readiness-trend', JSON.stringify(stored));
    } else {
      stored.push({ date: today, score: result.score });
      // Keep last 90 days
      const trimmed = stored.slice(-90);
      localStorage.setItem('neetpg-readiness-trend', JSON.stringify(trimmed));
    }
  }, [result.score]);

  return result;
}

export function getReadinessTrend(): ReadinessSnapshot[] {
  try {
    return JSON.parse(localStorage.getItem('neetpg-readiness-trend') || '[]');
  } catch {
    return [];
  }
}
