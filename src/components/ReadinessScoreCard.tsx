import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, BookOpen, RotateCcw, FileQuestion, FileText, GraduationCap, Sparkles, AlertTriangle, Lightbulb, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
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

// Mini sparkline SVG
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
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {/* Dot on last point */}
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

export function ReadinessScoreCard({ result, compact = false }: ReadinessScoreCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const { score, breakdown, color, label, message } = result;
  const items = getBaseItems(breakdown);

  const trendData = useMemo(() => getReadinessTrend().map(t => t.score), [score]);

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
                <TrendBadge trend={trendData} />
              </div>
              <div className="flex gap-1">
                {items.map(item => {
                  const pct = item.max > 0 ? (item.value / item.max) * 100 : 0;
                  return (
                    <div key={item.label} className="flex-1 h-1 bg-secondary rounded-full overflow-hidden" title={`${item.label}: ${item.value}/${item.max}`}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} />
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[9px] text-muted-foreground">Tap for breakdown</p>
                {trendData.length >= 2 && (
                  <Sparkline data={trendData.slice(-14)} color={color} width={50} height={14} />
                )}
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
                <div className="sticky top-0 z-10 bg-card border-b border-border px-5 py-3 flex items-center justify-between">
                  <h2 className="font-semibold text-base">🎯 Exam Readiness Breakdown</h2>
                  <button onClick={() => setShowDetail(false)} className="p-1 rounded-full hover:bg-secondary">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5">
                  <FullBreakdown result={result} trendData={trendData} />
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl shadow-card border border-border overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base">🎯 Exam Readiness</h3>
            <TrendBadge trend={trendData} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ background: `${color}20`, color }}>
            {label}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative flex-shrink-0">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="hsl(var(--secondary))" strokeWidth="8" fill="none" />
              <motion.circle cx="64" cy="64" r="56" stroke={color} strokeWidth="8" fill="none" strokeLinecap="round"
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
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full" style={{ backgroundColor: color }} />
                    </div>
                  </div>
                  <span className="text-[9px] text-muted-foreground w-10 text-right flex-shrink-0">{item.value}/{item.max}</span>
                </div>
              );
            })}
            {trendData.length >= 2 && (
              <div className="pt-1">
                <Sparkline data={trendData.slice(-30)} color={color} width={120} height={20} />
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3">{message}</p>

        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-[11px] text-primary mt-3 hover:underline">
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Hide details' : 'View full breakdown'}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-5 pb-5 border-t border-border pt-4">
              <FullBreakdown result={result} trendData={trendData} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SubjectBreakdownSection({ subjects, color }: { subjects: SubjectReadiness[]; color: string }) {
  const [showAll, setShowAll] = useState(false);
  // Show top 5 gaps by default
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
                  style={{ backgroundColor: sub.syllabusPct > 60 ? 'hsl(var(--success))' : sub.syllabusPct > 30 ? color : 'hsl(var(--destructive))' }}
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

function FullBreakdown({ result, trendData }: { result: ReadinessResult; trendData: number[] }) {
  const { score, breakdown, color, recommendations } = result;
  const items = getBaseItems(breakdown);

  return (
    <div className="space-y-5">
      {/* Score gauge */}
      <div className="flex items-center justify-center gap-6">
        <div className="relative">
          <svg className="w-28 h-28 transform -rotate-90">
            <circle cx="56" cy="56" r="48" stroke="hsl(var(--secondary))" strokeWidth="7" fill="none" />
            <motion.circle cx="56" cy="56" r="48" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round"
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
        {trendData.length >= 2 && (
          <div className="text-center">
            <Sparkline data={trendData.slice(-30)} color={color} width={100} height={32} />
            <p className="text-[9px] text-muted-foreground mt-1">Last {Math.min(trendData.length, 30)} days</p>
            <TrendBadge trend={trendData.slice(-7)} />
          </div>
        )}
      </div>

      {/* Base Score Details */}
      <div>
        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
          📊 Base Score: {breakdown.base.total} / 100 pts
        </h4>
        <div className="space-y-2.5">
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
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full" style={{ backgroundColor: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subject Breakdown */}
      {breakdown.subjectBreakdown.length > 0 && (
        <SubjectBreakdownSection subjects={breakdown.subjectBreakdown} color={color} />
      )}

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

      {/* Formula */}
      <div className="bg-secondary/30 rounded-lg p-3">
        <h4 className="text-[11px] font-semibold uppercase tracking-wide mb-2">🧮 How It's Calculated</h4>
        <div className="space-y-1 text-[10px] text-muted-foreground">
          <p>• <strong>Syllabus (35%)</strong> — Main×50% + RR×30% + BTR×20% (adjusts if fewer types enabled), weighted by subject importance</p>
          <p>• <strong>Revision (20%)</strong> — RR1×40% + RR2×35% + RR3×25%, weighted by subject. Overdue penalty only if 14+ days past revision date; extra penalty for critical subjects (Medicine, Pharma, Micro, Patho, Surgery, OBG, PSM)</p>
          <p>• <strong>MCQ (20%)</strong> — Volume only if accuracy not tracked for most subjects; otherwise Vol×50% + Accuracy×50%, all weighted by subject</p>
          <p>• <strong>PYQ (15%)</strong> — Year-based priority (vol + accuracy if tracked) OR chapter-based fallback. Volume only if &lt;50% sessions have accuracy data</p>
          <p>• <strong>Mocks (10%)</strong> — Recent 60 days or last 3 mocks (whichever more). Avg score×70% + Trend×20% + Consistency×10%</p>
          <p className="pt-1">• <strong>Bonuses (+15 max)</strong> — Early bird, streak ≥14d, accuracy ≥80%, balanced prep, weekly momentum</p>
          <p>• <strong>Penalties</strong> — Procrastination (exam near + not studying), critical subjects weak (Medicine/Pharma/Micro/Patho/Surgery/OBG/PSM), mock deficit, inactivity (3d: -3, 7d: -6), accuracy decline, imbalanced study</p>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            Recommendations
          </h4>
          <div className="space-y-1.5">
            {recommendations.map((r, i) => (
              <p key={i} className="text-[11px] text-foreground/80">{i + 1}. {r}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
