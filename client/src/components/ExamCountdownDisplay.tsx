/* Parvaz Focus - Exam Countdown Display Component
   Show upcoming exams and focus on weak subjects
*/

import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, Calendar, Target, Plus, X } from 'lucide-react';
import { addExam, getExamFocusRecommendation, getExamPriorityColor, getExamPriorityLabel, removeExam } from '@/lib/exam-countdown';

export function ExamCountdownDisplay() {
  const { state, updateState } = useAppContext();
  const [showAddExam, setShowAddExam] = useState(false);
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [weakAreas, setWeakAreas] = useState('');

  const countdown = state.examCountdown;
  const exams = countdown.exams.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleAddExam = () => {
    if (!subject || !examDate) return;

    const weakAreasList = weakAreas
      .split(',')
      .map(a => a.trim())
      .filter(a => a);

    const newState = addExam(state, subject, new Date(examDate), weakAreasList);
    updateState(newState);

    setSubject('');
    setExamDate('');
    setWeakAreas('');
    setShowAddExam(false);
  };

  const handleRemoveExam = (examId: string) => {
    const newState = removeExam(state, examId);
    updateState(newState);
  };

  if (exams.length === 0) {
    return (
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
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
                  <label className="text-sm font-semibold mb-1 block">Subject</label>
                  <Input
                    placeholder="e.g., Mathematics, Biology"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
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
                <div>
                  <label className="text-sm font-semibold mb-1 block">Weak Areas (comma-separated)</label>
                  <Input
                    placeholder="e.g., Calculus, Organic Chemistry"
                    value={weakAreas}
                    onChange={e => setWeakAreas(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddExam} className="w-full">
                  Add Exam
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <p className="text-sm text-blue-800">
          No exams scheduled yet. Add your upcoming exams to get personalized study recommendations.
        </p>
      </Card>
    );
  }

  const upcomingExam = countdown.upcomingExam;

  return (
    <div className="space-y-4">
      {/* Upcoming Exam Alert */}
      {upcomingExam && countdown.focusMode && (
        <Card className="p-4 bg-red-50/50 border-red-200/50 shadow-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-red-900 mb-1">
                {upcomingExam.subject} - {countdown.daysUntilNextExam} days away!
              </p>
              <p className="text-sm text-red-800 mb-2">
                {getExamFocusRecommendation(state)}
              </p>
              {upcomingExam.weakAreas.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {upcomingExam.weakAreas.map(area => (
                    <Badge key={area} variant="outline" className="bg-red-100 text-red-800 border-red-300">
                      {area}
                    </Badge>
                  ))}
                </div>
              )}
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
                  <label className="text-sm font-semibold mb-1 block">Subject</label>
                  <Input
                    placeholder="e.g., Mathematics, Biology"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
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
                <div>
                  <label className="text-sm font-semibold mb-1 block">Weak Areas (comma-separated)</label>
                  <Input
                    placeholder="e.g., Calculus, Organic Chemistry"
                    value={weakAreas}
                    onChange={e => setWeakAreas(e.target.value)}
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
          {exams.map((exam, index) => (
            <div
              key={exam.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                exam.id === upcomingExam?.id
                  ? 'bg-red-50/50 border-red-200/50'
                  : 'bg-secondary/20 border-border/30'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{exam.subject}</p>
                    <Badge className={getExamPriorityColor(exam.priority)}>
                      {getExamPriorityLabel(exam.priority)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(exam.date).toLocaleDateString()} • {exam.daysUntil} days away
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveExam(exam.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {exam.weakAreas.length > 0 && (
                <div className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <div className="flex flex-wrap gap-1">
                    {exam.weakAreas.map(area => (
                      <Badge key={area} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
