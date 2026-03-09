import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  BookOpen, ArrowRight, BarChart3, Target, Zap, Shield, Clock,
  ChevronDown, Sparkles, Layout, RotateCcw, Trophy, HelpCircle,
  Brain, Bell, ListChecks, CheckCircle2, Star, TrendingUp,
  Calendar, Flame, Award, Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/PageTransition';
import realDashboard from '@/assets/real-dashboard.jpg';
import realSubjects from '@/assets/real-subjects.jpg';
import realTopics from '@/assets/real-topics.jpg';
import realRevision from '@/assets/real-revision.jpg';
import realInsights from '@/assets/real-insights.jpg';
import realFocus from '@/assets/real-focus.jpg';

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

const featuresWithScreenshots = [
  {
    icon: Layout,
    title: 'Kanban Task Board',
    desc: 'Visual drag-and-drop board with Today, This Week & Backlog columns. Quick-add tasks, track daily completion.',
    highlights: ['3 smart columns', 'Priority tagging', 'Daily counters'],
    img: realDashboard,
  },
  {
    icon: BookOpen,
    title: '19 Subjects, 1256+ Topics',
    desc: 'Complete NEET PG syllabus with chapter-level breakdown. 5-star confidence rating per topic.',
    highlights: ['Chapter tracking', '5★ confidence', 'Progress bars'],
    img: realSubjects,
  },
  {
    icon: RotateCcw,
    title: 'Spaced Repetition',
    desc: 'Auto-scheduled revisions based on confidence level. Calendar view, heatmap, and overdue alerts.',
    highlights: ['Auto-scheduling', 'Revision heatmap', 'Smart reminders'],
    img: realRevision,
  },
  {
    icon: BarChart3,
    title: 'Analytics & Rank Prediction',
    desc: 'Study patterns, MCQ trends, per-subject hours, readiness score, and NEET PG rank predictor.',
    highlights: ['Weekly charts', 'Rank predictor', 'Readiness score'],
    img: realInsights,
  },
  {
    icon: Target,
    title: 'Focus Mode',
    desc: 'Built-in Pomodoro timer with customizable intervals. Earn XP and track focus streaks.',
    highlights: ['Pomodoro timer', 'XP rewards', 'Focus streaks'],
    img: realFocus,
  },
  {
    icon: ListChecks,
    title: 'Topic-Level Tracking',
    desc: 'Mark stages per topic — Main, RR, BTR, Extra, MCQ, PYQ. Quick-mark entire chapters at once.',
    highlights: ['Stage tracking', 'Quick mark all', 'Confidence stars'],
    img: realTopics,
  },
];

