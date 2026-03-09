import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ArrowLeft, Layout, BookOpen, RotateCcw, BarChart3, Target, Trophy,
  Brain, Clock, Bell, CheckCircle2, Zap, ListChecks, ChevronRight,
  ChevronDown, ChevronUp, Star, Flame, Settings, User, Calendar,
  TrendingUp, Shield, Monitor, Award, FileText, AlertTriangle,
  HelpCircle, Smartphone, Timer, Hash, Layers, ArrowUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/PageTransition';

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

interface ManualSection {
  id: string;
  icon: any;
  title: string;
  overview: string;
  subsections: {
    title: string;
    content: string;
    steps?: string[];
    tips?: string[];
  }[];
}

const manualSections: ManualSection[] = [
  {
    id: 'getting-started',
    icon: Zap,
    title: 'Getting Started',
    overview: 'Plan OS requires no account creation, no email, and no password. Everything runs locally in your browser and works completely offline after the first load.',
    subsections: [
      {
        title: 'First Launch',
        content: 'When you open Plan OS for the first time, you\'ll see the landing page. Click "Get Started" to begin.',
        steps: [
          'Click "Get Started" on the landing page',
          'Enter your name — this is used only for personalization',
          'Complete the onboarding wizard (7 quick steps)',
          'You\'ll land on your personalized dashboard'
        ],
      },
      {
        title: 'Onboarding Wizard',
        content: 'The onboarding wizard helps configure your study plan. It collects:',
        steps: [
          'Step 1: Your name (auto-filled if entered on login)',
          'Step 2: Exam details — choose NEET PG, INICET, or FMGE, set exam date, target score and target rank (auto-synced)',
          'Step 3: Content base — select which video sources you use (Main Videos, Rapid Revision, BTR)',
          'Step 4: Study preferences — daily study hours (2-12h slider), mock tests per month, questions per topic with total calculation',
          'Step 5: Feature tour — swipeable cards showing Dashboard, Subjects, Revisions, Analytics',
          'Step 6: Create your first task — pre-filled "Study Anatomy - Upper Limb" with confetti celebration',
          'Step 7: Ready screen — summary of your setup with "Start My Preparation" button',
        ],
      },
      {
        title: 'Returning Users',
        content: 'If you\'ve already completed onboarding, entering your name on the login screen takes you directly to the dashboard. All your data is preserved in browser localStorage.',
        tips: [
          'Clear browser data will reset your progress',
          'Use the same browser to maintain your data',
          'Private/incognito mode won\'t save your data',
        ],
      },
    ],
  },
  {
    id: 'dashboard',
    icon: Layout,
    title: 'Dashboard & Task Board',
    overview: 'The Dashboard is your home screen. It shows your stats at a glance and houses the Kanban task board for daily study planning.',
    subsections: [
      {
        title: 'Stats Bar',
        content: 'At the top of the dashboard, you\'ll see key metrics:',
        steps: [
          'Days Left — countdown to your exam date',
          'Target Score — your goal score (e.g., 650+)',
          'Target Rank — your goal rank (e.g., #5,000)',
        ],
      },
      {
        title: 'Quick Stats Cards',
        content: 'Below the stats bar, four interactive cards show your current state. Tap any card to see detailed breakdowns:',
        steps: [
          'XP & Level — your experience points and current level (Medical Student → Resident → Specialist etc.)',
          'Streak — consecutive days studied, with your best streak record',
          'Today\'s Study — hours studied today vs your daily goal',
          'Accuracy — your overall MCQ accuracy vs target (default 75%)',
        ],
      },
      {
        title: 'MCQ Counter',
        content: 'Tracks MCQs solved Today, This Week, and Total. Quick visual of your question-solving pace.',
      },
      {
        title: 'Kanban Task Board',
        content: 'The heart of your daily planning. Tasks are organized in columns:',
        steps: [
          'Today — tasks you plan to do today',
          'This Week — tasks planned for this week',
          'Backlog — future tasks or ideas',
          'Done — completed tasks (auto-moved when marked complete)',
        ],
        tips: [
          'Tap the "+" button to create a new task',
          'Each task has a type (Study, Revision, MCQ, Mock, PYQ, Test)',
          'Set priority: High, Medium, or Low',
          'Set estimated duration in minutes',
          'Optionally link a task to a subject',
          'Tap "Start" on a task to enter Focus Mode with a timer',
          'Tap "Done" to mark a task complete and earn XP',
          'Tap "Edit" to switch to edit mode where you can change task columns',
        ],
      },
      {
        title: 'Exam Readiness Card',
        content: 'Shows your overall exam readiness as a percentage. The readiness score is calculated from multiple factors:',
        steps: [
          'Syllabus completion percentage',
          'Revision consistency and coverage',
          'Mock test performance trends',
          'MCQ accuracy trends',
          'Study hour consistency',
        ],
        tips: [
          'Tap the card to see a detailed breakdown of each factor',
          'The card shows a label: "Just Starting", "Building", "Good", "Strong", "Excellent"',
        ],
      },
    ],
  },
  {
    id: 'subjects',
    icon: BookOpen,
    title: 'Subjects & Topic Tracking',
    overview: 'Track all 19 NEET PG subjects across 4 categories (Pre-clinical, Para-clinical, Clinical, Short Subjects) with 1,256+ topics and chapter-level granularity.',
    subsections: [
      {
        title: 'Subject List',
        content: 'Subjects are organized by category with key info at a glance:',
        steps: [
          'Subject name with question weightage badge (e.g., "23Q" for Anatomy)',
          'Number of chapters and topics',
          'Overall completion percentage with progress bar',
          'Expected question range in the exam (e.g., "5-12")',
        ],
      },
      {
        title: 'PYQ Tracker Card',
        content: 'At the top of the Subjects tab, a summary card shows Previous Year Question completion across all configured exams (NEET PG, INICET, FMGE). Tap "Open" to access the full PYQ tracker.',
      },
      {
        title: 'Global Progress',
        content: 'Three progress metrics are shown at the top:',
        steps: [
          'Topics — X/1256 topics completed across all subjects',
          'MCQs — X/1256 MCQ completion (based on per-topic question targets)',
          'PYQs — X/total PYQ entries completed',
        ],
      },
      {
        title: 'Topic Search',
        content: 'Search across all 1,256+ topics from any subject. The search bar at the top lets you find any topic instantly.',
      },
      {
        title: 'Chapter & Topic Details',
        content: 'Tap a subject to expand it and see chapters. Tap a chapter to see individual topics. Each topic shows:',
        steps: [
          'Topic name',
          'Current status (Not Started → Main Videos → RR → BTR → MCQs → PYQ → Revision → Mastered)',
          'Confidence rating (1-5 stars) — tap stars to rate',
          'Content stage checkboxes — mark which stages you\'ve completed',
          'Questions solved vs target',
          'PYQ completion status',
          'Next revision date (auto-calculated based on confidence)',
          'Revision session number (which review cycle you\'re on)',
        ],
        tips: [
          'Changing confidence level automatically adjusts the spaced repetition schedule',
          'Higher confidence = longer intervals between revisions',
          'Confidence 1★: Reviews at 1, 3, 7, 14, 35, 56, 86, 146 days',
          'Confidence 5★: Reviews at 3, 17, 47, 107 days',
          'After all scheduled reviews, a maintenance review repeats every 90 days',
        ],
      },
      {
        title: 'Syllabus Progress Card',
        content: 'Shows an at-a-glance view of how much of the total syllabus you\'ve covered, broken down by content stages (Main Videos, RR, BTR, MCQs, PYQs).',
      },
    ],
  },
  {
    id: 'revision',
    icon: RotateCcw,
    title: 'Revision Hub & Spaced Repetition',
    overview: 'The Revision tab is your spaced repetition command center. It auto-schedules revisions based on your confidence level and tracks overdue, due today, and upcoming reviews.',
    subsections: [
      {
        title: 'Revision Summary Cards',
        content: 'Three cards at the top show:',
        steps: [
          'Overdue — topics past their scheduled revision date (shown in dark)',
          'Due Today — topics that need revision today (shown in red/urgent)',
          'This Week — topics scheduled for revision this week (shown in amber)',
        ],
      },
      {
        title: 'Revision List View',
        content: 'A filterable, searchable list of all topics with scheduled revisions:',
        steps: [
          'Filter by: All, Overdue, Today, This Week',
          'Search by topic or chapter name',
          'Filter by specific subject using the dropdown',
          'Each entry shows: topic name, subject, chapter, due date, session name (e.g., "2nd Review")',
        ],
      },
      {
        title: 'Calendar View',
        content: 'Toggle to calendar view to see revision dates on a monthly calendar. Color-coded dots indicate the number of revisions scheduled for each day.',
      },
      {
        title: 'Revision Heatmap',
        content: 'A GitHub-style contribution heatmap shows your revision activity over time. Darker colors = more revisions completed on that day.',
      },
      {
        title: 'How Spaced Repetition Works',
        content: 'When you study a topic and set its confidence level, the system automatically schedules future revision dates. The schedule varies by confidence:',
        steps: [
          '★ (Low confidence): 8 review sessions over ~146 days',
          '★★: 7 sessions over ~136 days',
          '★★★ (Medium): 6 sessions over ~115 days',
          '★★★★: 5 sessions over ~113 days',
          '★★★★★ (High): 4 sessions over ~107 days',
          'After final review: Maintenance review every 90 days (perpetual)',
        ],
        tips: [
          'The algorithm is based on proven spaced repetition research',
          'You can customize intervals in Profile → Settings',
          'Revision reminders appear as notifications',
          'Overdue revisions are highlighted and prioritized',
        ],
      },
    ],
  },
  {
    id: 'analytics',
    icon: BarChart3,
    title: 'Analytics & Insights',
    overview: 'The Insights tab provides comprehensive analytics about your study patterns, performance trends, and exam readiness. It\'s divided into four sub-tabs.',
    subsections: [
      {
        title: 'Overview Tab',
        content: 'Shows high-level metrics and charts:',
        steps: [
          'Exam Readiness Score — percentage score with status label',
          'Rank Predictor — enter marks or use latest mock score to predict NEET PG rank',
          'Weekly Study Chart — bar chart showing hours studied each day of the week',
          'Total Hours, Average/Day, and MCQs solved summary',
        ],
      },
      {
        title: 'Content Tab',
        content: 'Per-subject study hours breakdown:',
        steps: [
          'Ranked list of subjects by total study hours',
          'Progress bar showing relative time spent',
          'Helps identify subjects you\'re neglecting',
        ],
      },
      {
        title: 'Patterns Tab',
        content: 'Study behavior analysis:',
        steps: [
          'Study time distribution across days of the week',
          'Peak study hours identification',
          'Session duration patterns',
          'Consistency metrics',
        ],
      },
      {
        title: 'PYQ Tab',
        content: 'Previous Year Questions analytics:',
        steps: [
          'Subject-wise PYQ accuracy charts',
          'PYQ completion trends over time',
          'Weak subjects identification based on PYQ performance',
        ],
      },
      {
        title: 'NEET PG Rank Predictor',
        content: 'The rank predictor uses real NEET PG marks vs rank data to estimate your potential rank. It uses linear interpolation within mark ranges for accurate predictions.',
        steps: [
          'Enter your expected marks (out of 800) manually',
          'Or let it auto-fill from your latest mock test score',
          'See predicted rank range (e.g., Rank 1,000 – 1,500)',
          'See career impact and available specialties for that rank bracket',
          'Rank brackets: Top 1000, 1K-5K, 5K-10K, 10K-20K, 20K-50K, 50K+',
        ],
        tips: [
          'Marks 675-800: Top 1000 (Radiology, Derm, Gen Med at AIIMS)',
          'Marks 620-670: Rank 1K-5K (Clinical branches at good colleges)',
          'Marks 570-620: Rank 5K-10K (Clinical at peripheral/DNB)',
          'Marks 500-570: Rank 10K-20K (Para-clinical, DNB preferred)',
          'Marks 400-500: Rank 20K-50K (Management quota, non-clinical)',
          'Below 400: Rank 50K+ (DNB-FNB, alternative exams)',
        ],
      },
    ],
  },
  {
    id: 'focus',
    icon: Target,
    title: 'Focus Mode (Pomodoro Timer)',
    overview: 'Focus Mode is a built-in Pomodoro timer designed to help you maintain deep concentration during study sessions. Earn XP for every completed session.',
    subsections: [
      {
        title: 'How to Enter Focus Mode',
        content: 'There are two ways to start Focus Mode:',
        steps: [
          'Tap "Start" on any task in the Kanban board — timer starts for that specific task',
          'The timer runs with your configured Pomodoro settings',
        ],
      },
      {
        title: 'Timer Settings',
        content: 'Customizable in Profile → Settings:',
        steps: [
          'Study duration — default 25 minutes (adjustable)',
          'Short break — default 5 minutes',
          'Long break — default 15 minutes',
          'Sessions before long break — default 4',
        ],
      },
      {
        title: 'XP & Rewards',
        content: 'You earn XP for completing focus sessions:',
        steps: [
          'XP accumulates and determines your level',
          'Levels progress from "Medical Student" through various stages',
          'XP also counts toward achievement badges',
        ],
      },
    ],
  },
  {
    id: 'mock-tests',
    icon: Brain,
    title: 'Mock Test Tracking',
    overview: 'Log your mock test scores with detailed subject-wise breakdowns. Track performance trends and see how your rank prediction changes over time.',
    subsections: [
      {
        title: 'Logging a Mock Test',
        content: 'Tap the "+" button on the dashboard and select "Mock Test":',
        steps: [
          'Enter test name and source (e.g., "Marrow GT 5")',
          'Enter total questions, attempted, and correct answers',
          'Score is auto-calculated using marking scheme (default: +4/-1)',
          'Add optional subject-wise breakdown',
          'Enter time taken',
          'Add notes about the test',
        ],
      },
      {
        title: 'Marking Scheme',
        content: 'The default marking scheme is:',
        steps: [
          '+4 marks for correct answer',
          '-1 mark for incorrect answer',
          '0 marks for unanswered',
          'Total marks: 800',
          'You can customize this in Profile → Settings',
        ],
      },
      {
        title: 'Mock Analytics',
        content: 'After logging mocks, you\'ll see:',
        steps: [
          'Score trend chart showing improvement over time',
          'Auto-calculated rank prediction from your latest mock score',
          'Subject-wise weak areas identification',
          'Average accuracy across all mocks',
        ],
      },
    ],
  },
  {
    id: 'pyq',
    icon: ListChecks,
    title: 'Previous Year Questions (PYQ) Tracker',
    overview: 'Track your PYQ solving across multiple exam types (NEET PG, INICET, FMGE). Monitor subject-wise accuracy and identify weak areas.',
    subsections: [
      {
        title: 'PYQ Configuration',
        content: 'Configure your PYQ tracking:',
        steps: [
          'Year range — e.g., 2016-2025 (configurable)',
          'Exam types — NEET PG, INICET, FMGE',
          'Questions per year per exam — auto-calculated based on exam data',
        ],
      },
      {
        title: 'Logging PYQs',
        content: 'For each subject, log:',
        steps: [
          'Number of questions attempted from each year',
          'Number of correct answers',
          'Accuracy is auto-calculated',
          'Track completion percentage per subject per exam',
        ],
      },
      {
        title: 'PYQ Analytics',
        content: 'The PYQ tab in Analytics shows:',
        steps: [
          'Subject-wise accuracy bar chart',
          'Overall PYQ completion percentage',
          'Subjects with lowest accuracy highlighted as weak areas',
        ],
      },
    ],
  },
  {
    id: 'achievements',
    icon: Trophy,
    title: 'Achievements & Gamification',
    overview: 'Plan OS gamifies your preparation with XP, levels, streaks, and achievement badges to keep you motivated throughout your journey.',
    subsections: [
      {
        title: 'XP System',
        content: 'Earn XP for study activities:',
        steps: [
          'Complete a task — earn XP based on duration and type',
          'Complete a focus session — earn XP',
          'Log a study session — earn XP',
          'Complete a mock test — earn XP',
          'XP accumulates to determine your level',
        ],
      },
      {
        title: 'Levels',
        content: 'Progress through levels as you accumulate XP. Each level has a title reflecting your progression from a beginner to an expert.',
      },
      {
        title: 'Streaks',
        content: 'Maintain daily study streaks:',
        steps: [
          'Study at least once per day to maintain your streak',
          'Current streak and best streak are tracked',
          'Streak badges are awarded at milestones (7 days, 30 days, 100 days, etc.)',
        ],
      },
      {
        title: 'Achievement Badges',
        content: 'Earn badges for reaching milestones:',
        steps: [
          'Topic completion milestones (10, 50, 100, 500 topics)',
          'Study hour milestones (10h, 50h, 100h, 500h)',
          'Streak milestones (7d, 30d, 100d)',
          'Mock test milestones',
          'Subject completion badges',
          'Each badge has a progress bar showing how close you are',
        ],
      },
    ],
  },
  {
    id: 'notifications',
    icon: Bell,
    title: 'Notifications & Reminders',
    overview: 'Smart notification system that reminds you about revisions, daily goals, and study consistency.',
    subsections: [
      {
        title: 'Revision Reminders',
        content: 'Automatic reminders for scheduled revisions:',
        steps: [
          'Topics due today are highlighted',
          'Overdue topics trigger alert notifications',
          'Tomorrow\'s upcoming revisions are shown as previews',
          'Notification bell in the header shows unread count',
        ],
      },
      {
        title: 'Notification History',
        content: 'Access /notifications to see all past notifications. The notification panel in the header shows recent alerts.',
      },
      {
        title: 'Push Notifications',
        content: 'Enable browser push notifications in Profile → Settings to get reminders even when the app isn\'t open (requires browser permission).',
      },
    ],
  },
  {
    id: 'profile',
    icon: User,
    title: 'Profile & Settings',
    overview: 'The Profile tab lets you customize every aspect of Plan OS to match your study style.',
    subsections: [
      {
        title: 'Profile Information',
        content: 'View and edit:',
        steps: [
          'Your name',
          'Exam name and date',
          'Target score and target rank',
        ],
      },
      {
        title: 'Pomodoro Settings',
        content: 'Customize your focus timer:',
        steps: [
          'Study duration (default 25 min)',
          'Short break (default 5 min)',
          'Long break (default 15 min)',
          'Sessions before long break (default 4)',
        ],
      },
      {
        title: 'Spaced Repetition Settings',
        content: 'Customize revision intervals for each confidence level (1-5 stars). Each level has a different number of review sessions with configurable day intervals.',
      },
      {
        title: 'Content Types',
        content: 'Toggle which content stages appear in topic tracking:',
        steps: [
          'Main Video — toggle on/off',
          'RR Video — toggle on/off',
          'BTR Video — toggle on/off',
          'Extra Video — toggle on/off',
          'MCQs — always enabled (compulsory)',
          'PYQs — always enabled (compulsory)',
        ],
      },
      {
        title: 'Marking Scheme',
        content: 'Set the marking scheme used for mock test score calculations:',
        steps: [
          'Correct answer marks (default +4)',
          'Incorrect answer marks (default -1)',
          'Unanswered marks (default 0)',
          'Total marks (default 800)',
        ],
      },
      {
        title: 'Theme',
        content: 'Toggle between light and dark mode. The app defaults to dark mode.',
      },
    ],
  },
  {
    id: 'navigation',
    icon: Smartphone,
    title: 'Navigation & Layout',
    overview: 'Plan OS uses a mobile-first design with a bottom navigation bar for quick access to all sections.',
    subsections: [
      {
        title: 'Bottom Navigation',
        content: 'Five tabs at the bottom:',
        steps: [
          'Today — Dashboard with Kanban board and stats',
          'Subjects — Subject tracking with topics',
          'Revision — Spaced repetition hub',
          'Insights — Analytics and rank prediction',
          'Profile — Settings and customization',
        ],
      },
      {
        title: 'Header Actions',
        content: 'Top-right corner of the dashboard:',
        steps: [
          'Notification bell — shows unread count, tap to open panel',
          '"+" button — quick-add tasks, log study sessions, or log mock tests',
        ],
      },
      {
        title: 'Quick Log Modal',
        content: 'The "+" button opens a modal where you can:',
        steps: [
          'Create a new task (Study, Revision, MCQ, Mock, PYQ)',
          'Log a study session with subject, duration, and details',
          'Log a mock test with full score breakdown',
        ],
      },
    ],
  },
  {
    id: 'data-privacy',
    icon: Shield,
    title: 'Data & Privacy',
    overview: 'Plan OS is designed with privacy as a core principle. Your data never leaves your device.',
    subsections: [
      {
        title: 'Local Storage',
        content: 'All data is stored in your browser\'s localStorage:',
        steps: [
          'No server, no database, no cloud sync',
          'Data persists across browser sessions',
          'Clearing browser data will erase all progress',
          'Data is specific to each browser — different browsers have different data',
        ],
        tips: [
          'Bookmark the app for easy access',
          'Don\'t clear browser data unless you want to reset',
          'Using private/incognito mode means data is lost when you close the window',
        ],
      },
      {
        title: 'Offline Support',
        content: 'After the first load, Plan OS works completely offline. No internet connection is required for any feature.',
      },
    ],
  },
];

