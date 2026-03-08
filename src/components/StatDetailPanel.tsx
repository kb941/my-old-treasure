import { motion } from 'framer-motion';
import { Zap, Flame, Clock, Target, Trophy, Star, TrendingUp } from 'lucide-react';
import { UserStats, StudyLog, Subject } from '@/types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type StatType = 'xp' | 'streak' | 'study' | 'accuracy';

interface StatDetailPanelProps {
  stat: StatType | null;
  stats: UserStats;
  studyLogs: StudyLog[];
  subjects: Subject[];
  onClose: () => void;
}

const levelTitles = [
  'Medical Student', 'Junior Intern', 'Senior Intern', 'Resident',
  'Senior Resident', 'Specialist', 'Senior Specialist', 'Consultant',
  'Senior Consultant', 'Department Head',
];

const statConfig: Record<StatType, { title: string; icon: typeof Zap; gradient: string }> = {
  xp: { title: 'XP & Levels', icon: Zap, gradient: 'gradient-xp' },
  streak: { title: 'Study Streak', icon: Flame, gradient: 'gradient-warning' },
  study: { title: 'Study Time', icon: Clock, gradient: 'gradient-primary' },
  accuracy: { title: 'Accuracy', icon: Target, gradient: 'gradient-success' },
};

function XPPanel({ stats }: { stats: UserStats }) {
  const currentLevel = stats.level;
  const xpInLevel = stats.totalXP % 500;

  return (
    <div className="space-y-4">
      <div className="bg-muted/30 rounded-xl p-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Level {currentLevel}</span>
          <span>{xpInLevel}/500 XP</span>
        </div>
        <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${(xpInLevel / 500) * 100}%` }}
            transition={{ duration: 0.8 }} className="h-full gradient-xp rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Total XP', value: stats.totalXP.toLocaleString() },
          { label: 'Topics', value: stats.topicsCompleted },
          { label: 'Subjects', value: stats.subjectsCompleted },
        ].map(item => (
          <div key={item.label} className="bg-muted/30 rounded-xl p-3 text-center">
            <p className="text-lg font-bold">{item.value}</p>
            <p className="text-[11px] text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-1 max-h-48 overflow-y-auto">
        {levelTitles.map((title, i) => {
          const level = i + 1;
          const isUnlocked = level <= currentLevel;
          const isCurrent = level === currentLevel;
          return (
            <div key={i} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              isCurrent ? 'bg-primary/10 border border-primary/20 font-medium' :
              isUnlocked ? 'bg-muted/20' : 'opacity-30'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                isUnlocked ? 'gradient-xp text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}>{level}</div>
              <span className="flex-1 text-sm">{title}</span>
              {isCurrent && <span className="text-[11px] text-primary font-semibold">YOU</span>}
              {isUnlocked && !isCurrent && <Star className="w-3 h-3 text-primary/40" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StreakPanel({ stats }: { stats: UserStats }) {
  const today = new Date();
  const days: { date: Date; active: boolean; label: string }[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push({ date: d, active: i < stats.currentStreak, label: d.getDate().toString() });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Current', value: `${stats.currentStreak}d` },
          { label: 'Longest', value: `${stats.longestStreak}d` },
          { label: 'Progress', value: `${stats.longestStreak > 0 ? Math.round((stats.currentStreak / stats.longestStreak) * 100) : 0}%` },
        ].map(item => (
          <div key={item.label} className="bg-muted/30 rounded-xl p-3 text-center">
            <p className="text-lg font-bold">{item.value}</p>
            <p className="text-[11px] text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2 font-medium">Last 28 days</p>
        <div className="grid grid-cols-7 gap-1">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <span key={i} className="text-[10px] text-muted-foreground text-center">{d}</span>
          ))}
          {Array.from({ length: days[0].date.getDay() }).map((_, i) => <div key={`e-${i}`} />)}
          {days.map((day, i) => (
            <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.008 }}
              className={`aspect-square rounded flex items-center justify-center text-[10px] font-medium ${
                day.active ? 'gradient-warning text-primary-foreground' : 'bg-muted/40 text-muted-foreground'
              }`}
            >{day.label}</motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StudyPanel({ stats, studyLogs }: { stats: UserStats; studyLogs: StudyLog[] }) {
  const today = new Date();
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const totalMin = studyLogs.filter(l => l.date === dateStr).reduce((s, l) => s + l.minutesStudied, 0);
    return { day: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()], hours: +(totalMin / 60).toFixed(1) };
  });
  const totalWeek = weekData.reduce((s, d) => s + d.hours, 0);

  return (
    <div className="space-y-4">
      <div className="bg-muted/30 rounded-xl p-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Today's Progress</span>
          <span>{Math.floor(stats.todayStudyMinutes / 60)}h {stats.todayStudyMinutes % 60}m / 8h</span>
        </div>
        <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((stats.todayStudyMinutes / 480) * 100, 100)}%` }}
            transition={{ duration: 0.8 }} className="h-full gradient-primary rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'This Week', value: `${totalWeek.toFixed(1)}h` },
          { label: 'Daily Avg', value: `${(totalWeek / 7).toFixed(1)}h` },
          { label: 'All Time', value: `${stats.totalStudyHours}h` },
        ].map(item => (
          <div key={item.label} className="bg-muted/30 rounded-xl p-3 text-center">
            <p className="text-lg font-bold">{item.value}</p>
            <p className="text-[11px] text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weekData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} unit="h" />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
              formatter={(v: number) => [`${v}h`, 'Study']} />
            <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function AccuracyPanel({ stats, subjects }: { stats: UserStats; subjects: Subject[] }) {
  const sorted = [...subjects].sort((a, b) => b.accuracy - a.accuracy).filter(s => s.accuracy > 0);
  const above = sorted.filter(s => s.accuracy >= 75).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-primary/10 rounded-xl p-3 text-center border border-primary/10">
          <p className="text-xl font-bold text-primary">{above}</p>
          <p className="text-[11px] text-muted-foreground">Above 75%</p>
        </div>
        <div className="bg-destructive/10 rounded-xl p-3 text-center border border-destructive/10">
          <p className="text-xl font-bold text-destructive">{sorted.length - above}</p>
          <p className="text-[11px] text-muted-foreground">Below 75%</p>
        </div>
      </div>

      {sorted.length > 0 ? (
        <div className="space-y-1.5 max-h-56 overflow-y-auto">
          {sorted.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 py-1">
              <span className="text-xs text-muted-foreground w-20 truncate shrink-0">{s.name}</span>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${s.accuracy}%` }}
                  transition={{ duration: 0.6, delay: i * 0.02 }}
                  className={`h-full rounded-full ${s.accuracy >= 75 ? 'bg-primary' : s.accuracy >= 50 ? 'bg-accent' : 'bg-destructive'}`} />
              </div>
              <span className={`text-xs font-semibold w-9 text-right ${s.accuracy >= 75 ? 'text-primary' : s.accuracy >= 50 ? 'text-muted-foreground' : 'text-destructive'}`}>
                {s.accuracy}%
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">Log sessions to see breakdown</p>
      )}
    </div>
  );
}

export function StatDetailPanel({ stat, stats, studyLogs, subjects, onClose }: StatDetailPanelProps) {
  if (!stat) return null;
  const config = statConfig[stat];
  const Icon = config.icon;

  return (
    <Dialog open={!!stat} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[380px] rounded-2xl p-0 overflow-hidden border-border gap-0">
        {/* Header */}
        <div className={`${config.gradient} px-5 py-4 flex items-center gap-3`}>
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <DialogTitle className="text-primary-foreground text-base">{config.title}</DialogTitle>
            <DialogDescription className="text-primary-foreground/70 text-xs">
              {stat === 'xp' && `Level ${stats.level} • ${stats.totalXP} XP`}
              {stat === 'streak' && `${stats.currentStreak} day streak`}
              {stat === 'study' && `${Math.floor(stats.todayStudyMinutes / 60)}h ${stats.todayStudyMinutes % 60}m today`}
              {stat === 'accuracy' && `${stats.averageAccuracy}% overall`}
            </DialogDescription>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          {stat === 'xp' && <XPPanel stats={stats} />}
          {stat === 'streak' && <StreakPanel stats={stats} />}
          {stat === 'study' && <StudyPanel stats={stats} studyLogs={studyLogs} />}
          {stat === 'accuracy' && <AccuracyPanel stats={stats} subjects={subjects} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
