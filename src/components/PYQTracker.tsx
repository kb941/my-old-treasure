import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, FileText, ChevronDown, ChevronUp, Filter, ArrowRight } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Subject } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface PYQEntry {
  exam: string;
  session: string;
  subjectId: string;
  done: boolean;
  marks?: number;
  totalQuestions?: number;
  correctAnswers?: number;
}

interface ExamConfig {
  name: string;
  sessions: string[];
}

const DEFAULT_YEARS = Array.from({ length: 10 }, (_, i) => 2025 - i);

export const EXAM_CONFIGS: ExamConfig[] = [
  { name: 'NEET PG', sessions: YEARS.map(y => `${y}`) },
  { name: 'INICET', sessions: YEARS.flatMap(y => [`May ${y}`, `Nov ${y}`]) },
  { name: 'FMGE', sessions: YEARS.flatMap(y => [`June ${y}`, `Dec ${y}`]) },
];

function generateDefaults(subjects: Subject[]): PYQEntry[] {
  const entries: PYQEntry[] = [];
  EXAM_CONFIGS.forEach(config => {
    config.sessions.forEach(session => {
      entries.push({ exam: config.name, session, subjectId: 'all', done: false });
      subjects.forEach(s => {
        entries.push({ exam: config.name, session, subjectId: s.id, done: false });
      });
    });
  });
  return entries;
}

function extractYear(session: string): number {
  const match = session.match(/(\d{4})/);
  return match ? parseInt(match[1]) : 0;
}

interface PYQTrackerProps {
  subjects: Subject[];
  pyqYearFrom?: number;
  pyqYearTo?: number;
}

