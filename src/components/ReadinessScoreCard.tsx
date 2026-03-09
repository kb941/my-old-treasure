import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, BookOpen, RotateCcw, FileQuestion, FileText, GraduationCap, Sparkles, AlertTriangle, Lightbulb, X, TrendingUp, TrendingDown, Minus, Rocket, Target, Zap, Brain, Clock, Award, CheckCircle2, Flame, Star, Calculator } from 'lucide-react';
import { ReadinessResult, getReadinessTrend, SubjectReadiness } from '@/hooks/useReadinessScore';

interface ReadinessScoreCardProps {
  result: ReadinessResult;
  compact?: boolean;
}

const getBaseItems = (breakdown: ReadinessResult['breakdown']) => [
  { icon: BookOpen, label: 'Syllabus Coverage', value: breakdown.base.syllabus, max: 35, color: 'text-blue-500' },
  { icon: RotateCcw, label: 'Revision Quality', value: breakdown.base.revision, max: 20, color: 'text-violet-500' },
  { icon: FileQuestion, label: 'MCQ Practice', value: breakdown.base.mcq, max: 20, color: 'text-amber-500' },
  { icon: FileText, label: 'PYQ Completion', value: breakdown.base.pyq, max: 15, color: 'text-emerald-500' },
  { icon: GraduationCap, label: 'Mock Performance', value: breakdown.base.mocks, max: 10, color: 'text-primary' },
];

// Minimalist phase configuration - solid colors, no heavy gradients
type Phase = {
  range: [number, number];
  name: string;
  emoji: string;
  color: string;        // primary solid color for accents
  bgClass: string;       // subtle background
  borderClass: string;   // border
  textClass: string;     // text color
  message: string;
  tips: { icon: typeof Rocket; text: string; color: string }[];
};

