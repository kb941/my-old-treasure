import { motion } from 'framer-motion';
import { Achievement } from '@/types';
import { cn } from '@/lib/utils';
import { ArrowLeft, Trophy, Flame, BookOpen, RotateCcw, PenTool, Target, Clock, Rocket, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AchievementsDetailViewProps {
  achievements: Achievement[];
  onBack: () => void;
}

const CATEGORIES: { prefix: string; label: string; icon: React.ReactNode; color: string }[] = [
  { prefix: 'streak', label: 'Study Streak', icon: <Flame className="w-4 h-4" />, color: 'from-orange-500/20 to-red-500/20' },
  { prefix: 'syllabus', label: 'Syllabus Completion', icon: <BookOpen className="w-4 h-4" />, color: 'from-yellow-500/20 to-amber-500/20' },
  { prefix: 'revision', label: 'Revision Master', icon: <RotateCcw className="w-4 h-4" />, color: 'from-blue-500/20 to-cyan-500/20' },
  { prefix: 'qs', label: 'Question Solver', icon: <PenTool className="w-4 h-4" />, color: 'from-violet-500/20 to-purple-500/20' },
  { prefix: 'mock', label: 'Mock Warrior', icon: <Target className="w-4 h-4" />, color: 'from-emerald-500/20 to-green-500/20' },
  { prefix: 'accuracy', label: 'Accuracy Ace', icon: <Award className="w-4 h-4" />, color: 'from-pink-500/20 to-rose-500/20' },
  { prefix: 'consistency', label: 'Consistency King', icon: <Clock className="w-4 h-4" />, color: 'from-indigo-500/20 to-blue-500/20' },
  { prefix: 'comeback', label: 'Comeback Champion', icon: <Rocket className="w-4 h-4" />, color: 'from-teal-500/20 to-emerald-500/20' },
  { prefix: 'pyq', label: 'PYQ Milestones', icon: <BookOpen className="w-4 h-4" />, color: 'from-amber-500/20 to-orange-500/20' },
];

export function AchievementsDetailView({ achievements, onBack }: AchievementsDetailViewProps) {
  const unlocked = achievements.filter(a => a.unlockedAt !== null);

  const grouped = CATEGORIES.map(cat => ({
    ...cat,
    badges: achievements.filter(a => a.id.startsWith(cat.prefix)),
  })).filter(g => g.badges.length > 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Achievements
          </h2>
          <p className="text-xs text-muted-foreground">
            {unlocked.length} of {achievements.length} unlocked
          </p>
        </div>
      </div>

      {/* Progress overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-4 border border-border"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm font-bold text-primary">
            {Math.round((unlocked.length / achievements.length) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(unlocked.length / achievements.length) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-primary rounded-full"
          />
        </div>
      </motion.div>

      {/* Grouped badges */}
      {grouped.map((group, gi) => (
        <motion.div
          key={group.prefix}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.05 }}
          className="bg-card rounded-xl border border-border overflow-hidden"
        >
          {/* Category header */}
          <div className={cn("px-4 py-3 bg-gradient-to-r border-b border-border", group.color)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-primary">{group.icon}</span>
                <h3 className="font-semibold text-sm">{group.label}</h3>
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">
                {group.badges.filter(b => b.unlockedAt !== null).length}/{group.badges.length}
              </span>
            </div>
          </div>

          {/* Badges */}
          <div className="p-3 space-y-2">
            {group.badges.map((badge, i) => {
              const isUnlocked = badge.unlockedAt !== null;
              const progress = Math.min((badge.progress / badge.target) * 100, 100);
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: gi * 0.05 + i * 0.03 }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg p-3 transition-all",
                    isUnlocked
                      ? "bg-primary/5 border border-primary/15"
                      : "bg-secondary/20 border border-transparent"
                  )}
                >
                  <span className={cn("text-2xl shrink-0", !isUnlocked && "grayscale opacity-50")}>
                    {badge.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn("text-sm font-medium truncate", !isUnlocked && "text-muted-foreground")}>
                        {badge.name}
                      </p>
                      {isUnlocked && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium shrink-0">
                          ✓ Done
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{badge.description}</p>
                    {!isUnlocked && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.6, delay: gi * 0.05 + i * 0.03 }}
                            className="h-full bg-primary/50 rounded-full"
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {badge.progress}/{badge.target}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
