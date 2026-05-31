/* Parvaz Focus - Exam Countdown Display Component
   Show upcoming exams and focus on weak subjects
*/

import { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, Calendar, Plus, X } from 'lucide-react';
import { addExam, getExamFocusRecommendation, getExamPriorityColor, getExamPriorityLabel, parseExamDateInput, removeExam, updateExamCountdown } from '@/lib/exam-countdown';

export function ExamCountdownDisplay() {
  const { state, updateState } = useAppContext();
  const [showAddExam, setShowAddExam] = useState(false);
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');

  useEffect(() => {
    updateState((prev) => {
      const next = { ...prev };
      updateExamCountdown(next);
      return next;
    });
    const interval = setInterval(() => {
      updateState((prev) => {
        const next = { ...prev };
        updateExamCountdown(next);
        return next;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [updateState]);

  const countdown = state.examCountdown;
  const exams = useMemo(
    () => [...countdown.exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [countdown.exams]
  );

  const handleAddExam = () => {
    if (!examName.trim() || !examDate) return;

    updateState(prev => addExam(prev, examName.trim(), parseExamDateInput(examDate), []));

    setExamName('');
    setExamDate('');
    setShowAddExam(false);
  };

  const handleRemoveExam = (examId: string) => {
    updateState(prev => removeExam(prev, examId));
  };

  if (exams.length === 0) {
    return (
      <Card className="p-6 bg-secondary/10 dark:bg-secondary/20 border-border shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2 text-foreground">
            <Calendar className="w-5 h-5 text-accent" />
            Exam Countdown
          </h3>
          <Dialog open={showAddExam} onOpenChange={setShowAddExam}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1">
                <Plus className="w-4 h-4" />
                Add Exam
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Upcoming Exam</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-1 block">Exam</label>
                  <Input
                    placeholder="e.g., Biology, Mathematics"
                    value={examName}
                    onChange={e => setExamName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block">Exam Date</label>
                  <Input
                    type="date"
                    value={examDate}
                    onChange={e => setExamDate(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddExam} className="w-full">
                  Add Exam
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <p className="text-sm text-muted-foreground">
          No exams scheduled yet. Add your upcoming exams to get personalized study recommendations.
        </p>
      </Card>
    );
  }

  const upcomingExam = countdown.upcomingExam;

  return (
    <div className="space-y-4">
      {upcomingExam && (
        <Card className="p-4 border-accent/30 bg-accent/10 shadow-md">
          <p className="text-sm text-muted-foreground">Next exam</p>
          <p className="text-lg font-bold text-foreground">
            {upcomingExam.subject} — {countdown.daysUntilNextExam === 0 ? 'Today' : `${countdown.daysUntilNextExam} day(s) left`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(upcomingExam.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </Card>
      )}

      {/* Upcoming Exam Alert */}
      {upcomingExam && countdown.focusMode && (
        <Card className="p-4 bg-destructive/10 dark:bg-destructive/20 border-destructive/20 shadow-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex-1">
                <p className="font-semibold text-foreground mb-1">
                  {upcomingExam.subject} - {countdown.daysUntilNextExam} days away!
                </p>
              <p className="text-sm text-muted-foreground mb-2">
                {getExamFocusRecommendation(state)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* All Exams */}
      <Card className="p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" />
            Your Exams ({exams.length})
          </h3>
          <Dialog open={showAddExam} onOpenChange={setShowAddExam}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Upcoming Exam</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-1 block">Exam</label>
                  <Input
                    placeholder="e.g., Physics, Chemistry"
                    value={examName}
                    onChange={e => setExamName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block">Exam Date</label>
                  <Input
                    type="date"
                    value={examDate}
                    onChange={e => setExamDate(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddExam} className="w-full">
                  Add Exam
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                exam.id === upcomingExam?.id
                  ? 'bg-destructive/10 dark:bg-destructive/20 border-destructive/20'
                  : 'bg-secondary/10 dark:bg-secondary/20 border-border/30'
              }`}
            >
              <div className="grid grid-cols-12 items-center gap-2">
                <div className="col-span-4 text-sm text-muted-foreground">
                  {new Date(exam.date).toLocaleDateString()}
                </div>
                <div className="col-span-5 font-semibold">
                  {exam.subject}
                </div>
                <div className="col-span-2">
                  <Badge className={getExamPriorityColor(exam.priority)}>
                    {exam.daysUntil <= 0 ? 'Today' : `${exam.daysUntil}d`}
                  </Badge>
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => handleRemoveExam(exam.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label={`Remove ${exam.subject} exam`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {getExamPriorityLabel(exam.priority)}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