const phases: Phase[] = [
  {
    range: [0, 10],
    name: 'Just Starting',
    emoji: '🌱',
    color: 'hsl(160, 60%, 45%)',
    bgClass: 'bg-emerald-500/5',
    borderClass: 'border-emerald-500/20',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    message: 'Every expert was once a beginner. Show up daily — even 1 hour counts.',
    tips: [
      { icon: Clock, text: 'Start with just 2 focused hours/day — build the habit before increasing volume', color: 'text-emerald-500' },
      { icon: BookOpen, text: 'Begin with your highest-weightage subjects (Pathology, Pharmacology, Medicine) for maximum ROI', color: 'text-blue-500' },
      { icon: Target, text: 'Do 10-20 MCQs daily from what you studied that day — active recall beats re-reading 3x', color: 'text-amber-500' },
      { icon: Flame, text: 'Focus on a 7-day streak first — consistency beats intensity at this stage', color: 'text-orange-500' },
    ],
  },
  {
    range: [10, 25],
    name: 'Building Foundation',
    emoji: '🧱',
    color: 'hsl(220, 60%, 55%)',
    bgClass: 'bg-blue-500/5',
    borderClass: 'border-blue-500/20',
    textClass: 'text-blue-600 dark:text-blue-400',
    message: 'Great start! Build depth in high-weightage subjects while keeping momentum.',
    tips: [
      { icon: BookOpen, text: 'Prioritize high-weightage subjects — Pharma, Patho, PSM, Medicine, Surgery carry 40%+ marks', color: 'text-blue-500' },
      { icon: Brain, text: 'Start revising finished topics immediately — the forgetting curve is steepest in the first 48 hours', color: 'text-violet-500' },
      { icon: FileQuestion, text: 'Increase to 50+ MCQs/day — always analyze wrong answers and note the "why"', color: 'text-amber-500' },
      { icon: Target, text: 'Begin PYQ practice for completed subjects — understand recurring exam patterns early', color: 'text-emerald-500' },
    ],
  },
  {
    range: [25, 45],
    name: 'Gaining Momentum',
    emoji: '🚀',
    color: 'hsl(270, 55%, 55%)',
    bgClass: 'bg-violet-500/5',
    borderClass: 'border-violet-500/20',
    textClass: 'text-violet-600 dark:text-violet-400',
    message: 'You\'re past the toughest phase! Deepen understanding and identify weak spots.',
    tips: [
      { icon: RotateCcw, text: 'Dedicate 30% of study time to revision — it\'s more valuable than covering new topics now', color: 'text-violet-500' },
      { icon: FileQuestion, text: 'Push to 100+ MCQs/day — focus extra on your weakest 3 subjects', color: 'text-amber-500' },
      { icon: GraduationCap, text: 'Take your first full-length mock — treat it as diagnostic, not a test of your worth', color: 'text-primary' },
      { icon: FileText, text: 'Complete last 3 years PYQs for covered subjects — pattern recognition is a superpower', color: 'text-emerald-500' },
    ],
  },
  {
    range: [45, 65],
    name: 'Solidifying',
    emoji: '⚡',
    color: 'hsl(35, 85%, 50%)',
    bgClass: 'bg-amber-500/5',
    borderClass: 'border-amber-500/20',
    textClass: 'text-amber-600 dark:text-amber-400',
    message: 'You\'re in the zone! Sharpen weak areas and build exam stamina.',
    tips: [
      { icon: AlertTriangle, text: 'Identify your bottom 5 subjects by accuracy — give them 2x attention this week', color: 'text-destructive' },
      { icon: GraduationCap, text: 'Take weekly mocks and create an "error log" — categorize mistakes by type', color: 'text-primary' },
      { icon: FileText, text: 'Complete 5 years of PYQs — 20-30% of exam questions are direct or modified repeats', color: 'text-emerald-500' },
      { icon: Brain, text: 'Practice image-based & clinical scenario MCQs — their share is increasing every year', color: 'text-violet-500' },
    ],
  },
  {
    range: [65, 80],
    name: 'Strong Position',
    emoji: '🔥',
    color: 'hsl(15, 80%, 55%)',
    bgClass: 'bg-orange-500/5',
    borderClass: 'border-orange-500/20',
    textClass: 'text-orange-600 dark:text-orange-400',
    message: 'Excellent! You\'re well-prepared. Optimize for accuracy and exam-day performance.',
    tips: [
      { icon: Target, text: 'Shift focus from speed to accuracy — eliminating silly mistakes gains more marks than new topics', color: 'text-amber-500' },
      { icon: GraduationCap, text: 'Do full 3.5-hour mock simulations with no breaks — train your exam stamina', color: 'text-primary' },
      { icon: Star, text: 'Master high-yield one-liners: pharma tables, enzyme deficiencies, classic presentations', color: 'text-amber-500' },
      { icon: RotateCcw, text: 'Run rapid full-syllabus revision cycles — aim to cover everything every 2-3 weeks', color: 'text-violet-500' },
    ],
  },
  {
    range: [80, 101],
    name: 'Exam Ready',
    emoji: '👑',
    color: 'hsl(152, 60%, 42%)',
    bgClass: 'bg-emerald-500/5',
    borderClass: 'border-emerald-500/20',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    message: 'Outstanding preparation! Maintain your edge, stay sharp, trust the work you\'ve done.',
    tips: [
      { icon: CheckCircle2, text: 'Keep daily revision touch-points — even 30 min/subject prevents cold spots', color: 'text-emerald-500' },
      { icon: Award, text: 'Master question selection strategy — know when to attempt vs skip for maximum score', color: 'text-primary' },
      { icon: Brain, text: 'Perfect the elimination technique — you can gain 5-10% by converting educated guesses', color: 'text-violet-500' },
      { icon: Flame, text: 'Prioritize sleep & mental health — a fresh mind outperforms an exhausted one on exam day', color: 'text-orange-500' },
    ],
  },
];

function getPhase(score: number): Phase {
  return phases.find(p => score >= p.range[0] && score < p.range[1]) || phases[0];
}

function Sparkline({ data, color, width = 80, height = 24 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
      {data.length > 0 && (() => {
        const lastX = width;
        const lastY = height - ((data[data.length - 1] - min) / range) * (height - 4) - 2;
        return <circle cx={lastX} cy={lastY} r="2" fill={color} />;
      })()}
    </svg>
  );
}

