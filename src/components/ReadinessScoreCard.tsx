import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, BookOpen, RotateCcw, FileQuestion, FileText, GraduationCap, Sparkles, AlertTriangle, Lightbulb, X } from 'lucide-react';
import { ReadinessResult } from '@/hooks/useReadinessScore';

interface ReadinessScoreCardProps {
  result: ReadinessResult;
  compact?: boolean;
}

const baseItems = (breakdown: ReadinessResult['breakdown']) => [
  { icon: BookOpen, label: 'Syllabus Coverage', value: breakdown.base.syllabus, max: 35, color: 'text-blue-500' },
  { icon: RotateCcw, label: 'Revision Quality', value: breakdown.base.revision, max: 20, color: 'text-violet-500' },
  { icon: FileQuestion, label: 'MCQ Practice', value: breakdown.base.mcq, max: 20, color: 'text-amber-500' },
  { icon: FileText, label: 'PYQ Completion', value: breakdown.base.pyq, max: 15, color: 'text-emerald-500' },
  { icon: GraduationCap, label: 'Mock Performance', value: breakdown.base.mocks, max: 10, color: 'text-primary' },
];

export function ReadinessScoreCard({ result, compact = false }: ReadinessScoreCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const { score, breakdown, color, label, message, recommendations } = result;
  const items = baseItems(breakdown);

  // === COMPACT WIDGET (for Today tab) ===
  if (compact) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setShowDetail(true)}
          className="bg-card rounded-xl p-3 border border-border cursor-pointer hover:border-primary/30 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            {/* Mini circular gauge */}
            <div className="relative flex-shrink-0">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="hsl(var(--secondary))" strokeWidth="4" fill="none" />
                <motion.circle
                  cx="24" cy="24" r="20"
                  stroke={color}
                  strokeWidth="4" fill="none" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 20}
                  initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - score / 100) }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] font-bold" style={{ color }}>{Math.round(score)}%</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold">Exam Readiness</span>
                <span
                  className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                  style={{ background: `${color}20`, color }}
                >
                  {label}
                </span>
              </div>
              {/* Mini progress bars */}
              <div className="flex gap-1">
                {items.map(item => {
                  const pct = item.max > 0 ? (item.value / item.max) * 100 : 0;
                  return (
                    <div key={item.label} className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
                      />
                    </div>
                  );
                })}
              </div>
              <p className="text-[9px] text-muted-foreground mt-1 truncate">Tap for full breakdown</p>
            </div>
          </div>
        </motion.div>

        {/* Full-screen detail modal */}
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
                className="absolute inset-x-3 top-8 bottom-8 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[480px] bg-card rounded-2xl border border-border shadow-lg overflow-y-auto"
              >
                <div className="sticky top-0 z-10 bg-card border-b border-border px-5 py-3 flex items-center justify-between">
                  <h2 className="font-semibold text-base">🎯 Exam Readiness Breakdown</h2>
                  <button onClick={() => setShowDetail(false)} className="p-1 rounded-full hover:bg-secondary">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5">
                  <FullBreakdown result={result} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // === FULL CARD (for Analytics tab) ===
  return <FullCard result={result} />;
}

