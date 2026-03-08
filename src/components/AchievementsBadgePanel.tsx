import { motion } from 'framer-motion';
import { Achievement } from '@/types';
import { Trophy, ChevronRight } from 'lucide-react';

interface AchievementsBadgePanelProps {
  achievements: Achievement[];
  onViewAll: () => void;
}

export function AchievementsBadgePanel({ achievements, onViewAll }: AchievementsBadgePanelProps) {
  const unlocked = achievements.filter(a => a.unlockedAt !== null);
  const nextUp = achievements
    .filter(a => a.unlockedAt === null)
    .sort((a, b) => (b.progress / b.target) - (a.progress / a.target))[0];

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onViewAll}
      className="w-full bg-card rounded-xl p-4 shadow-card border border-border text-left transition-all hover:border-primary/30 active:scale-[0.99]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Achievements</h3>
            <p className="text-xs text-muted-foreground">
              {unlocked.length} of {achievements.length} unlocked
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>

      {nextUp && (
        <div className="mt-3 flex items-center gap-2 bg-secondary/30 rounded-lg px-3 py-2">
          <span className="text-base">{nextUp.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-foreground truncate">Next: {nextUp.name}</p>
            <div className="h-1 bg-secondary rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-primary/60 rounded-full"
                style={{ width: `${Math.min((nextUp.progress / nextUp.target) * 100, 100)}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground shrink-0">
            {nextUp.progress}/{nextUp.target}
          </span>
        </div>
      )}
    </motion.button>
  );
}
