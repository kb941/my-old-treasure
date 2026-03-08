import { motion } from 'framer-motion';
import { Chapter, ContentType, DEFAULT_CONTENT_TYPES } from '@/types';
import { cn } from '@/lib/utils';

interface ContentProgressDashboardProps {
  chapters: Chapter[];
  contentTypes: ContentType[];
}

export function ContentProgressDashboard({ chapters, contentTypes }: ContentProgressDashboardProps) {
  const enabledTypes = (contentTypes.length > 0 ? contentTypes : DEFAULT_CONTENT_TYPES).filter(ct => ct.enabled);
  const allTopics = chapters.flatMap(c => c.topics);
  const totalTopics = allTopics.length;

  if (totalTopics === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-6 shadow-card border border-border"
      >
        <h3 className="font-semibold text-lg mb-2">Content Progress</h3>
        <p className="text-sm text-muted-foreground">Add subjects with chapters and topics to see progress here.</p>
      </motion.div>
    );
  }

  // Map content type IDs to the completedStages values
  const getStageId = (ct: ContentType) => {
    // Match against common IDs
    const map: Record<string, string> = {
      'main-video': 'main-video',
      'rr-video': 'rr-video',
      'btr-video': 'btr-video',
      'extra-video': 'extra-video',
      'mcqs': 'mcqs',
      'pyqs': 'pyqs',
    };
    return map[ct.id] || ct.id;
  };

  const stats = enabledTypes.map(ct => {
    const stageId = getStageId(ct);
    const completed = allTopics.filter(t => t.completedStages?.includes(stageId)).length;
    const percentage = totalTopics > 0 ? Math.round((completed / totalTopics) * 100) : 0;
    return { ...ct, completed, percentage, stageId };
  });

  const colors = [
    'bg-primary', 'bg-accent', 'hsl(142, 71%, 50%)', 'hsl(38, 92%, 55%)',
    'hsl(280, 85%, 60%)', 'hsl(0, 84%, 60%)',
  ];

  const barColors = [
    'bg-primary',
    'bg-accent',
    'bg-green-500',
    'bg-amber-500',
    'bg-purple-500',
    'bg-red-500',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-card border border-border"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Content Progress</h3>
        <span className="text-xs text-muted-foreground">{totalTopics} topics total</span>
      </div>

      <div className="space-y-4">
        {stats.map((stat, i) => (
          <div key={stat.id}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium">{stat.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{stat.completed}/{totalTopics}</span>
                <span className={cn(
                  "text-sm font-bold",
                  stat.percentage >= 70 ? "text-green-500" : stat.percentage >= 40 ? "text-amber-500" : "text-muted-foreground"
                )}>
                  {stat.percentage}%
                </span>
              </div>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stat.percentage}%` }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className={cn("h-full rounded-full", barColors[i % barColors.length])}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Overall completion */}
      {stats.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Completion</span>
            <span className="text-lg font-bold text-gradient-primary">
              {Math.round(stats.reduce((sum, s) => sum + s.percentage, 0) / stats.length)}%
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
