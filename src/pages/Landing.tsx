import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  BookOpen, ArrowRight, CheckCircle2, BarChart3,
  Brain, Target, Zap, Shield, Clock,
  ChevronDown, Sparkles, Layout, RotateCcw, Trophy, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/PageTransition';
import screenshotDashboard from '@/assets/screenshot-dashboard.jpg';
import screenshotAnalytics from '@/assets/screenshot-analytics.jpg';
import screenshotSubjects from '@/assets/screenshot-subjects.jpg';
import screenshotRevision from '@/assets/screenshot-revision.jpg';

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

const features = [
  { icon: Layout, title: 'Kanban Task Board', desc: 'Visual task management with Today, This Week, Backlog columns.' },
  { icon: BookOpen, title: 'Subject Tracking', desc: '19 subjects, 1256+ topics with multi-stage progress tracking.' },
  { icon: RotateCcw, title: 'Spaced Repetition', desc: 'Auto-scheduled revisions based on your confidence level.' },
  { icon: BarChart3, title: 'Analytics', desc: 'Study patterns, MCQ trends, readiness score & rank prediction.' },
  { icon: Target, title: 'Focus Mode', desc: 'Pomodoro timer with session tracking and XP rewards.' },
  { icon: Trophy, title: 'Achievements', desc: 'Earn badges, maintain streaks, track milestones.' },
];

const screenshots = [
  { img: screenshotDashboard, title: 'Task Board', desc: 'Organize daily tasks with a visual Kanban board.' },
  { img: screenshotAnalytics, title: 'Analytics', desc: 'Track study patterns and predict your NEET PG rank.' },
  { img: screenshotSubjects, title: 'Subjects', desc: '19 subjects with chapter and topic-level tracking.' },
  { img: screenshotRevision, title: 'Revisions', desc: 'Spaced repetition schedules based on confidence.' },
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
          <Button onClick={handleCTA} size="sm" className="gradient-primary text-primary-foreground gap-1">
            {isLoggedIn ? 'Dashboard' : 'Get Started'} <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </motion.nav>

      {/* Hero */}
      <section ref={heroRef} className="relative pt-20 pb-8 sm:pb-16 px-4 min-h-[85vh] sm:min-h-[90vh] flex flex-col items-center justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-primary/5 blur-[100px]" />
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
            All-in-one study planner with Kanban boards, spaced repetition,
            analytics, and rank prediction — 100% offline.
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

        {/* Hero screenshot */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="relative z-10 mt-8 sm:mt-12 w-full max-w-[260px] sm:max-w-xs mx-auto"
        >
          <div className="rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-2xl border-[3px] border-foreground/10">
            <img src={screenshotDashboard} alt="Plan OS Dashboard" className="w-full" loading="lazy" />
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-8 sm:py-12 border-y border-border bg-card/50">
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

      {/* Features */}
      <section id="features" className="py-14 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Everything You Need</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">Built for NEET PG aspirants. Every feature designed to maximize your preparation.</p>
          </FadeIn>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {features.map((f, i) => (
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

      {/* Screenshots */}
      <section className="py-14 sm:py-20 px-4 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">See It In Action</h2>
            <p className="text-sm text-muted-foreground">Real screenshots from the app</p>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {screenshots.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <div className="text-center">
                  <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-card border-2 border-foreground/5 mb-3">
                    <img src={item.img} alt={item.title} className="w-full" loading="lazy" />
                  </div>
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
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
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-5 h-5 rounded-md gradient-primary flex items-center justify-center">
            <BookOpen className="w-3 h-3 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">Plan OS</span>
        </div>
        <p className="text-[11px] text-muted-foreground">Your intelligent study operating system • 100% free & offline</p>
      </footer>
    </div>
    </PageTransition>
  );
};

export default Landing;
