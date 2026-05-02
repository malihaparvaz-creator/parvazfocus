/* Parvaz Focus - Subject Tracker Component
   Visual performance bars for strongest and weakest subjects
*/

import { useAppContext } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  getRankedSubjects,
  getTopPerformers,
  getBottomPerformers,
  getPerformanceColor,
  getPerformanceLabel,
  getTrendEmoji,
  getStudyRecommendations,
  getOptimalStudyAllocation,
  getSubjectStats,
} from '@/lib/subject-tracker';
import { TrendingUp, TrendingDown, Minus, AlertCircle, Trophy, Target } from 'lucide-react';

export function SubjectTracker() {
  const { state } = useAppContext();
  const subjects = state.user.stats.subjectTracker.subjects;

  if (subjects.length === 0) {
    return (
      <Card className="p-8 text-center bg-secondary/20 border-dashed shadow-md">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No subjects tracked yet. Add tasks with subjects to start tracking.</p>
      </Card>
    );
  }

  const topPerformers = getTopPerformers(state, 3);
  const bottomPerformers = getBottomPerformers(state, 3);
  const recommendations = getStudyRecommendations(state);
  const studyAllocation = getOptimalStudyAllocation(state);
  const stats = getSubjectStats(state);

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview" className="gap-1">
          <Target className="w-4 h-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="strongest" className="gap-1">
          <Trophy className="w-4 h-4" />
          Strongest
        </TabsTrigger>
        <TabsTrigger value="weakest" className="gap-1">
          <AlertCircle className="w-4 h-4" />
          Weakest
        </TabsTrigger>
        <TabsTrigger value="allocation" className="gap-1">
          <TrendingUp className="w-4 h-4" />
          Plan
        </TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 shadow-md">
            <p className="text-xs text-muted-foreground mb-1">Total Subjects</p>
            <p className="text-3xl font-bold">{stats.totalSubjects}</p>
          </Card>
          <Card className="p-4 shadow-md">
            <p className="text-xs text-muted-foreground mb-1">Avg Performance</p>
            <p className="text-3xl font-bold text-accent">{stats.averagePerformance}%</p>
          </Card>
          <Card className="p-4 shadow-md">
            <p className="text-xs text-muted-foreground mb-1">Total Tasks</p>
            <p className="text-3xl font-bold">{stats.totalTasksAcrossSubjects}</p>
          </Card>
          <Card className="p-4 shadow-md">
            <p className="text-xs text-muted-foreground mb-1">Focus Hours</p>
            <p className="text-3xl font-bold">{stats.totalFocusHours.toFixed(1)}h</p>
          </Card>
        </div>

        {/* All Subjects Ranked */}
        <Card className="p-6 shadow-md">
          <h3 className="font-semibold mb-4">All Subjects (Ranked by Performance)</h3>
          <div className="space-y-4">
            {getRankedSubjects(state).map((subject, index) => (
              <SubjectPerformanceBar key={subject.subject} subject={subject} rank={index + 1} />
            ))}
          </div>
        </Card>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Card className="p-4 bg-yellow-50/50 border-yellow-200/50 shadow-md">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              Study Recommendations
            </h4>
            <ul className="space-y-2">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-muted-foreground">
                  {rec}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </TabsContent>

      {/* Strongest Subjects Tab */}
      <TabsContent value="strongest" className="space-y-4">
        <Card className="p-6 bg-green-50/50 border-green-200/50 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold">Your Strongest Subjects</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Keep maintaining these subjects while focusing on weaker areas.
          </p>
          <div className="space-y-4">
            {topPerformers.map((subject, index) => (
              <div key={subject.subject} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                    <div>
                      <p className="font-semibold">{subject.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {subject.tasksCompleted}/{subject.totalTasks} tasks completed
                      </p>
                    </div>
                  </div>
                  <Badge className={`${getPerformanceColor(subject.averageScore)} bg-transparent border`}>
                    {subject.averageScore}%
                  </Badge>
                </div>
                <Progress value={subject.averageScore} className="h-2" />
              </div>
            ))}
          </div>
        </Card>
      </TabsContent>

      {/* Weakest Subjects Tab */}
      <TabsContent value="weakest" className="space-y-4">
        <Card className="p-6 bg-red-50/50 border-red-200/50 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold">Focus Areas for Improvement</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            These subjects need more attention. Increase study sessions and practice.
          </p>
          <div className="space-y-4">
            {bottomPerformers.map((subject, index) => (
              <div key={subject.subject} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{subject.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {subject.tasksCompleted}/{subject.totalTasks} tasks completed
                    </p>
                  </div>
                  <Badge className={`${getPerformanceColor(subject.averageScore)} bg-transparent border`}>
                    {subject.averageScore}%
                  </Badge>
                </div>
                <Progress value={subject.averageScore} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Last studied: {subject.lastStudiedAt ? new Date(subject.lastStudiedAt).toLocaleDateString() : 'Never'}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </TabsContent>

      {/* Study Allocation Tab */}
      <TabsContent value="allocation" className="space-y-4">
        <Card className="p-6 shadow-md">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-accent" />
            Optimal Weekly Study Plan (20 hours)
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Allocate more time to weaker subjects for balanced improvement.
          </p>
          <div className="space-y-4">
            {Array.from(studyAllocation.entries()).map(([subject, hours]) => {
              const subjectData = subjects.find(s => s.subject === subject);
              const percentage = (hours / 20) * 100;
              return (
                <div key={subject} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{subject}</p>
                      <p className="text-xs text-muted-foreground">
                        Current: {subjectData?.averageScore || 0}%
                      </p>
                    </div>
                    <Badge variant="outline">{hours}h/week</Badge>
                  </div>
                  <Progress value={percentage} className="h-3" />
                  <p className="text-xs text-muted-foreground text-right">{Math.round(percentage)}% of weekly time</p>
                </div>
              );
            })}
          </div>
          <div className="mt-6 p-4 bg-secondary/30 rounded-lg border border-border/50">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Tip:</strong> Follow this allocation to improve weak subjects while maintaining strong ones. Adjust based on upcoming exams or deadlines.
            </p>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function SubjectPerformanceBar({
  subject,
  rank,
}: {
  subject: any;
  rank: number;
}) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-sm font-semibold text-muted-foreground w-6">#{rank}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold">{subject.subject}</p>
              {getTrendIcon(subject.trend)}
            </div>
            <p className="text-xs text-muted-foreground">
              {subject.tasksCompleted}/{subject.totalTasks} tasks • {subject.focusHours.toFixed(1)}h focus
            </p>
          </div>
        </div>
        <div className="text-right">
          <Badge className={`${getPerformanceColor(subject.averageScore)} bg-transparent border`}>
            {subject.averageScore}%
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">{getPerformanceLabel(subject.averageScore)}</p>
        </div>
      </div>
      <Progress value={subject.averageScore} className="h-2" />
    </div>
  );
}