const extraFeatures = [
  {
    icon: Trophy,
    title: 'Achievements & XP',
    desc: 'Gamified study experience with badges, streaks, levels, and milestone tracking.',
    highlights: ['Badge system', 'Daily streaks', 'Level progression'],
  },
  {
    icon: Brain,
    title: 'Mock Test Tracking',
    desc: 'Log scores with subject breakdowns. Track performance trends and auto-predict rank.',
    highlights: ['Score logging', 'Trend analysis', 'Auto rank predict'],
  },
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
              <Button variant="ghost" size="sm" onClick={() => navigate('/how-to-use')} className="gap-1 text-muted-foreground">
                <HelpCircle className="w-3.5 h-3.5" /> <span className="hidden sm:inline">How to Use</span>
              </Button>
              <Button onClick={handleCTA} size="sm" className="gradient-primary text-primary-foreground gap-1">
                {isLoggedIn ? 'Dashboard' : 'Get Started'} <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </motion.nav>

        {/* Hero */}
        <section ref={heroRef} className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 px-4 min-h-[80vh] flex flex-col items-center justify-center">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
          </div>

          <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center max-w-xl mx-auto space-y-6">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, type: 'spring' }}
              className="rounded-2xl gradient-primary flex items-center justify-center mx-auto shadow-glow w-[72px] h-[72px] sm:w-[88px] sm:h-[88px]"
            >
              <BookOpen className="w-9 h-9 sm:w-11 sm:h-11 text-primary-foreground" />
            </motion.div>

            <div className="space-y-3">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1]"
              >
                Your NEET PG
                <span className="block text-gradient-primary">Study OS</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed"
              >
                The all-in-one study planner built specifically for NEET PG aspirants. Task boards, spaced repetition, analytics, rank prediction — all offline.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 justify-center pt-2"
            >
              <Button onClick={handleCTA} size="lg" className="gradient-primary text-primary-foreground font-semibold gap-2 px-8 h-12 text-base">
                Start Studying <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="h-12 gap-2">
                See Features <ChevronDown className="w-4 h-4" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2"
            >
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> No sign up</span>
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> 100% free</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Works offline</span>
            </motion.div>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="py-10 sm:py-12 border-y border-border bg-card/50">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-4">
            {[
              { value: '19', label: 'Subjects', icon: BookOpen },
              { value: '1256+', label: 'Topics', icon: ListChecks },
              { value: '5★', label: 'Confidence Levels', icon: Star },
              { value: '100%', label: 'Offline Ready', icon: Monitor },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.08} className="text-center">
                <stat.icon className="w-5 h-5 text-primary mx-auto mb-1.5" />
                <p className="text-2xl sm:text-3xl font-bold text-gradient-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Features with Screenshots */}
        <section id="features" className="py-16 sm:py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <FadeIn className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Everything You Need to Crack NEET PG</h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">Every feature purpose-built for medical PG aspirants. No fluff, only what matters.</p>
            </FadeIn>

            <div className="space-y-16 sm:space-y-24">
              {featuresWithScreenshots.map((f, i) => {
                const isEven = i % 2 === 0;
                return (
                  <FadeIn key={f.title} delay={0.1}>
                    <div className={`flex flex-col ${isEven ? 'sm:flex-row' : 'sm:flex-row-reverse'} items-center gap-8 sm:gap-12`}>
                      {/* Screenshot */}
                      <div className="w-full sm:w-2/5 shrink-0">
                        <div className="rounded-2xl overflow-hidden shadow-card border-2 border-border/50 hover:shadow-card-hover hover:border-primary/20 transition-all max-w-[280px] mx-auto">
                          <img src={f.img} alt={`Plan OS ${f.title}`} className="w-full" loading="lazy" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 text-center sm:text-left">
                        <div className="flex items-center gap-3 justify-center sm:justify-start mb-3">
                          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-glow">
                            <f.icon className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <h3 className="font-bold text-lg sm:text-xl">{f.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{f.desc}</p>
                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                          {f.highlights.map((h) => (
                            <span key={h} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-primary/8 text-primary font-medium">
                              <CheckCircle2 className="w-3 h-3" /> {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </FadeIn>
                );
              })}
            </div>

            {/* Extra features without screenshots */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-16">
              {extraFeatures.map((f, i) => (
                <FadeIn key={f.title} delay={i * 0.06}>
                  <div className="bg-card rounded-xl border border-border p-5 sm:p-6 hover:border-primary/20 hover:shadow-card-hover transition-all h-full group">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0 group-hover:shadow-glow transition-shadow">
                        <f.icon className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-base mb-1">{f.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3">{f.desc}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {f.highlights.map((h) => (
                            <span key={h} className="inline-flex items-center gap-1 text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-primary/8 text-primary font-medium">
                              <CheckCircle2 className="w-2.5 h-2.5" /> {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>

            <FadeIn className="text-center mt-8">
              <Button variant="outline" onClick={() => navigate('/how-to-use')} className="gap-2">
                <HelpCircle className="w-4 h-4" /> Read Full Feature Guide
              </Button>
            </FadeIn>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 sm:py-24 px-4 bg-card/30 border-y border-border/50">
          <div className="max-w-lg mx-auto">
            <FadeIn className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Get Started in 2 Minutes</h2>
              <p className="text-sm text-muted-foreground">No account, no email, no hassle.</p>
            </FadeIn>
            <div className="space-y-6">
              {[
                { step: '1', title: 'Enter Your Name', desc: 'No email, no password needed. Just your name and you\'re in.', icon: Sparkles },
                { step: '2', title: 'Set Your Goals', desc: 'Choose your exam, target score, daily study hours, and content preferences.', icon: Target },
                { step: '3', title: 'Start Studying', desc: 'Create tasks, track topics, log sessions, and watch your readiness score climb.', icon: TrendingUp },
              ].map((s, i) => (
                <FadeIn key={s.step} delay={i * 0.12}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0 shadow-glow">
                      {s.step}
                    </div>
                    <div className="pt-1">
                      <h4 className="font-semibold text-sm mb-0.5">{s.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Why Plan OS */}
        <section className="py-16 sm:py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <FadeIn className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Why Plan OS?</h2>
            </FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Shield, title: 'Privacy First', desc: 'All data stays on your device. No servers, no tracking, no accounts.' },
                { icon: Flame, title: 'Stay Consistent', desc: 'Streaks, XP, achievements, and smart reminders keep you motivated daily.' },
                { icon: Award, title: 'Exam-Ready', desc: 'Readiness score and rank prediction tell you exactly where you stand.' },
              ].map((item, i) => (
                <FadeIn key={item.title} delay={i * 0.1}>
                  <div className="text-center p-5 sm:p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20 px-4">
          <FadeIn>
            <div className="max-w-sm mx-auto text-center bg-card rounded-2xl p-8 border border-border shadow-card">
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
                <Sparkles className="w-7 h-7 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold mb-1.5">Ready to Crack NEET PG?</h2>
              <p className="text-sm text-muted-foreground mb-5">Start your structured preparation today.</p>
              <Button onClick={handleCTA} size="lg" className="gradient-primary text-primary-foreground font-semibold gap-2 px-6 h-12 text-base w-full">
                {isLoggedIn ? 'Go to Dashboard' : 'Start Free — No Sign Up'} <ArrowRight className="w-4 h-4" />
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
