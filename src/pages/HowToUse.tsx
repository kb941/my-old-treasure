import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ArrowLeft, Layout, BookOpen, RotateCcw, BarChart3, Target, Trophy,
  Brain, Clock, Bell, CheckCircle2, Zap, ListChecks, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/PageTransition';
import screenshotDashboard from '@/assets/screenshot-dashboard.jpg';
import screenshotAnalytics from '@/assets/screenshot-analytics.jpg';
import screenshotSubjects from '@/assets/screenshot-subjects.jpg';
import screenshotRevision from '@/assets/screenshot-revision.jpg';

const FadeIn = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const features = [
  {
    id: 'kanban',
    icon: Layout,
    title: 'Kanban Task Board',
    desc: 'Organize your daily study tasks visually with a drag-and-drop Kanban board. Create tasks for today, this week, or backlog — and move them as you progress.',
    details: [
      'Three columns: Today, This Week, Backlog',
      'Quick-add tasks with subject tagging',
      'Mark tasks as complete with one tap',
      'Daily task counter in the stats bar',
    ],
    screenshot: screenshotDashboard,
  },
  {
    id: 'subjects',
    icon: BookOpen,
    title: 'Subject & Topic Tracking',
    desc: 'Track all 19 NEET PG subjects with 1,256+ topics. Mark each topic\'s status and confidence level as you study.',
    details: [
      '19 subjects with chapter-level breakdown',
      '5-star confidence rating per topic',
      'Status tracking: Not Started → In Progress → Done',
      'Visual progress bars per subject and chapter',
    ],
    screenshot: screenshotSubjects,
  },
  {
    id: 'revision',
    icon: RotateCcw,
    title: 'Spaced Repetition & Revisions',
    desc: 'Never forget what you studied. The app auto-schedules revisions based on your confidence level using spaced repetition intervals.',
    details: [
      'Auto-scheduled revision dates based on confidence',
      'Revision calendar with color-coded entries',
      'Heatmap showing revision frequency',
      'Overdue revision alerts and reminders',
    ],
    screenshot: screenshotRevision,
  },
  {
    id: 'analytics',
    icon: BarChart3,
    title: 'Analytics & Rank Prediction',
    desc: 'Comprehensive analytics dashboard with study patterns, MCQ trends, per-subject hours, readiness score, and NEET PG rank prediction.',
    details: [
      'Weekly study hours chart',
      'Per-subject study time breakdown',
      'MCQ accuracy trends over time',
      'Rank predictor based on real NEET PG data',
      'Readiness score combining all metrics',
    ],
    screenshot: screenshotAnalytics,
  },
  {
    id: 'focus',
    icon: Target,
    title: 'Focus Mode (Pomodoro)',
    desc: 'Built-in Pomodoro timer to help you maintain deep focus. Track sessions and earn XP for consistent studying.',
    details: [
      'Customizable work/break intervals',
      'Session tracking with XP rewards',
      'Focus streak counter',
      'Ambient timer with minimal UI',
    ],
    screenshot: null,
  },
  {
    id: 'achievements',
    icon: Trophy,
    title: 'Achievements & Gamification',
    desc: 'Stay motivated with achievement badges, daily streaks, and milestone tracking. Earn XP for every study action.',
    details: [
      'Achievement badges for milestones',
      'Daily study streak tracking',
      'XP system across all activities',
      'Level progression system',
    ],
    screenshot: null,
  },
  {
    id: 'mock',
    icon: Brain,
    title: 'Mock Test Tracking',
    desc: 'Log mock test scores with detailed breakdowns. Track your performance trends and see how your rank prediction changes over time.',
    details: [
      'Log scores with subject-wise breakdown',
      'Positive & negative marking calculation',
      'Mock score trends over time',
      'Auto rank prediction from mock scores',
    ],
    screenshot: null,
  },
  {
    id: 'pyq',
    icon: ListChecks,
    title: 'PYQ Tracker',
    desc: 'Track Previous Year Questions completion across subjects. Monitor accuracy trends and identify weak areas.',
    details: [
      'Subject-wise PYQ completion tracking',
      'Accuracy percentage per subject',
      'PYQ accuracy trend charts',
      'Remaining questions counter',
    ],
    screenshot: null,
  },
  {
    id: 'notifications',
    icon: Bell,
    title: 'Smart Reminders',
    desc: 'Get notified about pending revisions, daily goals, and upcoming mock tests. Never miss a study session.',
    details: [
      'Revision due reminders',
      'Daily study goal notifications',
      'Mock test schedule alerts',
      'Customizable notification preferences',
    ],
    screenshot: null,
  },
  {
    id: 'offline',
    icon: Zap,
    title: '100% Offline & Private',
    desc: 'Everything runs locally in your browser. No account needed, no data sent to servers. Your study data stays on your device.',
    details: [
      'No internet required after first load',
      'All data stored in browser localStorage',
      'No sign-up or login needed',
      'Export/import your data anytime',
    ],
    screenshot: null,
  },
];

const HowToUse = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
          <div className="max-w-3xl mx-auto flex items-center gap-3 px-4 py-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/welcome')} className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold text-base">How to Use Plan OS</h1>
              <p className="text-xs text-muted-foreground">Complete feature guide</p>
            </div>
          </div>
        </div>

        {/* Feature sections */}
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
          {features.map((feature, i) => (
            <FadeIn key={feature.id} delay={i * 0.04}>
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                {/* Screenshot */}
                {feature.screenshot && (
                  <div className="border-b border-border bg-muted/30 p-4 flex justify-center">
                    <div className="w-full max-w-[220px] rounded-xl overflow-hidden shadow-card border border-border/50">
                      <img src={feature.screenshot} alt={feature.title} className="w-full" loading="lazy" />
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                      <feature.icon className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <h2 className="font-bold text-base">{feature.title}</h2>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{feature.desc}</p>

                  <ul className="space-y-1.5">
                    {feature.details.map((detail, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        <span className="text-foreground/80">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </FadeIn>
          ))}

          {/* CTA */}
          <FadeIn>
            <div className="text-center py-6">
              <Button onClick={() => navigate('/login')} className="gradient-primary text-primary-foreground font-semibold gap-2 h-11 px-6">
                Start Using Plan OS <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  );
};

export default HowToUse;