// Summary card for subjects tab — navigates to PYQs tab
export function PYQSummaryCard({ onNavigate }: { onNavigate: () => void }) {
  const [pyqData] = useLocalStorage<PYQEntry[]>('planos-pyq-tracker-v2', []);

  const totalSubjectEntries = pyqData.filter(e => e.subjectId !== 'all').length;
  const doneEntries = pyqData.filter(e => e.subjectId !== 'all' && e.done).length;
  const totalCorrect = pyqData.filter(e => e.subjectId !== 'all').reduce((s, e) => s + (e.correctAnswers || 0), 0);
  const totalAttempted = pyqData.filter(e => e.subjectId !== 'all').reduce((s, e) => s + (e.totalQuestions || 0), 0);
  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : null;
  const progress = totalSubjectEntries > 0 ? Math.round((doneEntries / totalSubjectEntries) * 100) : 0;

  return (
    <button
      onClick={onNavigate}
      className="w-full bg-card rounded-xl p-4 border border-border hover:border-primary/40 transition-all text-left group"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">PYQ Tracker</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-primary group-hover:translate-x-0.5 transition-transform">
          Open <ArrowRight className="w-3 h-3" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{progress}%</span>
        {accuracy !== null && (
          <span className={`text-xs font-medium ${accuracy >= 75 ? 'text-green-500' : accuracy >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
            {accuracy}% acc
          </span>
        )}
      </div>
      <div className="flex gap-3 mt-2">
        {EXAM_CONFIGS.map(cfg => {
          const entries = pyqData.filter(e => e.exam === cfg.name && e.subjectId !== 'all');
          const done = entries.filter(e => e.done).length;
          return (
            <span key={cfg.name} className="text-[10px] text-muted-foreground">
              {cfg.name}: {done}/{entries.length}
            </span>
          );
        })}
      </div>
    </button>
  );
}

export function PYQTracker({ subjects, pyqYearFrom, pyqYearTo }: PYQTrackerProps) {
  const defaults = useMemo(() => generateDefaults(subjects), [subjects]);
  const [pyqData, setPyqData] = useLocalStorage<PYQEntry[]>('planos-pyq-tracker-v2', defaults);
  const [selectedExam, setSelectedExam] = useState<string>('NEET PG');
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [yearFrom, setYearFrom] = useState<string>('all');
  const [yearTo, setYearTo] = useState<string>('all');
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);

  const mergedData = useMemo(() => {
    const existing = new Set(pyqData.map(e => `${e.exam}|${e.session}|${e.subjectId}`));
    const missing = defaults.filter(d => !existing.has(`${d.exam}|${d.session}|${d.subjectId}`));
    return missing.length > 0 ? [...pyqData, ...missing] : pyqData;
  }, [pyqData, defaults]);

  const config = EXAM_CONFIGS.find(c => c.name === selectedExam)!;

  // Filter sessions
  const filteredSessions = useMemo(() => {
    let sessions = config.sessions;
    const fromYear = yearFrom !== 'all' ? parseInt(yearFrom) : null;
    const toYear = yearTo !== 'all' ? parseInt(yearTo) : null;

    if (fromYear) sessions = sessions.filter(s => extractYear(s) >= fromYear);
    if (toYear) sessions = sessions.filter(s => extractYear(s) <= toYear);

    if (showIncompleteOnly) {
      sessions = sessions.filter(s => {
        const entries = mergedData.filter(e => e.exam === selectedExam && e.session === s && e.subjectId !== 'all');
        return entries.some(e => !e.done);
      });
    }

    return sessions;
  }, [config.sessions, yearFrom, yearTo, showIncompleteOnly, mergedData, selectedExam]);

  const toggleEntry = (exam: string, session: string, subjectId: string) => {
    setPyqData(prev => {
      const base = prev.length === mergedData.length ? prev : mergedData;
      return base.map(e =>
        e.exam === exam && e.session === session && e.subjectId === subjectId
          ? { ...e, done: !e.done } : e
      );
    });
  };

  const toggleWholeSession = (exam: string, session: string) => {
    const sessionEntries = mergedData.filter(e => e.exam === exam && e.session === session);
    const allDone = sessionEntries.every(e => e.done);
    setPyqData(prev => {
      const base = prev.length === mergedData.length ? prev : mergedData;
      return base.map(e =>
        e.exam === exam && e.session === session ? { ...e, done: !allDone } : e
      );
    });
  };

  const updateMarks = (exam: string, session: string, subjectId: string, field: 'marks' | 'totalQuestions' | 'correctAnswers', value: number) => {
    setPyqData(prev => {
      const base = prev.length === mergedData.length ? prev : mergedData;
      return base.map(e =>
        e.exam === exam && e.session === session && e.subjectId === subjectId
          ? { ...e, [field]: value } : e
      );
    });
  };

  const getSessionStats = (session: string) => {
    const entries = mergedData.filter(e => e.exam === selectedExam && e.session === session && e.subjectId !== 'all');
    const done = entries.filter(e => e.done).length;
    const total = entries.length;
    const totalCorrect = entries.reduce((s, e) => s + (e.correctAnswers || 0), 0);
    const totalAttempted = entries.reduce((s, e) => s + (e.totalQuestions || 0), 0);
    const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : null;
    const allEntry = mergedData.find(e => e.exam === selectedExam && e.session === session && e.subjectId === 'all');
    return { done, total, accuracy, allDone: allEntry?.done || false, marks: allEntry?.marks };
  };

  const examEntries = mergedData.filter(e => e.exam === selectedExam && e.subjectId !== 'all');
  const examDoneCount = examEntries.filter(e => e.done).length;
  const examTotalCount = examEntries.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        <h2 className="text-base font-semibold">PYQ Tracker</h2>
      </div>

      {/* Exam tabs */}
      <div className="flex gap-2">
        {EXAM_CONFIGS.map(cfg => {
          const allEntries = mergedData.filter(e => e.exam === cfg.name && e.subjectId !== 'all');
          const doneEntries = allEntries.filter(e => e.done).length;
          return (
            <button
              key={cfg.name}
              onClick={() => { setSelectedExam(cfg.name); setExpandedSession(null); }}
              className={`flex-1 p-2.5 rounded-xl border-2 transition-all text-center ${
                selectedExam === cfg.name
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span className={`text-xs font-medium block ${selectedExam === cfg.name ? 'text-primary' : 'text-foreground'}`}>
                {cfg.name}
              </span>
              <span className="text-[10px] text-muted-foreground">{doneEntries}/{allEntries.length}</span>
            </button>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{examDoneCount}/{examTotalCount} subject-sessions done</span>
          <span>{examTotalCount > 0 ? Math.round((examDoneCount / examTotalCount) * 100) : 0}%</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full gradient-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${examTotalCount > 0 ? (examDoneCount / examTotalCount) * 100 : 0}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
        <Select value={yearFrom} onValueChange={setYearFrom}>
          <SelectTrigger className="h-7 w-[90px] text-xs">
            <SelectValue placeholder="From" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {YEARS.map(y => <SelectItem key={y} value={`${y}`}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">to</span>
        <Select value={yearTo} onValueChange={setYearTo}>
          <SelectTrigger className="h-7 w-[90px] text-xs">
            <SelectValue placeholder="To" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {YEARS.map(y => <SelectItem key={y} value={`${y}`}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
        <button
          onClick={() => setShowIncompleteOnly(!showIncompleteOnly)}
          className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
            showIncompleteOnly
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border text-muted-foreground hover:border-primary/50'
          }`}
        >
          Incomplete
        </button>
      </div>

      {/* Sessions list */}
      <div className="space-y-1.5">
        {filteredSessions.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">No sessions match your filters</p>
        )}
        {filteredSessions.map(session => {
          const stats = getSessionStats(session);
          const isExpanded = expandedSession === session;
          const subjectEntries = mergedData.filter(e => e.exam === selectedExam && e.session === session && e.subjectId !== 'all');

          return (
            <div key={session} className="rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setExpandedSession(isExpanded ? null : session)}
                className={`w-full flex items-center justify-between p-3 transition-all ${
                  stats.done === stats.total && stats.total > 0 ? 'bg-primary/5' : 'bg-card'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWholeSession(selectedExam, session); }}
                    className="shrink-0"
                  >
                    {stats.done === stats.total && stats.total > 0 ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground/40" />
                    )}
                  </button>
                  <div className="text-left">
                    <span className="text-sm font-medium text-foreground">{session}</span>
                    <span className="text-[10px] text-muted-foreground block">
                      {stats.done}/{stats.total} subjects
                      {stats.accuracy !== null && ` · ${stats.accuracy}% acc`}
                      {stats.marks !== undefined && stats.marks > 0 && ` · ${stats.marks} marks`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${stats.total > 0 ? (stats.done / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>

              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-border"
                >
                  {/* Two-row grid: toggle row + optional score row per subject */}
                  <div className="grid grid-cols-[1fr] divide-y divide-border/30">
                    {subjectEntries.map(entry => {
                      const subjectName = subjects.find(s => s.id === entry.subjectId)?.name || entry.subjectId;
                      const accuracy = entry.totalQuestions && entry.totalQuestions > 0
                        ? Math.round(((entry.correctAnswers || 0) / entry.totalQuestions) * 100)
                        : null;
                      return (
                        <div key={entry.subjectId} className="flex items-center gap-2 px-3 py-1.5">
                          <button
                            onClick={() => toggleEntry(selectedExam, session, entry.subjectId)}
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                              entry.done ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                            }`}
                          >
                            {entry.done && <span className="text-primary-foreground text-[9px]">✓</span>}
                          </button>
                          <span className={`text-xs flex-1 truncate ${entry.done ? 'text-primary font-medium' : 'text-foreground'}`}>
                            {subjectName}
                          </span>
                          {entry.done && (
                            <div className="flex items-center gap-0.5 shrink-0">
                              <input
                                type="number"
                                placeholder="✓"
                                value={entry.correctAnswers || ''}
                                onChange={(e) => updateMarks(selectedExam, session, entry.subjectId, 'correctAnswers', parseInt(e.target.value) || 0)}
                                className="w-8 h-5 text-[10px] text-center bg-secondary/50 rounded border border-border/50 text-foreground"
                              />
                              <span className="text-[9px] text-muted-foreground">/</span>
                              <input
                                type="number"
                                placeholder="T"
                                value={entry.totalQuestions || ''}
                                onChange={(e) => updateMarks(selectedExam, session, entry.subjectId, 'totalQuestions', parseInt(e.target.value) || 0)}
                                className="w-8 h-5 text-[10px] text-center bg-secondary/50 rounded border border-border/50 text-foreground"
                              />
                              {accuracy !== null && (
                                <span className={`text-[9px] font-semibold ml-0.5 w-7 text-right ${
                                  accuracy >= 75 ? 'text-green-500' : accuracy >= 50 ? 'text-yellow-500' : 'text-red-500'
                                }`}>
                                  {accuracy}%
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
