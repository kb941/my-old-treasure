import { motion } from 'framer-motion';
import { Flame, Zap, Clock, Target } from 'lucide-react';
import { UserStats } from '@/types';

interface StatsBarProps {
  stats: UserStats;
  onStatClick?: (stat: 'xp' | 'streak' | 'study' | 'accuracy') => void;
}

const levelTitles = [
  'Medical Student', 'Junior Intern', 'Senior Intern', 'Resident',
  'Senior Resident', 'Specialist', 'Senior Specialist', 'Consultant',
  'Senior Consultant', 'Department Head',
];

export function StatsBar({ stats, onStatClick }: StatsBarProps) {
  const levelProgress = (stats.totalXP % 500) / 500 * 100;
  const levelTitle = levelTitles[Math.min(stats.level - 1, levelTitles.length - 1)];
  const hoursToday = Math.floor(stats.todayStudyMinutes / 60);
  const minutesToday = stats.todayStudyMinutes % 60;
  const studyProgress = Math.min((stats.todayStudyMinutes / 480) * 100, 100);
  const streakProgress = stats.longestStreak > 0 ? (stats.currentStreak / stats.longestStreak) * 100 : 0;
  const accuracyProgress = stats.averageAccuracy;

  const cards: {
    key: 'xp' | 'streak' | 'study' | 'accuracy';
    icon: typeof Zap;
    label: string;
    value: string;
    sub: string;
    progress: number;
    iconColor: string;
    barColor: string;
  }[] = [
    {
      key: 'xp', icon: Zap,
      label: 'XP', value: `Lv ${stats.level}`,
      sub: levelTitle, progress: levelProgress,
      iconColor: 'text-purple-500', barColor: 'bg-purple-500/60',
    },
    {
      key: 'streak', icon: Flame,
      label: 'Streak', value: `${stats.currentStreak}d`,
      sub: `Best: ${stats.longestStreak}d`, progress: Math.min(streakProgress, 100),
      iconColor: 'text-amber-500', barColor: 'bg-amber-500/60',
    },
    {
      key: 'study', icon: Clock,
      label: 'Today', value: `${hoursToday}h ${minutesToday}m`,
      sub: 'Goal: 8h', progress: studyProgress,
      iconColor: 'text-sky-500', barColor: 'bg-sky-500/60',
    },
    {
      key: 'accuracy', icon: Target,
      label: 'Accuracy', value: `${stats.averageAccuracy}%`,
      sub: 'Target: 75%', progress: Math.min(accuracyProgress / 75 * 100, 100),
      iconColor: 'text-emerald-500', barColor: 'bg-emerald-500/60',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-2"
    >
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onStatClick?.(card.key)}
            className="bg-card rounded-xl p-3 border border-border cursor-pointer hover:border-primary/20 transition-all active:scale-[0.97] flex flex-col"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-3.5 h-3.5 ${card.iconColor}`} />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{card.label}</span>
            </div>
            <p className="text-lg font-bold leading-none mb-1.5">{card.value}</p>
            <div className="h-1 bg-secondary rounded-full overflow-hidden mb-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${card.progress}%` }}
                transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.05 + 0.1 }}
                className={`h-full ${card.barColor} rounded-full`}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">{card.sub}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