function FullCard({ result }: { result: ReadinessResult }) {
  const [expanded, setExpanded] = useState(false);
  const { score, breakdown, color, label, message } = result;
  const items = baseItems(breakdown);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl shadow-card border border-border overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-base">🎯 Exam Readiness</h3>
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{ background: `${color}20`, color }}
          >
            {label}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative flex-shrink-0">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="hsl(var(--secondary))" strokeWidth="8" fill="none" />
              <motion.circle
                cx="64" cy="64" r="56"
                stroke={color}
                strokeWidth="8" fill="none" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 56}
                initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - score / 100) }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold" style={{ color }}>{Math.round(score)}%</span>
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
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(pct, 100)}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  </div>
                  <span className="text-[9px] text-muted-foreground w-10 text-right flex-shrink-0">
                    {item.value}/{item.max}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3">{message}</p>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[11px] text-primary mt-3 hover:underline"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Hide details' : 'View full breakdown'}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-border pt-4">
              <FullBreakdown result={result} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FullBreakdown({ result }: { result: ReadinessResult }) {
  const { score, breakdown, color, recommendations } = result;
  const items = baseItems(breakdown);

  return (
    <div className="space-y-5">
      {/* Score summary at top of breakdown */}
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg className="w-28 h-28 transform -rotate-90">
            <circle cx="56" cy="56" r="48" stroke="hsl(var(--secondary))" strokeWidth="7" fill="none" />
            <motion.circle
              cx="56" cy="56" r="48"
              stroke={color}
              strokeWidth="7" fill="none" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 48}
              initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - score / 100) }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold" style={{ color }}>{Math.round(score)}%</span>
            <span className="text-[9px] text-muted-foreground">Readiness</span>
          </div>
        </div>
      </div>

      {/* Base Score Details */}
      <div>
        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
          📊 Base Score: {breakdown.base.total} / 100 pts
        </h4>
        <div className="space-y-2">
          {items.map(item => {
            const pct = item.max > 0 ? Math.round((item.value / item.max) * 100) : 0;
            return (
              <div key={item.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span className="text-muted-foreground">{item.value} / {item.max} ({pct}%)</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(pct, 100)}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bonuses */}
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

      {/* Penalties */}
      {breakdown.penalties.total < 0 && (
        <div className="bg-destructive/5 rounded-lg p-3 border border-destructive/10">
          <h4 className="text-[11px] font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
            <span className="text-destructive">Penalties: {breakdown.penalties.total} pts</span>
          </h4>
          <div className="space-y-1.5">
            {breakdown.penalties.details.map((d, i) => (
              <p key={i} className="text-[11px] text-foreground/80 flex items-center gap-1.5">
                <span className="text-destructive">⚠</span> {d}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Final Score */}
      <div className="bg-secondary/50 rounded-lg p-3">
        <p className="text-xs font-semibold text-center">
          Final: {breakdown.base.total}
          {breakdown.bonuses.total > 0 ? ` + ${breakdown.bonuses.total}` : ''}
          {breakdown.penalties.total < 0 ? ` ${breakdown.penalties.total}` : ''}
          {' = '}
          <span className="text-sm" style={{ color }}>{Math.round(score)}%</span>
        </p>
      </div>

      {/* Formula Reference */}
      <div className="bg-secondary/30 rounded-lg p-3">
        <h4 className="text-[11px] font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5">
          🧮 How It's Calculated
        </h4>
        <div className="space-y-1 text-[10px] text-muted-foreground">
          <p>• <strong>Syllabus (35%)</strong> — Weighted Main video completion across subjects</p>
          <p>• <strong>Revision (20%)</strong> — Spaced repetition cycles (RR1×40% + RR2×35% + RR3×25%) minus overdue penalties</p>
          <p>• <strong>MCQ (20%)</strong> — Volume vs goal (50%) + weighted accuracy vs 75% target (50%)</p>
          <p>• <strong>PYQ (15%)</strong> — Sessions done (60%) + accuracy vs 80% target (40%) + year coverage</p>
          <p>• <strong>Mocks (10%)</strong> — Avg score (70%) + trend (30%) + consistency bonus</p>
          <p className="pt-1">• <strong>Bonuses (+15 max)</strong> — Early bird, streak, accuracy elite, balanced prep, momentum</p>
          <p>• <strong>Penalties (-20 max)</strong> — Only apply after you start studying. Procrastination, weak critical subjects, mock deficit, inactivity</p>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            Top Recommendations
          </h4>
          <div className="space-y-1.5">
            {recommendations.map((r, i) => (
              <p key={i} className="text-[11px] text-foreground/80">
                {i + 1}. {r}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
