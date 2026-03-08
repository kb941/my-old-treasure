import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, BookOpen, RotateCcw, FileQuestion, FileText, GraduationCap, Sparkles, AlertTriangle, Lightbulb } from 'lucide-react';
import { ReadinessResult } from '@/hooks/useReadinessScore';

interface ReadinessScoreCardProps {
  result: ReadinessResult;
}

export function ReadinessScoreCard({ result }: ReadinessScoreCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { score, breakdown, color, label, message, recommendations } = result;

  const circumference = 2 * Math.PI * 72;
  const progress = score / 100;

  const baseItems = [
    { icon: BookOpen, label: 'Syllabus Coverage', value: breakdown.base.syllabus, max: 35, color: 'text-blue-500' },
    { icon: RotateCcw, label: 'Revision Quality', value: breakdown.base.revision, max: 20, color: 'text-violet-500' },
    { icon: FileQuestion, label: 'MCQ Practice', value: breakdown.base.mcq, max: 20, color: 'text-amber-500' },
    { icon: FileText, label: 'PYQ Completion', value: breakdown.base.pyq, max: 15, color: 'text-emerald-500' },
    { icon: GraduationCap, label: 'Mock Performance', value: breakdown.base.mocks, max: 10, color: 'text-primary' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl shadow-card border border-border overflow-hidden"
    >
      {/* Main Score Display */}
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
          {/* Circular gauge */}
          <div className="relative flex-shrink-0">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="hsl(var(--secondary))" strokeWidth="8" fill="none" />
              <motion.circle
                cx="64" cy="64" r="56"
                stroke={color}
                strokeWidth="8" fill="none" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 56}
                initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - progress) }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold" style={{ color }}>{Math.round(score)}%</span>
              <span className="text-[10px] text-muted-foreground">Ready</span>
            </div>
          </div>

          {/* Quick breakdown bars */}
          <div className="flex-1 space-y-2 min-w-0">
            {baseItems.map(item => {
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

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[11px] text-primary mt-3 hover:underline"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Hide details' : 'View full breakdown'}
        </button>
      </div>

      {/* Expanded Breakdown */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
              {/* Base Score Details */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Base Score: {breakdown.base.total} pts
                </h4>
                <div className="space-y-1.5">
                  {baseItems.map(item => {
                    const pct = item.max > 0 ? Math.round((item.value / item.max) * 100) : 0;
                    return (
                      <div key={item.label} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <item.icon className={`w-3 h-3 ${item.color}`} />
                          <span>{item.label}</span>
                        </div>
                        <span className="font-medium">{item.value} / {item.max} <span className="text-muted-foreground">({pct}%)</span></span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bonuses */}
              {breakdown.bonuses.total > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span className="text-emerald-500">Bonuses: +{breakdown.bonuses.total} pts</span>
                  </h4>
                  <div className="space-y-1">
                    {breakdown.bonuses.details.map((d, i) => (
                      <p key={i} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <span className="text-emerald-500">✓</span> {d}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Penalties */}
              {breakdown.penalties.total < 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-destructive" />
                    <span className="text-destructive">Penalties: {breakdown.penalties.total} pts</span>
                  </h4>
                  <div className="space-y-1">
                    {breakdown.penalties.details.map((d, i) => (
                      <p key={i} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <span className="text-destructive">⚠</span> {d}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Final */}
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-xs font-semibold">
                  Final: {breakdown.base.total} {breakdown.bonuses.total > 0 ? `+ ${breakdown.bonuses.total}` : ''} {breakdown.penalties.total < 0 ? `${breakdown.penalties.total}` : ''} = <span style={{ color }}>{Math.round(score)}%</span>
                </p>
              </div>

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-amber-500" />
                    Top Recommendations
                  </h4>
                  <div className="space-y-1">
                    {recommendations.map((r, i) => (
                      <p key={i} className="text-[11px] text-muted-foreground">
                        {i + 1}. {r}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
