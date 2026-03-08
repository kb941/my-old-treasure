import { useMemo } from 'react';
import { Chapter, Subject, MockTest, UserStats, StudyLog, MarkingScheme, SpacedRepetitionSettings } from '@/types';
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
}

export interface ReadinessResult {
  score: number;
  breakdown: ReadinessBreakdown;
  color: string;
  label: string;
  message: string;
  recommendations: string[];
}

function getColorAndLabel(score: number): { color: string; label: string } {
  if (score >= 80) return { color: 'hsl(152, 60%, 42%)', label: 'Exam Ready' };
  if (score >= 70) return { color: 'hsl(142, 60%, 45%)', label: 'Nearly Ready' };
  if (score >= 60) return { color: 'hsl(45, 93%, 47%)', label: 'On Track' };
  if (score >= 50) return { color: 'hsl(30, 90%, 50%)', label: 'Needs Focus' };
  if (score >= 40) return { color: 'hsl(0, 72%, 55%)', label: 'Behind Schedule' };
  return { color: 'hsl(0, 80%, 50%)', label: 'Urgent Action Needed' };
}

function getMessage(score: number): string {
  if (score >= 85) return "Excellent! You're extremely well-prepared 🏆";
  if (score >= 75) return "Great progress! Fine-tune and you're ready 🎯";
  if (score >= 65) return "Good work! Focus on weak areas now 💪";
  if (score >= 55) return "Decent progress. Intensify your efforts ⚡";
  if (score >= 45) return "Need to accelerate. Review your strategy ⚠️";
  return "Urgent action needed. Seek guidance 🚨";
}

