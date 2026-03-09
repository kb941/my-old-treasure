import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  BookOpen, ArrowRight, BarChart3, Target, Zap, Shield, Clock,
  ChevronDown, Sparkles, Layout, RotateCcw, Trophy, HelpCircle,
  Brain, Bell, ListChecks, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/PageTransition';
import screenshotDashboard from '@/assets/screenshot-dashboard.png';
import screenshotInsights from '@/assets/screenshot-insights.png';
import screenshotSubjects from '@/assets/screenshot-subjects.png';
import screenshotRevision from '@/assets/screenshot-revision.png';

const FadeIn = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const featureShowcases = [
  {
    title: 'Visual Task Board',
    subtitle: 'Organize every study session',
    desc: 'Drag-and-drop Kanban board with Today, This Week & Backlog columns. Quick-add tasks, track completion, and never lose sight of your daily goals.',
    bullets: ['Kanban columns for prioritization', 'Quick task creation with subjects', 'Daily progress tracking'],
    icon: Layout,
    screenshot: screenshotDashboard,
    reverse: false,
  },
  {
    title: '19 Subjects, 1256+ Topics',
    subtitle: 'Track every single topic',
    desc: 'Complete NEET PG syllabus with chapter-level breakdown. Rate your confidence on each topic, mark completion status, and see progress at a glance.',
    bullets: ['5-star confidence per topic', 'Chapter & topic-level progress', 'PYQ tracker integration'],
    icon: BookOpen,
    screenshot: screenshotSubjects,
    reverse: true,
  },
  {
    title: 'Smart Spaced Repetition',
    subtitle: 'Never forget what you studied',
    desc: 'Auto-scheduled revisions based on your confidence level. The app reminds you exactly when to revise — backed by proven memory science.',
    bullets: ['Auto-scheduled by confidence', 'Revision calendar & heatmap', 'Overdue alerts & reminders'],
    icon: RotateCcw,
    screenshot: screenshotRevision,
    reverse: false,
  },
  {
    title: 'Analytics & Rank Prediction',
    subtitle: 'Data-driven preparation',
    desc: 'Track study patterns, MCQ accuracy trends, per-subject hours, and get a readiness score. Predict your NEET PG rank based on real data.',
    bullets: ['Weekly study pattern charts', 'NEET PG rank predictor', 'Readiness score algorithm'],
    icon: BarChart3,
    screenshot: screenshotInsights,
    reverse: true,
  },
];

const moreFeatures = [
  { icon: Target, title: 'Focus Mode', desc: 'Pomodoro timer with XP rewards and session tracking.' },
  { icon: Trophy, title: 'Achievements', desc: 'Earn badges, maintain streaks, level up as you study.' },
  { icon: Brain, title: 'Mock Tests', desc: 'Log scores, track trends, auto-predict rank from mocks.' },
  { icon: ListChecks, title: 'PYQ Tracker', desc: 'Track previous year questions and accuracy per subject.' },
  { icon: Bell, title: 'Smart Reminders', desc: 'Revision alerts, daily goals, and mock test schedules.' },
  { icon: Zap, title: '100% Offline', desc: 'No internet needed. Your data stays private on your device.' },
];

