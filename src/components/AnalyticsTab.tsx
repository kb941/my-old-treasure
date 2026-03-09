import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, BookOpen, Activity, FileText } from 'lucide-react';
import { MockAnalytics } from '@/components/MockAnalytics';
import { ReadinessScoreCard } from '@/components/ReadinessScoreCard';
import { WeeklyStats } from '@/components/WeeklyStats';
import { McqWeeklyChart } from '@/components/McqWeeklyChart';
import { ContentProgressDashboard } from '@/components/ContentProgressDashboard';
import { AdvancedAnalytics } from '@/components/AdvancedAnalytics';
import { PYQAccuracyTrends } from '@/components/PYQAccuracyTrends';
import { AchievementsBadgePanel } from '@/components/AchievementsBadgePanel';
import { SubjectStudyHours } from '@/components/SubjectStudyHours';
import { RankPredictor } from '@/components/RankPredictor';
import { MockTest, MarkingScheme, UserStats, Chapter, StudyLog, Subject, ContentType, Achievement } from '@/types';
import { ReadinessResult } from '@/hooks/useReadinessScore';

type InsightsTab = 'overview' | 'content' | 'patterns' | 'pyq';

const tabs: { key: InsightsTab; label: string; icon: typeof BarChart3 }[] = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'content', label: 'Content', icon: BookOpen },
  { key: 'patterns', label: 'Patterns', icon: Activity },
  { key: 'pyq', label: 'PYQ', icon: FileText },
];

type TimePeriod = 'week' | 'month';

interface AnalyticsTabProps {
  mockTests: MockTest[];
  markingScheme: MarkingScheme;
  stats: UserStats;
  chapters: Chapter[];
  studyLogs: StudyLog[];
  mcqLogs: { date: string; count: number }[];
  readinessResult: ReadinessResult;
  subjects: Subject[];
  contentTypes: ContentType[];
  pyqAchievements: Achievement[];
  onViewAchievements: () => void;
}

export function AnalyticsTab({
  mockTests, markingScheme, stats, chapters, studyLogs, mcqLogs,
  readinessResult, subjects, contentTypes, pyqAchievements, onViewAchievements,
}: AnalyticsTabProps) {
  const [activeInsight, setActiveInsight] = useState<InsightsTab>('overview');
  const [period, setPeriod] = useState<TimePeriod>('week');

  return (
    <div className="space-y-3">
      {/* Horizontal tab bar */}
      <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeInsight === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveInsight(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1 px-1.5 py-2 rounded-lg text-[11px] font-medium transition-all ${
                isActive
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <motion.div
        key={activeInsight}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="space-y-3"
      >
        {activeInsight === 'overview' && (
          <>
            <MockAnalytics mockTests={mockTests} markingScheme={markingScheme} stats={stats} chapters={chapters} studyLogs={studyLogs} />
            <ReadinessScoreCard result={readinessResult} compact />

            {/* Period toggle */}
            <div className="flex gap-1 bg-muted/50 rounded-lg p-0.5 w-fit">
              <button
                onClick={() => setPeriod('week')}
                className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
                  period === 'week' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >This Week</button>
              <button
                onClick={() => setPeriod('month')}
                className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
                  period === 'month' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >This Month</button>
            </div>

            <WeeklyStats studyLogs={studyLogs} mcqLogs={mcqLogs} period={period} />
            <McqWeeklyChart mcqLogs={mcqLogs} period={period} />
            <AchievementsBadgePanel achievements={pyqAchievements} onViewAll={onViewAchievements} />
          </>
        )}

        {activeInsight === 'content' && (
          <ContentProgressDashboard chapters={chapters} contentTypes={contentTypes} />
        )}

        {activeInsight === 'patterns' && (
          <AdvancedAnalytics subjects={subjects} chapters={chapters} studyLogs={studyLogs} mockTests={mockTests} />
        )}

        {activeInsight === 'pyq' && (
          <PYQAccuracyTrends subjects={subjects} />
        )}
      </motion.div>
    </div>
  );
}