export function useReadinessScore(input: ReadinessInput): ReadinessResult {
  return useMemo(() => {
    const { chapters, subjects, mockTests, stats, studyLogs, mcqLogs, pyqData, examDate, mcqGoalPerSubject, markingScheme, pyqYearFrom, pyqYearTo } = input;

    const allTopics = chapters.flatMap(ch => ch.topics);
    const totalTopics = allTopics.length;
    const totalWeightage = subjects.reduce((s, sub) => s + sub.weightage, 0) || 200;

    // ===== 1. SYLLABUS COVERAGE (35%) =====
    let weightedCoverage = 0;
    subjects.forEach(sub => {
      const subTopics = allTopics.filter(t => t.subjectId === sub.id);
      if (subTopics.length === 0) return;
      const withMain = subTopics.filter(t => t.completedStages.includes('main-video')).length;
      const coverage = withMain / subTopics.length;
      weightedCoverage += coverage * (sub.weightage / totalWeightage);
    });
    const syllabusScore = weightedCoverage * 35;

    // ===== 2. REVISION QUALITY (20%) =====
    const topicsWithMain = allTopics.filter(t => t.completedStages.includes('main-video'));
    const topicsWithMainCount = topicsWithMain.length || 1;
    
    const rr1 = topicsWithMain.filter(t => t.revisionSession >= 1).length;
    const rr2 = topicsWithMain.filter(t => t.revisionSession >= 2).length;
    const rr3 = topicsWithMain.filter(t => t.revisionSession >= 3).length;

    const revisionCompleteness = (
      (rr1 / topicsWithMainCount) * 0.4 +
      (rr2 / topicsWithMainCount) * 0.35 +
      (rr3 / topicsWithMainCount) * 0.25
    );

    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const overdueTopics = topicsWithMain.filter(t => 
      t.lastStudied && new Date(t.lastStudied) < fourteenDaysAgo
    ).length;
    const overduePenalty = topicsWithMainCount > 0 ? (overdueTopics / topicsWithMainCount) * 0.15 : 0;

    const criticalSubjectIds = ['medicine', 'surgery', 'obg', 'pediatrics'];
    const criticalTopics = topicsWithMain.filter(t => criticalSubjectIds.includes(t.subjectId));
    const criticalOverdue = criticalTopics.filter(t =>
      t.lastStudied && new Date(t.lastStudied) < fourteenDaysAgo
    ).length;
    const criticalPenalty = criticalTopics.length > 0 ? (criticalOverdue / criticalTopics.length) * 0.1 : 0;

    const revisionScore = Math.max(0, (revisionCompleteness - overduePenalty - criticalPenalty)) * 20;

    // ===== 3. MCQ PRACTICE (20%) =====
    const totalMcqsSolved = allTopics.reduce((s, t) => s + t.questionsSolved, 0);
    const mcqGoal = mcqGoalPerSubject * subjects.length;
    const volumeProgress = Math.min(totalMcqsSolved / (mcqGoal || 1), 1) * 50;

    // Subject-weighted accuracy from mock tests subject scores
    let weightedAccuracy = 0;
    let hasAccuracyData = false;
    subjects.forEach(sub => {
      const subScores = mockTests.flatMap(m => m.subjectScores).filter(s => s.subjectId === sub.id);
      if (subScores.length > 0) {
        hasAccuracyData = true;
        const avgAcc = subScores.reduce((s, sc) => s + sc.accuracy, 0) / subScores.length;
        weightedAccuracy += (avgAcc / 100) * (sub.weightage / totalWeightage);
      }
    });
    if (!hasAccuracyData) weightedAccuracy = (stats.averageAccuracy || 0) / 100;

    const accuracyTarget = 0.75;
    const accuracyScore = Math.min((weightedAccuracy / accuracyTarget) * 50, 50);

    const mcqScore = totalMcqsSolved === 0 ? 0 : (volumeProgress + accuracyScore) * 20 / 100;

    // ===== 4. PYQ COMPLETION (15%) =====
    const pyqSubjectEntries = pyqData.filter(e => e.subjectId !== 'all');
    const pyqsDone = pyqSubjectEntries.filter(e => e.done).length;
    const totalPyqEntries = pyqSubjectEntries.length || 1;
    const pyqVolumeScore = Math.min(pyqsDone / totalPyqEntries, 1) * 60;

    // PYQ accuracy from entries that have marks
    const pyqWithMarks = pyqSubjectEntries.filter(e => e.done && e.totalQuestions && e.totalQuestions > 0);
    let pyqAccuracyScore = 0;
    if (pyqWithMarks.length > 0) {
      const avgPyqAcc = pyqWithMarks.reduce((s, e) => s + ((e.correctAnswers || 0) / (e.totalQuestions || 1)), 0) / pyqWithMarks.length;
      pyqAccuracyScore = Math.min((avgPyqAcc / 0.8) * 40, 40);
    }

    // Year coverage
    const yearsRange = pyqYearTo - pyqYearFrom + 1;
    const uniqueYears = new Set(pyqSubjectEntries.filter(e => e.done).map(e => {
      const match = e.session?.match(/(\d{4})/);
      return match ? parseInt(match[1]) : 0;
    }).filter(y => y >= pyqYearFrom && y <= pyqYearTo));
    const yearCoverageBonus = yearsRange > 0 ? (uniqueYears.size / yearsRange) * 5 : 0;

    const pyqScore = pyqsDone === 0 ? 0 : (pyqVolumeScore + pyqAccuracyScore + yearCoverageBonus) * 15 / 100;

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

    // Early Bird
    let earlyBirdBonus = 0;
    if (daysUntilExam > 240 && baseScore > 40) {
      earlyBirdBonus = 5;
      bonusDetails.push('Early Bird: Excellent head start! 🌱');
    }

    // Streak Master
    let streakBonus = 0;
    if (stats.currentStreak >= 60) { streakBonus = 3; bonusDetails.push(`Streak Master: ${stats.currentStreak}-day streak! 🔥`); }
    else if (stats.currentStreak >= 30) { streakBonus = 2; bonusDetails.push(`Streak: ${stats.currentStreak}-day streak ⚡`); }
    else if (stats.currentStreak >= 14) { streakBonus = 1; bonusDetails.push(`Streak: ${stats.currentStreak}-day streak 💪`); }

    // Accuracy Elite
    let accuracyBonus = 0;
    const overallAccPct = weightedAccuracy * 100;
    if (overallAccPct >= 85) { accuracyBonus = 3; bonusDetails.push('Accuracy Elite: 85%+ accuracy 🎯'); }
    else if (overallAccPct >= 80) { accuracyBonus = 2; bonusDetails.push('Strong Accuracy: 80%+ 📈'); }

    // Balanced Preparation
    let balancedBonus = 0;
    const criticalSubNames = ['medicine', 'surgery', 'obg', 'pediatrics', 'pathology', 'pharmacology', 'anatomy', 'physiology'];
    const weakCritical = subjects.filter(s => {
      if (!criticalSubNames.includes(s.id)) return false;
      const subTopics = allTopics.filter(t => t.subjectId === s.id);
      const done = subTopics.filter(t => t.completedStages.includes('main-video')).length;
      return subTopics.length > 0 && (done / subTopics.length) < 0.4;
    });
    if (weakCritical.length === 0 && totalTopics > 0) {
      balancedBonus = 2;
      bonusDetails.push('Balanced: All critical subjects strong 💎');
    }

    // Momentum Builder
    let momentumBonus = 0;
    const last7Days = studyLogs.filter(l => {
      const d = new Date(l.date);
      return d > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    });
    const avgLast7 = last7Days.reduce((s, l) => s + l.minutesStudied, 0) / 7;
    const dailyGoalMin = 480; // 8 hours
    if (avgLast7 > dailyGoalMin * 1.3) { momentumBonus = 2; bonusDetails.push('On fire this week! 🚀'); }
    else if (avgLast7 > dailyGoalMin * 1.1) { momentumBonus = 1; bonusDetails.push('Great momentum! 📊'); }

    const totalBonuses = earlyBirdBonus + streakBonus + accuracyBonus + balancedBonus + momentumBonus;

    // ===== PENALTIES =====
    const penaltyDetails: string[] = [];

    // Procrastination
    let procrastination = 0;
    if (daysUntilExam < 90 && baseScore < 60) { procrastination = -8; penaltyDetails.push(`Exam in ${daysUntilExam} days! Intensify prep`); }
    else if (daysUntilExam < 60 && baseScore < 70) { procrastination = -5; penaltyDetails.push(`${daysUntilExam} days left! Focus urgently`); }
    else if (daysUntilExam < 30 && baseScore < 80) { procrastination = -3; penaltyDetails.push('Final month! Maximum intensity'); }

    // Critical Subjects Weak
    let criticalWeakPenalty = 0;
    const critWeakSubs = subjects.filter(s => criticalSubjectIds.includes(s.id)).filter(sub => {
      const subTopics = allTopics.filter(t => t.subjectId === sub.id);
      const done = subTopics.filter(t => t.completedStages.includes('main-video')).length;
      return subTopics.length > 0 && (done / subTopics.length) < 0.5;
    });
    if (critWeakSubs.length > 0) {
      criticalWeakPenalty = Math.max(-7, critWeakSubs.reduce((s, sub) => {
        const subTopics = allTopics.filter(t => t.subjectId === sub.id);
        const done = subTopics.filter(t => t.completedStages.includes('main-video')).length;
        const gap = (0.5 - done / subTopics.length) * (sub.weightage / totalWeightage);
        return s + gap * -0.5 * 100;
      }, 0));
      penaltyDetails.push(`${critWeakSubs.length} critical subject(s) need attention`);
    }

    // Mock Deficit
    let mockDeficit = 0;
    if (daysUntilExam < 90 && mockTests.length < 5) {
      mockDeficit = -5;
      penaltyDetails.push(`Only ${mockTests.length} mocks taken`);
    } else if (mockTests.length < 3) {
      mockDeficit = -3;
      penaltyDetails.push('Take more mock tests');
    }

    // Inactive
    let inactive = 0;
    const lastLog = studyLogs.length > 0 ? new Date(studyLogs[studyLogs.length - 1].date) : null;
    const daysSinceStudy = lastLog ? Math.ceil((now.getTime() - lastLog.getTime()) / (1000 * 60 * 60 * 24)) : 999;
    if (daysSinceStudy > 3) { inactive = -4; penaltyDetails.push(`${daysSinceStudy} days since last study`); }
    else if (daysSinceStudy > 1) { inactive = -2; penaltyDetails.push('Missing study days'); }

    // Accuracy Declining (simplified)
    let accuracyDrop = 0;
    // Compare recent mcq accuracy vs overall from stats
    const recentMcqLogs = mcqLogs.filter(l => new Date(l.date) > new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000));
    // If stats.averageAccuracy is declining — simplified check
    if (recentMocks.length >= 2) {
      const latestAcc = recentMocks[0].correctAnswers / (recentMocks[0].attemptedQuestions || 1) * 100;
      const olderAcc = recentMocks[recentMocks.length - 1].correctAnswers / (recentMocks[recentMocks.length - 1].attemptedQuestions || 1) * 100;
      if (latestAcc < olderAcc - 10) { accuracyDrop = -3; penaltyDetails.push('Recent accuracy dropped significantly'); }
      else if (latestAcc < olderAcc - 5) { accuracyDrop = -1; penaltyDetails.push('Recent accuracy slipping'); }
    }

    // Imbalanced Study
    let imbalanced = 0;
    // Check if high-weightage subjects have very few topics started
    const neglected = subjects.filter(sub => {
      if (sub.weightage < 20) return false; // Only check high-weightage
      const subTopics = allTopics.filter(t => t.subjectId === sub.id);
      const started = subTopics.filter(t => t.completedStages.length > 0).length;
      return subTopics.length > 0 && (started / subTopics.length) < 0.1;
    });
    if (neglected.length > 0) {
      imbalanced = Math.max(-3, neglected.length * -1);
      penaltyDetails.push(`${neglected.length} high-weightage subject(s) neglected`);
    }

    const totalPenalties = procrastination + criticalWeakPenalty + mockDeficit + inactive + accuracyDrop + imbalanced;

    // FINAL
    const finalScore = Math.max(0, Math.min(100, baseScore + totalBonuses + totalPenalties));
    const { color, label } = getColorAndLabel(finalScore);

    // Recommendations
    const recommendations: string[] = [];
    if (syllabusScore < 20) recommendations.push('Focus on completing Main videos for all subjects');
    if (revisionScore < 8) recommendations.push(`Complete RR1 for ${topicsWithMainCount - rr1} pending topics`);
    if (mcqScore < 10) recommendations.push('Increase MCQ practice volume');
    if (critWeakSubs.length > 0) recommendations.push(`Prioritize: ${critWeakSubs.map(s => s.name).join(', ')}`);
    if (mockTests.length < 3) recommendations.push('Take your next mock test this week');
    if (pyqsDone < totalPyqEntries * 0.5) recommendations.push('Complete more PYQ sessions');
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
      },
      color,
      label,
      message: getMessage(finalScore),
      recommendations: recommendations.slice(0, 3),
    };
  }, [input]);
}
