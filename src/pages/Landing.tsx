import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { 
  BookOpen, ArrowRight, CheckCircle2, BarChart3, Calendar, 
  Brain, Target, Flame, Star, Zap, Shield, Clock,
  ChevronDown, Sparkles, Layout, RotateCcw, Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import screenshotDashboard from '@/assets/screenshot-dashboard.jpg';
import screenshotAnalytics from '@/assets/screenshot-analytics.jpg';
import screenshotSubjects from '@/assets/screenshot-subjects.jpg';
import screenshotRevision from '@/assets/screenshot-revision.jpg';

const FadeInSection = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const features = [
  { icon: Layout, title: 'Kanban Task Board', desc: 'Organize your study tasks visually with drag columns — Today, This Week, Backlog, Done.', color: 'text-blue-500' },
  { icon: BookOpen, title: 'Subject & Topic Tracking', desc: 'Track 19 subjects, chapters, and 1256+ topics with multi-stage progress per topic.', color: 'text-emerald-500' },
  { icon: RotateCcw, title: 'Spaced Repetition', desc: 'Auto-scheduled revisions based on your confidence. Never forget what you studied.', color: 'text-amber-500' },
  { icon: BarChart3, title: 'Advanced Analytics', desc: 'Weekly study charts, MCQ trends, readiness score, and NEET PG rank predictor.', color: 'text-purple-500' },
  { icon: Target, title: 'Focus Mode & Pomodoro', desc: 'Deep work timer with breaks, session tracking, and XP rewards for completion.', color: 'text-rose-500' },
  { icon: Trophy, title: 'Achievements & Streaks', desc: 'Earn badges, maintain revision streaks, and track milestones to stay motivated.', color: 'text-orange-500' },
];

const stats = [
  { value: '19', label: 'Subjects Covered' },
  { value: '1256+', label: 'Topics Tracked' },
  { value: '5★', label: 'Confidence Levels' },
  { value: '100%', label: 'Offline Ready' },
];

const Landing = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem('planos-user');
  const isLoggedIn = user ? JSON.parse(user)?.loggedIn : false;

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const handleCTA = () => navigate(isLoggedIn ? '/' : '/login');

  return (
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
      <section ref={heroRef} className="relative pt-24 pb-16 px-4 min-h-[90vh] flex flex-col items-center justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center max-w-2xl mx-auto space-y-6">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto shadow-glow"
          >
            <BookOpen className="w-10 h-10 text-primary-foreground" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight"
          >
            Your NEET PG
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Study OS
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-lg text-muted-foreground max-w-md mx-auto"
          >
            The all-in-one study planner with Kanban boards, spaced repetition, 
            analytics, and rank prediction — works 100% offline.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
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
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2"
          >
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> No account needed</span>
            <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> 100% free</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Works offline</span>
          </motion.div>
        </motion.div>

        {/* Hero phone mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="relative z-10 mt-12 w-full max-w-xs mx-auto"
        >
          <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-foreground/10">
            <img src={screenshotDashboard} alt="Plan OS Dashboard" className="w-full" />
          </div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 border-y border-border bg-card/50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-4">
          {stats.map((stat, i) => (
            <FadeInSection key={stat.label} delay={i * 0.1} className="text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeInSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Everything You Need to Crack NEET PG</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Built by aspirants, for aspirants. Every feature designed to maximize your preparation efficiency.</p>
          </FadeInSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <FadeInSection key={f.title} delay={i * 0.08}>
                <div className="bg-card rounded-xl border border-border p-5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 h-full">
                  <f.icon className={`w-8 h-8 ${f.color} mb-3`} />
                  <h3 className="font-semibold text-base mb-1.5">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots Showcase */}
      <section className="py-20 px-4 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <FadeInSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">See It In Action</h2>
            <p className="text-muted-foreground">A complete study ecosystem on your fingertips</p>
          </FadeInSection>

          {[
            { img: screenshotDashboard, title: 'Smart Task Board', desc: 'Organize daily tasks, track study sessions, and manage your entire preparation pipeline with a visual Kanban board.', flip: false },
            { img: screenshotAnalytics, title: 'Deep Analytics', desc: 'Track weekly study patterns, MCQ performance, readiness scores, and predict your NEET PG rank — all in one dashboard.', flip: true },
            { img: screenshotSubjects, title: 'Subject Mastery', desc: '19 subjects with chapters and topics. Track video lectures, MCQs, PYQs, and revisions with multi-stage completion.', flip: false },
            { img: screenshotRevision, title: 'Smart Revisions', desc: 'AI-powered spaced repetition schedules based on your confidence level. Never forget what you\'ve studied.', flip: true },
          ].map((item, i) => (
            <FadeInSection key={item.title} className="mb-20 last:mb-0">
              <div className={`flex flex-col ${item.flip ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 md:gap-16`}>
                <div className="w-full max-w-[220px] shrink-0">
                  <motion.div
                    whileInView={{ rotate: item.flip ? 3 : -3 }}
                    transition={{ duration: 0.6 }}
                    className="rounded-[2rem] overflow-hidden shadow-2xl border-4 border-foreground/10"
                  >
                    <img src={item.img} alt={item.title} className="w-full" />
                  </motion.div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-base leading-relaxed max-w-md">{item.desc}</p>
                  <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                    {['Offline Ready', 'Real-time Sync', 'Dark Mode'].map(tag => (
                      <span key={tag} className="text-[10px] font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <FadeInSection className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Get Started in Minutes</h2>
          </FadeInSection>

          <div className="space-y-6">
            {[
              { step: '1', title: 'Enter Your Name', desc: 'No email, no password — just your name to get started instantly.' },
              { step: '2', title: 'Set Your Exam & Goals', desc: 'Choose your exam, target score, study preferences in the guided onboarding.' },
              { step: '3', title: 'Start Studying', desc: 'Log sessions, track revisions, solve MCQs, and watch your readiness score climb.' },
            ].map((s, i) => (
              <FadeInSection key={s.step} delay={i * 0.15}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <h4 className="font-semibold text-base">{s.title}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">{s.desc}</p>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <FadeInSection>
          <div className="max-w-lg mx-auto text-center bg-card rounded-2xl p-8 border border-border shadow-lg">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Ready to Crack NEET PG?</h2>
            <p className="text-muted-foreground text-sm mb-6">Join thousands of aspirants using Plan OS to supercharge their preparation.</p>
            <Button onClick={handleCTA} size="lg" className="gradient-primary text-primary-foreground font-semibold gap-2 px-8 h-12 text-base w-full">
              {isLoggedIn ? 'Go to Dashboard' : 'Start Free — No Sign Up'} <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </FadeInSection>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md gradient-primary flex items-center justify-center">
            <BookOpen className="w-3 h-3 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">Plan OS</span>
        </div>
        <p className="text-xs text-muted-foreground">Your intelligent study operating system • 100% free & offline</p>
      </footer>
    </div>
  );
};

export default Landing;
