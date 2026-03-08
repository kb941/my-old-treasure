import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Plus, Minus, TrendingUp, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { initialSubjects } from '@/data/subjects';
import { MockTest, SubjectScore } from '@/types';

export type MockModalMode = 'mock' | 'test' | 'pyq-mock';

interface MockTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLog: (data: MockTest) => void;
  mode?: MockModalMode;
  pyqYearFrom?: number;
  pyqYearTo?: number;
}

export function MockTestModal({ isOpen, onClose, onLog, mode = 'mock', pyqYearFrom = 2017, pyqYearTo = 2024 }: MockTestModalProps) {
  const [testName, setTestName] = useState('');
  const [source, setSource] = useState('');
  const [pyqExam, setPyqExam] = useState('NEET PG');
  const [pyqYear, setPyqYear] = useState(pyqYearTo);
  const [pyqSession, setPyqSession] = useState('');
  const [totalQuestions, setTotalQuestions] = useState(200);
  const [attemptedQuestions, setAttemptedQuestions] = useState(180);
  const [correctAnswers, setCorrectAnswers] = useState(130);
  const [timeTaken, setTimeTaken] = useState(180);
  const [percentile, setPercentile] = useState<number | undefined>();
  const [rank, setRank] = useState<number | undefined>();
  const [showSubjectBreakdown, setShowSubjectBreakdown] = useState(false);
  const [subjectScores, setSubjectScores] = useState<SubjectScore[]>([]);
  const [weakSubjects, setWeakSubjects] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setTestName('');
      setSource('');
      setPyqExam('NEET PG');
      setPyqYear(pyqYearTo);
      setPyqSession('');
      setTotalQuestions(200);
      setAttemptedQuestions(180);
      setCorrectAnswers(130);
      setTimeTaken(180);
      setPercentile(undefined);
      setRank(undefined);
      setShowSubjectBreakdown(false);
      setSubjectScores([]);
      setWeakSubjects([]);
      setNotes('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (mode === 'test') return; // No auto-weak for test mode
    const autoWeak = subjectScores
      .filter(s => s.total > 0 && s.accuracy < 50)
      .map(s => s.subjectId);
    if (autoWeak.length > 0) {
      setWeakSubjects(prev => Array.from(new Set([...prev, ...autoWeak])));
    }
  }, [subjectScores, mode]);

  const normalizedScore = Math.round((correctAnswers / totalQuestions) * 800);
  const accuracy = attemptedQuestions > 0 ? Math.round((correctAnswers / attemptedQuestions) * 100) : 0;

  const handleSubjectScoreChange = (subjectId: string, field: 'total' | 'correct', value: number) => {
    setSubjectScores(prev => {
      const existing = prev.find(s => s.subjectId === subjectId);
      if (existing) {
        return prev.map(s => {
          if (s.subjectId === subjectId) {
            const updated = { ...s, [field]: value };
            updated.accuracy = updated.total > 0 ? Math.round((updated.correct / updated.total) * 100) : 0;
            return updated;
          }
          return s;
        });
      }
      const subject = initialSubjects.find(s => s.id === subjectId);
      const newScore: SubjectScore = {
        subjectId,
        subjectName: subject?.name || '',
        total: field === 'total' ? value : 0,
        correct: field === 'correct' ? value : 0,
        accuracy: 0
      };
      newScore.accuracy = newScore.total > 0 ? Math.round((newScore.correct / newScore.total) * 100) : 0;
      return [...prev, newScore];
    });
  };

  const toggleWeakSubject = (subjectId: string) => {
    setWeakSubjects(prev =>
      prev.includes(subjectId) ? prev.filter(id => id !== subjectId) : [...prev, subjectId]
    );
  };

  const getTitle = () => {
    if (mode === 'test') return 'Log Test';
    if (mode === 'pyq-mock') return 'Log PYQ Mock';
    return 'Log Full Mock';
  };

  const getIcon = () => {
    if (mode === 'test') return <ClipboardList className="w-5 h-5 text-primary" />;
    return <FileText className="w-5 h-5 text-primary" />;
  };

  const getTestName = () => {
    if (mode === 'pyq-mock') {
      if ((pyqExam === 'INICET' || pyqExam === 'FMGE') && pyqSession) return `${pyqExam} ${pyqSession}`;
      return `${pyqExam} ${pyqYear}`;
    }
    return testName || `${source || 'Custom'} ${mode === 'test' ? 'Test' : 'Mock Test'}`;
  };

  const handleSubmit = () => {
    const mockTest: MockTest = {
      id: Date.now().toString(),
      date: new Date(),
      testName: getTestName(),
      source: source || 'Custom',
      totalQuestions,
      attemptedQuestions,
      correctAnswers,
      score: normalizedScore,
      percentile,
      rank,
      timeTaken,
      subjectScores: mode === 'test' ? [] : subjectScores,
      weakSubjects: mode === 'test' ? [] : weakSubjects,
      notes: notes || undefined
    };
    onLog(mockTest);
    onClose();
  };

  const isFullMode = mode === 'mock' || mode === 'pyq-mock';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-4 bottom-4 mx-auto max-w-lg overflow-y-auto bg-card rounded-2xl shadow-card-hover border border-border p-4 sm:p-6 z-50 sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-h-[90vh]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {getIcon()}
                <h2 className="text-xl font-bold">{getTitle()}</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Name / Source row — differs by mode */}
              {mode === 'pyq-mock' ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Exam</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['NEET PG', 'INICET', 'FMGE'].map(exam => (
                        <button
                          key={exam}
                          onClick={() => { setPyqExam(exam); setPyqSession(''); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            pyqExam === exam ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 hover:bg-secondary'
                          }`}
                        >
                          {exam}
                        </button>
                      ))}
                    </div>
                  </div>
                  {(pyqExam === 'INICET' || pyqExam === 'FMGE') ? (
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Session</label>
                      <div className="flex flex-wrap gap-1.5">
                        {(() => {
                          const years = Array.from({ length: pyqYearTo - pyqYearFrom + 1 }, (_, i) => pyqYearTo - i);
                          const sessions = pyqExam === 'INICET'
                            ? years.flatMap(y => [`May ${y}`, `Nov ${y}`])
                            : years.flatMap(y => [`June ${y}`, `Dec ${y}`]);
                          return sessions.map(s => (
                            <button
                              key={s}
                              onClick={() => setPyqSession(s)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                pyqSession === s ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 hover:bg-secondary'
                              }`}
                            >
                              {s}
                            </button>
                          ));
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Year</label>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.from({ length: pyqYearTo - pyqYearFrom + 1 }, (_, i) => pyqYearTo - i).map(y => (
                          <button
                            key={y}
                            onClick={() => setPyqYear(y)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              pyqYear === y ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 hover:bg-secondary'
                            }`}
                          >
                            {y}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Source</label>
                    <Input
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      placeholder="e.g., Marrow, Prepladder..."
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Test Name</label>
                    <Input
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      placeholder={mode === 'test' ? 'e.g., SWT Medicine' : 'e.g., Grand Test 1'}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Source</label>
                    <Input
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      placeholder="e.g., Marrow, Prepladder..."
                    />
                  </div>
                </div>
              )}

              {/* Questions */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium mb-1 block">Total</label>
                  <Input type="number" value={totalQuestions} onChange={(e) => setTotalQuestions(Number(e.target.value))} min={1} className="text-sm" />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium mb-1 block">Attempted</label>
                  <Input type="number" value={attemptedQuestions} onChange={(e) => setAttemptedQuestions(Number(e.target.value))} min={0} max={totalQuestions} className="text-sm" />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium mb-1 block">Correct</label>
                  <Input type="number" value={correctAnswers} onChange={(e) => setCorrectAnswers(Number(e.target.value))} min={0} max={attemptedQuestions} className="text-sm" />
                </div>
              </div>

              {/* Time & Rankings */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium mb-1 block">Time (min)</label>
                  <Input type="number" value={timeTaken} onChange={(e) => setTimeTaken(Number(e.target.value))} min={1} className="text-sm" />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium mb-1 block">Percentile</label>
                  <Input type="number" value={percentile || ''} onChange={(e) => setPercentile(e.target.value ? Number(e.target.value) : undefined)} placeholder="-" min={0} max={100} className="text-sm" />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium mb-1 block">Rank</label>
                  <Input type="number" value={rank || ''} onChange={(e) => setRank(e.target.value ? Number(e.target.value) : undefined)} placeholder="-" min={1} className="text-sm" />
                </div>
              </div>

              {/* Score Preview */}
              <div className="p-3 bg-secondary/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Score</p>
                    <p className="text-lg font-bold text-primary">{normalizedScore}<span className="text-[10px] text-muted-foreground">/800</span></p>
                  </div>
                  <div className="w-px h-10 bg-border" />
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Accuracy</p>
                    <p className={`text-lg font-bold ${
                      accuracy >= 75 ? 'text-green-500' : accuracy >= 60 ? 'text-yellow-500' : 'text-red-500'
                    }`}>{accuracy}%</p>
                  </div>
                  <div className="w-px h-10 bg-border" />
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Unattempted</p>
                    <p className="text-lg font-bold text-muted-foreground">{totalQuestions - attemptedQuestions}</p>
                  </div>
                </div>
              </div>

              {/* Subject Breakdown - only for mock/pyq-mock */}
              {isFullMode && (
                <>
                  <button
                    onClick={() => setShowSubjectBreakdown(!showSubjectBreakdown)}
                    className="w-full flex items-center justify-between p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <span className="text-sm font-medium">Subject-wise Breakdown</span>
                    {showSubjectBreakdown ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>

                  <AnimatePresence>
                    {showSubjectBreakdown && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-2 overflow-hidden"
                      >
                        {initialSubjects.map(subject => {
                          const score = subjectScores.find(s => s.subjectId === subject.id);
                          const subjectAccuracy = score?.accuracy || 0;
                          return (
                            <div key={subject.id} className="grid grid-cols-[1fr_60px_60px_40px] gap-2 items-center">
                              <span className="text-xs truncate">{subject.name}</span>
                              <Input type="number" placeholder="Total" value={score?.total || ''} onChange={(e) => handleSubjectScoreChange(subject.id, 'total', Number(e.target.value))} className="h-8 text-xs" />
                              <Input type="number" placeholder="✓" value={score?.correct || ''} onChange={(e) => handleSubjectScoreChange(subject.id, 'correct', Number(e.target.value))} className="h-8 text-xs" />
                              <span className={`text-xs font-medium text-center ${
                                subjectAccuracy >= 70 ? 'text-green-500' : subjectAccuracy >= 50 ? 'text-yellow-500' : (score?.total || 0) > 0 ? 'text-red-500' : 'text-muted-foreground'
                              }`}>
                                {(score?.total || 0) > 0 ? `${subjectAccuracy}%` : '-'}
                              </span>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Weak Subjects */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Weak Subjects
                      <span className="text-xs text-muted-foreground font-normal ml-1">(auto-selected if &lt;50%)</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {initialSubjects.map(subject => (
                        <button
                          key={subject.id}
                          onClick={() => toggleWeakSubject(subject.id)}
                          className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                            weakSubjects.includes(subject.id)
                              ? 'bg-destructive/20 text-destructive border border-destructive'
                              : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                          }`}
                        >
                          {subject.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Notes */}
              <div>
                <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Key insights, areas to improve..."
                  className="w-full h-20 px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none"
                />
              </div>

              <Button onClick={handleSubmit} className="w-full gradient-primary text-primary-foreground">
                <TrendingUp className="w-4 h-4 mr-2" />
                {mode === 'test' ? 'Log Test (+15 XP)' : mode === 'pyq-mock' ? 'Log PYQ Mock (+25 XP)' : 'Log Mock Test (+25 XP)'}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
