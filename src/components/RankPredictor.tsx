import { useState, useMemo } from 'react';
import { Trophy, Target, TrendingUp, ChevronRight, Award } from 'lucide-react';
import { predictRank, RANK_BRACKET_INFO } from '@/data/neetRankData';
import { MockTest, MarkingScheme } from '@/types';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface RankPredictorProps {
  mockTests: MockTest[];
  markingScheme: MarkingScheme;
  target?: number;
}

export function RankPredictor({ mockTests, markingScheme, target }: RankPredictorProps) {
  const [manualMarks, setManualMarks] = useState<string>('');

  // Auto-predict from latest mock test
  const latestMockMarks = useMemo(() => {
    if (mockTests.length === 0) return null;
    const sorted = [...mockTests].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latest = sorted[0];
    // Calculate marks from mock: correct * marks - wrong * negative
    const totalQ = latest.totalQuestions || 200;
    const correct = Math.round((latest.score / 100) * totalQ);
    const wrong = totalQ - correct;
    const marks = correct * (markingScheme.correctMarks || 4) - wrong * (markingScheme.negativeMarks || 1);
    return Math.max(0, Math.min(800, marks));
  }, [mockTests, markingScheme]);

  const activeMarks = manualMarks ? parseInt(manualMarks) : latestMockMarks;
  const prediction = activeMarks && activeMarks > 0 ? predictRank(Math.min(800, activeMarks)) : null;

  const bracketColor = (bracket: string) => {
    if (bracket === 'Top 1,000') return 'text-amber-500';
    if (bracket === '1,000–5,000') return 'text-emerald-500';
    if (bracket === '5,000–10,000') return 'text-blue-500';
    if (bracket === '10,000–20,000') return 'text-purple-500';
    return 'text-muted-foreground';
  };

  return (
    <div className="bg-card rounded-xl border border-border p-3 space-y-3">
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">NEET PG Rank Predictor</h3>
      </div>

      {/* Input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type="number"
            placeholder={latestMockMarks ? `Auto: ${latestMockMarks} (from mock)` : 'Enter expected marks (out of 800)'}
            value={manualMarks}
            onChange={e => setManualMarks(e.target.value)}
            className="h-9 text-sm pr-12"
            min={0}
            max={800}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">/800</span>
        </div>
        {manualMarks && (
          <Button variant="ghost" size="sm" onClick={() => setManualMarks('')} className="h-9 text-xs">
            Reset
          </Button>
        )}
      </div>

      {/* Prediction Result */}
      {prediction && activeMarks ? (
        <div className="space-y-3">
          {/* Rank Card */}
          <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Estimated Rank for {activeMarks} marks</span>
              <Award className={cn("w-4 h-4", bracketColor(prediction.bracket.bracket))} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">
                {prediction.rankMin.toLocaleString()}
              </span>
              <span className="text-muted-foreground text-sm">–</span>
              <span className="text-2xl font-bold text-foreground">
                {prediction.rankMax.toLocaleString()}
              </span>
            </div>
            <p className={cn("text-xs font-semibold mt-1", bracketColor(prediction.bracket.bracket))}>
              {prediction.bracket.bracket} Bracket
            </p>
          </div>

          {/* Bracket Details */}
          <div className="space-y-2">
            <div className="bg-secondary/30 rounded-lg p-2.5">
              <div className="flex items-start gap-2">
                <Target className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Opportunities</p>
                  <p className="text-xs mt-0.5">{prediction.bracket.opportunities}</p>
                </div>
              </div>
            </div>
            <div className="bg-secondary/30 rounded-lg p-2.5">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Career Impact</p>
                  <p className="text-xs mt-0.5">{prediction.bracket.impact}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick marks reference */}
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground font-medium">Quick Reference</p>
            <div className="grid grid-cols-2 gap-1">
              {[
                { marks: 675, label: 'Top 1K' },
                { marks: 620, label: 'Top 5K' },
                { marks: 570, label: 'Top 10K' },
                { marks: 500, label: 'Top 20K' },
              ].map(ref => {
                const r = predictRank(ref.marks);
                return (
                  <button
                    key={ref.marks}
                    onClick={() => setManualMarks(String(ref.marks))}
                    className={cn(
                      "flex items-center justify-between px-2 py-1.5 rounded-lg text-[10px] transition-all",
                      activeMarks === ref.marks ? "bg-primary/10 text-primary" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    <span className="font-medium">{ref.marks} marks</span>
                    <span>{ref.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            {latestMockMarks
              ? 'Enter marks or use your latest mock score'
              : 'Enter your expected marks to see predicted rank'}
          </p>
        </div>
      )}
    </div>
  );
}