const CollapsibleSection = ({ section }: { section: ManualSection }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-4 sm:p-5 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0">
          <section.icon className="w-4.5 h-4.5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-base">{section.title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{section.overview}</p>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {isOpen && (
        <div className="border-t border-border">
          <div className="p-4 sm:p-5 space-y-5">
            <p className="text-sm text-muted-foreground leading-relaxed">{section.overview}</p>

            {section.subsections.map((sub, i) => (
              <div key={i} className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {sub.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed pl-3.5">{sub.content}</p>

                {sub.steps && (
                  <ul className="space-y-1 pl-3.5">
                    {sub.steps.map((step, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                        <span className="text-foreground/80 leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {sub.tips && sub.tips.length > 0 && (
                  <div className="bg-primary/5 rounded-lg p-3 ml-3.5">
                    <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1.5">💡 Tips</p>
                    <ul className="space-y-1">
                      {sub.tips.map((tip, j) => (
                        <li key={j} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <span>•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

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
            <div className="flex-1">
              <h1 className="font-bold text-base">Plan OS — User Manual</h1>
              <p className="text-xs text-muted-foreground">Complete guide to every feature</p>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="max-w-3xl mx-auto px-4 pt-6 pb-4">
          <FadeIn>
            <div className="bg-card rounded-xl border border-border p-4 sm:p-5">
              <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Table of Contents
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {manualSections.map((section, i) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors py-1 px-2 rounded-md hover:bg-muted/50"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    <span className="text-[10px] font-mono text-primary/60 w-5">{String(i + 1).padStart(2, '0')}</span>
                    <section.icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{section.title}</span>
                  </a>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Manual Sections */}
        <div className="max-w-3xl mx-auto px-4 pb-8 space-y-4">
          {manualSections.map((section, i) => (
            <FadeIn key={section.id} delay={i * 0.03}>
              <div id={section.id} className="scroll-mt-16">
                <CollapsibleSection section={section} />
              </div>
            </FadeIn>
          ))}

          {/* CTA */}
          <FadeIn>
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">Ready to start your preparation?</p>
              <Button onClick={() => navigate('/login')} className="gradient-primary text-primary-foreground font-semibold gap-2 h-11 px-8">
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