const Landing = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem('planos-user');
  const isLoggedIn = user ? JSON.parse(user)?.loggedIn : false;

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const handleCTA = () => navigate(isLoggedIn ? '/' : '/login');

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        {/* Navbar */}
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Plan OS</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/how-to-use')} className="gap-1 text-muted-foreground hidden sm:inline-flex">
                <HelpCircle className="w-3.5 h-3.5" /> How to Use
              </Button>
              <Button onClick={handleCTA} size="sm" className="gradient-primary text-primary-foreground gap-1">
                {isLoggedIn ? 'Dashboard' : 'Get Started'} <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </motion.nav>

        {/* Hero */}
        <section ref={heroRef} className="relative pt-24 pb-12 sm:pt-28 sm:pb-20 px-4 min-h-[90vh] flex flex-col items-center justify-center">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
          </div>

          <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center max-w-xl mx-auto space-y-5">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, type: 'spring' }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto shadow-glow"
            >
              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight"
            >
              Your NEET PG
              <span className="block text-gradient-primary">Study OS</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto"
            >
              All-in-one study planner with task boards, spaced repetition, analytics, and rank prediction — 100% offline.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Button onClick={handleCTA} size="lg" className="gradient-primary text-primary-foreground font-semibold gap-2 px-6 h-11 text-base">
                Start Studying <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="h-11 gap-2">
                See Features <ChevronDown className="w-4 h-4" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-3 sm:gap-4 text-[11px] text-muted-foreground pt-1"
            >
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> No sign up</span>
              <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> 100% free</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Works offline</span>
            </motion.div>
          </motion.div>

          {/* Hero phone mockup */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="relative z-10 mt-10 sm:mt-14 w-full max-w-[240px] sm:max-w-[280px] mx-auto"
          >
            <div className="rounded-[2rem] overflow-hidden shadow-2xl border-[3px] border-foreground/10 bg-card">
              <img src={screenshotDashboard} alt="Plan OS Dashboard — Kanban task board with study tracking" className="w-full" />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-primary/10 blur-2xl rounded-full" />
          </motion.div>
        </section>

        {/* Stats strip */}
        <section className="py-8 sm:py-10 border-y border-border bg-card/50">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
            {[
              { value: '19', label: 'Subjects' },
              { value: '1256+', label: 'Topics' },
              { value: '5★', label: 'Confidence Levels' },
              { value: '100%', label: 'Offline Ready' },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.08} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-gradient-primary">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{stat.label}</p>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Feature Showcases with Screenshots */}
        <section id="features" className="py-14 sm:py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <FadeIn className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Built for NEET PG Aspirants</h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">Every feature designed to maximize your preparation efficiency.</p>
            </FadeIn>

            <div className="space-y-16 sm:space-y-24">
              {featureShowcases.map((f, i) => (
                <FadeIn key={f.title} delay={0.1}>
                  <div className={`flex flex-col ${f.reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 md:gap-12`}>
                    {/* Screenshot */}
                    <div className="w-full max-w-[220px] sm:max-w-[260px] md:w-2/5 shrink-0">
                      <div className="rounded-[1.5rem] overflow-hidden shadow-2xl border-2 border-foreground/5 bg-card">
                        <img src={f.screenshot} alt={f.title} className="w-full" loading="lazy" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-center md:text-left">
                      <div className="inline-flex items-center gap-2 mb-3">
                        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                          <f.icon className="w-4.5 h-4.5 text-primary-foreground" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{f.subtitle}</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-2">{f.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed max-w-md">{f.desc}</p>
                      <ul className="space-y-2">
                        {f.bullets.map((b) => (
                          <li key={b} className="flex items-center gap-2 text-sm justify-center md:justify-start">
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-foreground/80">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* More Features Grid */}
        <section className="py-14 sm:py-20 px-4 bg-card/30 border-y border-border/50">
          <div className="max-w-5xl mx-auto">
            <FadeIn className="text-center mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">And Much More</h2>
              <p className="text-sm text-muted-foreground">Packed with features to keep you on track.</p>
            </FadeIn>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {moreFeatures.map((f, i) => (
                <FadeIn key={f.title} delay={i * 0.06}>
                  <div className="bg-card rounded-xl border border-border p-4 hover:border-primary/20 transition-colors h-full">
                    <f.icon className="w-6 h-6 text-primary mb-2" />
                    <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-14 sm:py-20 px-4">
          <div className="max-w-md mx-auto">
            <FadeIn className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Get Started in Minutes</h2>
            </FadeIn>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Enter Your Name', desc: 'No email, no password — instant access.' },
                { step: '2', title: 'Set Your Goals', desc: 'Exam, target score, study preferences.' },
                { step: '3', title: 'Start Studying', desc: 'Log sessions, track revisions, watch your score climb.' },
              ].map((s, i) => (
                <FadeIn key={s.step} delay={i * 0.12}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
                      {s.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{s.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 sm:py-20 px-4">
          <FadeIn>
            <div className="max-w-sm mx-auto text-center bg-card rounded-xl p-6 border border-border shadow-card">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3 shadow-glow">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold mb-1">Ready to Crack NEET PG?</h2>
              <p className="text-xs text-muted-foreground mb-4">Join aspirants using Plan OS to supercharge their preparation.</p>
              <Button onClick={handleCTA} size="lg" className="gradient-primary text-primary-foreground font-semibold gap-2 px-6 h-11 text-base w-full">
                {isLoggedIn ? 'Go to Dashboard' : 'Start Free'} <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </FadeIn>
        </section>

        {/* Footer */}
        <footer className="py-6 border-t border-border text-center">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md gradient-primary flex items-center justify-center">
                <BookOpen className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sm">Plan OS</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <button onClick={() => navigate('/how-to-use')} className="text-xs text-muted-foreground hover:text-primary transition-colors">
              How to Use
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">Your intelligent study operating system • 100% free & offline</p>
        </footer>
      </div>
    </PageTransition>
  );
};

export default Landing;
