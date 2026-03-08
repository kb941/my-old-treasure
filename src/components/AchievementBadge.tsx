import { motion } from 'framer-motion';
import { Achievement } from '@/types';
import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
  achievement: Achievement;
  index: number;
}

export function AchievementBadge({ achievement, index }: AchievementBadgeProps) {
  const isUnlocked = achievement.unlockedAt !== null;
  const progress = (achievement.progress / achievement.target) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        "relative bg-card rounded-xl p-4 shadow-card border border-border text-center min-w-[140px] transition-all",
        !isUnlocked && "opacity-60"
      )}
    >
      <motion.div
        className="text-4xl mb-2"
        animate={isUnlocked ? { 
          scale: [1, 1.1, 1],
        } : {}}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        {achievement.icon}
      </motion.div>
      <h4 className="font-semibold text-sm mb-1">{achievement.name}</h4>
      <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
      
      {!isUnlocked && (
        <>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, delay: index * 0.05 }}
              className="h-full gradient-accent rounded-full"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {achievement.progress}/{achievement.target}
          </p>
        </>
      )}
      
      {isUnlocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 gradient-success rounded-full flex items-center justify-center"
        >
          <span className="text-xs">✓</span>
        </motion.div>
      )}
    </motion.div>
  );
}