function TrendBadge({ trend }: { trend: number[] }) {
  if (trend.length < 2) return null;
  const diff = trend[trend.length - 1] - trend[0];
  const icon = diff > 1 ? TrendingUp : diff < -1 ? TrendingDown : Minus;
  const Icon = icon;
  const colorCls = diff > 1 ? 'text-emerald-500' : diff < -1 ? 'text-destructive' : 'text-muted-foreground';
  const label = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
  return (
    <span className={`inline-flex items-center gap-0.5 text-[9px] font-medium ${colorCls}`}>
      <Icon className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}

function PhaseTipsCard({ score, color, label, result }: { score: number; color: string; label: string; result: ReadinessResult }) {
  const phase = getPhase(score);
  const [showBreakdown, setShowBreakdown] = useState(true);
  const items = getBaseItems(result.breakdown);

  return (
    <div className="space-y-4">
      {/* Phase header - minimalist */}
      <div className={`rounded-xl p-4 ${phase.bgClass} border ${phase.borderClass}`}>
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle cx="40" cy="40" r="34" stroke="hsl(var(--secondary))" strokeWidth="6" fill="none" />
              <motion.circle
                cx="40" cy="40" r="34"
                stroke={phase.color}
                strokeWidth="6" fill="none" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 34}
                initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - score / 100) }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold" style={{ color: phase.color }}>{Math.round(score)}%</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{phase.emoji}</span>
              <span className={`text-sm font-bold ${phase.textClass}`}>
                {phase.name}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{phase.message}</p>
          </div>
        </div>
      </div>

      {/* Phase progress indicator - 6 segments */}
      <div className="flex items-center gap-1">
        {phases.map((p, i) => {
          const isCurrent = p === phase;
          const isPast = score >= p.range[1];
          const isReached = isPast || isCurrent;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full h-2 rounded-full transition-all duration-500"
                style={{
                  backgroundColor: isReached ? p.color : 'hsl(var(--secondary))',
                  opacity: isPast ? 1 : isCurrent ? 0.85 : 1,
                }}
              />
              <span className={`text-[8px] font-medium transition-opacity ${isCurrent ? 'opacity-100' : 'opacity-0'}`}>
                {p.emoji}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tips for current phase */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
          🎯 Focus Areas for {phase.name}
        </p>
        {phase.tips.map((tip, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-start gap-2.5 p-2.5 bg-muted/30 rounded-lg"
          >
            <div className="w-7 h-7 rounded-lg bg-card flex items-center justify-center border border-border shrink-0 mt-0.5">
              <tip.icon className={`w-3.5 h-3.5 ${tip.color}`} />
            </div>
            <span className="text-xs font-medium leading-relaxed">{tip.text}</span>
          </motion.div>
        ))}
      </div>

      {/* Collapsible Score Breakdown */}
      <div className="border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-muted/20 hover:bg-muted/30 transition-colors"
        >
          <span className="text-xs font-semibold">📊 Score Breakdown</span>
          {showBreakdown ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>
        <AnimatePresence>
          {showBreakdown && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 py-3 space-y-2.5">
                {items.map(item => {
                  const pct = item.max > 0 ? Math.round((item.value / item.max) * 100) : 0;
                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-1.5">
                          <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <span className="text-muted-foreground">{item.value.toFixed(1)}/{item.max}</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className={`h-full rounded-full ${item.color.replace('text-', 'bg-')}`} />
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-between text-xs pt-2 border-t border-border">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold" style={{ color: phase.color }}>{Math.round(score)}%</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function ReadinessScoreCard({ result, compact = false }: ReadinessScoreCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const { score, breakdown, color, label, message } = result;
  const items = getBaseItems(breakdown);
  const phase = getPhase(score);

  const trendData = useMemo(() => getReadinessTrend().map(t => t.score), [score]);

  if (compact) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setShowDetail(true)}
          className={`rounded-xl p-3 border cursor-pointer transition-all active:scale-[0.98] bg-card ${phase.borderClass}`}
        >
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="hsl(var(--secondary))" strokeWidth="4" fill="none" />
                <motion.circle
                  cx="24" cy="24" r="20"
                  stroke={phase.color}
                  strokeWidth="4" fill="none" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 20}
                  initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - score / 100) }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] font-bold" style={{ color: phase.color }}>{Math.round(score)}%</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold">Exam Readiness</span>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${phase.bgClass} ${phase.textClass}`}>
                  {phase.name}
                </span>
                <TrendBadge trend={trendData} />
              </div>
              {/* 6-segment phase progress bar */}
              <div className="flex gap-0.5">
                {phases.map((p, i) => {
                  const isCurrent = p === phase;
                  const isPast = score >= p.range[1];
                  const isReached = isPast || isCurrent;
                  return (
                    <div
                      key={i}
                      className="flex-1 h-1.5 rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: isReached ? p.color : 'hsl(var(--secondary))',
                        opacity: isPast ? 1 : isCurrent ? 0.85 : 1,
                      }}
                      title={p.name}
                    />
                  );
                })}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[9px] text-muted-foreground">Tap for breakdown & tips</p>
              </div>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {showDetail && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowDetail(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute inset-x-3 top-6 bottom-20 md:bottom-6 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[520px] bg-card rounded-2xl border border-border shadow-lg overflow-y-auto"
              >
                <div className={`sticky top-0 z-10 border-b px-5 py-3 flex items-center justify-between rounded-t-2xl ${phase.bgClass} ${phase.borderClass}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{phase.emoji}</span>
                    <h2 className={`font-semibold text-base ${phase.textClass}`}>Exam Readiness</h2>
                  </div>
                  <button onClick={() => setShowDetail(false)} className="p-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5">
                  <PhaseTipsCard score={score} color={phase.color} label={label} result={result} />
                  <div className="mt-5 pt-5 border-t border-border">
                    <FullBreakdown result={result} trendData={trendData} phaseColor={phase.color} />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return <FullCard result={result} trendData={trendData} />;
}

function FullCard({ result, trendData }: { result: ReadinessResult; trendData: number[] }) {
  const [expanded, setExpanded] = useState(false);
  const { score, breakdown, color, label, message } = result;
  const items = getBaseItems(breakdown);
  const phase = getPhase(score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl shadow-card border overflow-hidden ${phase.bgClass} ${phase.borderClass}`}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span>{phase.emoji}</span>
            <h3 className="font-semibold text-base">Exam Readiness</h3>
            <TrendBadge trend={trendData} />
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${phase.bgClass} ${phase.textClass} border ${phase.borderClass}`}>
            {phase.name}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative flex-shrink-0">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="hsl(var(--secondary))" strokeWidth="8" fill="none" />
              <motion.circle cx="64" cy="64" r="56" stroke={phase.color} strokeWidth="8" fill="none" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 56}
                initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - score / 100) }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold" style={{ color: phase.color }}>{Math.round(score)}%</span>
              <span className="text-[10px] text-muted-foreground">Ready</span>
            </div>
          </div>

          <div className="flex-1 space-y-2 min-w-0">
            {items.map(item => {
              const pct = item.max > 0 ? (item.value / item.max) * 100 : 0;
              return (
                <div key={item.label} className="flex items-center gap-2">
                  <item.icon className={`w-3 h-3 flex-shrink-0 ${item.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full" style={{ backgroundColor: phase.color }} />
                    </div>
                  </div>
                  <span className="text-[9px] text-muted-foreground w-10 text-right flex-shrink-0">{item.value.toFixed(1)}/{item.max}</span>
                </div>
              );
            })}
            {trendData.length >= 2 && (
              <div className="pt-1">
                <Sparkline data={trendData.slice(-30)} color={phase.color} width={120} height={20} />
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3">{phase.message}</p>

        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-[11px] text-primary mt-3 hover:underline">
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Hide details' : 'View breakdown & tips'}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-5 pb-5 border-t border-border pt-4 space-y-5">
              <PhaseTipsCard score={score} color={phase.color} label={label} result={result} />
              <FullBreakdown result={result} trendData={trendData} phaseColor={phase.color} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SubjectBreakdownSection({ subjects, color }: { subjects: SubjectReadiness[]; color: string }) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? subjects : subjects.slice(0, 5);

  return (
    <div>
      <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
        📋 Subject-wise Breakdown
      </h4>
      <div className="space-y-2">
        {displayed.map(sub => (
          <div key={sub.subjectId} className="flex items-center gap-2">
            <div className="w-20 text-[10px] font-medium truncate" title={sub.subjectName}>
              {sub.subjectName}
            </div>
            <div className="flex-1">
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(sub.syllabusPct, 100)}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
            </div>
            <div className="flex gap-2 text-[9px] text-muted-foreground flex-shrink-0">
              <span title="Syllabus progress">{sub.syllabusPct}%</span>
              <span title="Weight" className="text-foreground/40">w{sub.weightage}</span>
              {sub.syllabusPct > 0 && sub.gap > 0.5 && (
                <span className="text-amber-500 font-medium" title="Points to gain">+{sub.gap.toFixed(1)}</span>
              )}
              {sub.syllabusPct === 0 && (
                <span className="text-muted-foreground/60 font-medium text-[8px]">Not started</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {subjects.length > 5 && (
        <button onClick={() => setShowAll(!showAll)} className="text-[10px] text-primary mt-2 hover:underline">
          {showAll ? 'Show less' : `Show all ${subjects.length} subjects`}
        </button>
      )}
    </div>
  );
}

function HowItsCalculated() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <span className="text-[11px] font-semibold flex items-center gap-1.5">
          <Calculator className="w-3.5 h-3.5 text-primary" />
          <span>How it's calculated</span>
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 py-3 space-y-3 text-[11px] text-muted-foreground leading-relaxed">
              <p className="font-medium text-foreground">Your readiness score is based on 5 weighted components:</p>
              <div className="space-y-1.5">
                <div className="flex justify-between"><span className="flex items-center gap-1.5"><BookOpen className="w-3 h-3 text-blue-500" /> Syllabus Coverage</span><span className="font-semibold text-foreground">35 pts</span></div>
                <p className="pl-[18px] text-[10px]">% of topics with video stages done, weighted by subject exam weightage</p>
                <div className="flex justify-between"><span className="flex items-center gap-1.5"><RotateCcw className="w-3 h-3 text-violet-500" /> Revision Quality</span><span className="font-semibold text-foreground">20 pts</span></div>
                <p className="pl-[18px] text-[10px]">How many topics have active spaced repetition with ≥3 confidence</p>
                <div className="flex justify-between"><span className="flex items-center gap-1.5"><FileQuestion className="w-3 h-3 text-amber-500" /> MCQ Practice</span><span className="font-semibold text-foreground">20 pts</span></div>
                <p className="pl-[18px] text-[10px]">Questions solved vs target per topic (marking MCQs done in subjects counts here)</p>
                <div className="flex justify-between"><span className="flex items-center gap-1.5"><FileText className="w-3 h-3 text-emerald-500" /> PYQ Completion</span><span className="font-semibold text-foreground">15 pts</span></div>
                <p className="pl-[18px] text-[10px]">% of topics with completed previous year question sessions</p>
                <div className="flex justify-between"><span className="flex items-center gap-1.5"><GraduationCap className="w-3 h-3 text-primary" /> Mock Performance</span><span className="font-semibold text-foreground">10 pts</span></div>
                <p className="pl-[18px] text-[10px]">Based on latest mock score percentile and improvement trend</p>
              </div>
              <div className="border-t border-border pt-2 space-y-1">
                <p><span className="text-emerald-500 font-medium">Bonuses</span> for study streaks, balanced coverage, and consistent daily practice</p>
                <p><span className="text-destructive font-medium">Penalties</span> for inactivity (&gt;3 days gap), heavily imbalanced prep, or declining mocks</p>
              </div>
              <p className="text-[10px] italic">Score = Base (100) + Bonuses − Penalties, capped at 0–100</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FullBreakdown({ result, trendData, phaseColor }: { result: ReadinessResult; trendData: number[]; phaseColor?: string }) {
  const { score, breakdown, color, recommendations } = result;
  const displayColor = phaseColor || color;

  return (
    <div className="space-y-5">
      {breakdown.subjectBreakdown.length > 0 && (
        <SubjectBreakdownSection subjects={breakdown.subjectBreakdown} color={displayColor} />
      )}

      {breakdown.bonuses.total > 0 && (
        <div className="bg-emerald-500/5 rounded-lg p-3 border border-emerald-500/10">
          <h4 className="text-[11px] font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-emerald-600 dark:text-emerald-400">Bonuses: +{breakdown.bonuses.total} pts</span>
          </h4>
          <div className="space-y-1.5">
            {breakdown.bonuses.details.map((d, i) => (
              <p key={i} className="text-[11px] text-foreground/80 flex items-center gap-1.5">
                <span className="text-emerald-500">✓</span> {d}
              </p>
            ))}
          </div>
        </div>
      )}

      {breakdown.penalties.total < 0 && (
        <div className="bg-destructive/5 rounded-lg p-3 border border-destructive/10">
          <h4 className="text-[11px] font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
            <span className="text-destructive">Penalties: {breakdown.penalties.total} pts</span>
          </h4>
          <div className="space-y-1.5">
            {breakdown.penalties.details.map((d, i) => (
              <p key={i} className="text-[11px] text-foreground/80 flex items-center gap-1.5">
                <span className="text-destructive">✗</span> {d}
              </p>
            ))}
          </div>
        </div>
      )}

      <HowItsCalculated />

      {recommendations.length > 0 && (
        <div>
          <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
            💡 Recommendations
          </h4>
          <div className="space-y-1.5">
            {recommendations.map((rec, i) => (
              <p key={i} className="text-[11px] text-foreground/80 flex items-start gap-1.5">
                <span className="text-primary mt-0.5">→</span> {rec}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
