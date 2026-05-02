/* Parvaz Focus - Subject Tracker Utilities
   Track performance across subjects with visual analytics
*/

import { AppState, SubjectPerformance, Task } from './types';

/**
 * Calculate performance score for a subject (0-100)
 * Based on: completion rate, average focus rating, XP earned
 */
export function calculateSubjectScore(performance: SubjectPerformance): number {
  const completionRate = performance.totalTasks > 0 
    ? (performance.tasksCompleted / performance.totalTasks) * 100 
    : 0;
  
  const xpScore = Math.min((performance.totalXPEarned / 500) * 100, 100);
  const focusScore = Math.min((performance.focusHours / 10) * 100, 100);
  
  // Weighted average: 50% completion, 30% XP, 20% focus hours
  const score = (completionRate * 0.5) + (xpScore * 0.3) + (focusScore * 0.2);
  
  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Update subject performance based on completed task
 */
export function updateSubjectPerformance(
  state: AppState,
  task: Task,
  xpEarned: number,
  focusDuration: number
): AppState {
  if (!task.subject) return state;

  const newState = { ...state };
  const subjectTracker = newState.user.stats.subjectTracker;
  
  // Find or create subject
  let subject = subjectTracker.subjects.find(s => s.subject === task.subject);
  
  if (!subject) {
    subject = {
      subject: task.subject,
      tasksCompleted: 0,
      totalTasks: 0,
      averageScore: 0,
      totalXPEarned: 0,
      focusHours: 0,
      trend: 'stable',
    };
    subjectTracker.subjects.push(subject);
  }
  
  // Update subject stats
  subject.totalTasks += 1;
  if (task.completed) {
    subject.tasksCompleted += 1;
  }
  subject.totalXPEarned += xpEarned;
  subject.focusHours += focusDuration / 60; // Convert minutes to hours
  subject.lastStudiedAt = new Date();
  subject.averageScore = calculateSubjectScore(subject);
  
  // Update all-time stats
  subjectTracker.allTimeStats.totalSubjectsStudied = subjectTracker.subjects.length;
  subjectTracker.allTimeStats.averagePerformance = Math.round(
    subjectTracker.subjects.reduce((sum, s) => sum + s.averageScore, 0) / 
    subjectTracker.subjects.length
  );
  
  // Find strongest and weakest
  const sorted = [...subjectTracker.subjects].sort((a, b) => b.averageScore - a.averageScore);
  subjectTracker.allTimeStats.strongestSubject = sorted[0]?.subject;
  subjectTracker.allTimeStats.weakestSubject = sorted[sorted.length - 1]?.subject;
  
  subjectTracker.lastUpdated = new Date();
  
  return newState;
}

/**
 * Get subjects ranked by performance
 */
export function getRankedSubjects(state: AppState): SubjectPerformance[] {
  return [...state.user.stats.subjectTracker.subjects].sort(
    (a, b) => b.averageScore - a.averageScore
  );
}

/**
 * Get top performers (strongest subjects)
 */
export function getTopPerformers(state: AppState, count: number = 3): SubjectPerformance[] {
  return getRankedSubjects(state).slice(0, count);
}

/**
 * Get bottom performers (weakest subjects)
 */
export function getBottomPerformers(state: AppState, count: number = 3): SubjectPerformance[] {
  return getRankedSubjects(state).slice(-count).reverse();
}

/**
 * Calculate trend for a subject (improving, stable, declining)
 * Based on last 7 days of activity
 */
export function calculateTrend(
  state: AppState,
  subject: string
): 'improving' | 'stable' | 'declining' {
  const subjectData = state.user.stats.subjectTracker.subjects.find(s => s.subject === subject);
  
  if (!subjectData || !subjectData.lastStudiedAt) {
    return 'stable';
  }
  
  // Simplified trend: if studied recently and high score, improving
  const daysSinceStudy = Math.floor(
    (new Date().getTime() - new Date(subjectData.lastStudiedAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceStudy > 7) {
    return 'declining';
  }
  
  if (subjectData.averageScore >= 75) {
    return 'improving';
  }
  
  if (subjectData.averageScore >= 50) {
    return 'stable';
  }
  
  return 'declining';
}

/**
 * Get performance color based on score
 */
export function getPerformanceColor(score: number): string {
  if (score >= 80) return 'text-green-600'; // Excellent
  if (score >= 60) return 'text-blue-600'; // Good
  if (score >= 40) return 'text-yellow-600'; // Fair
  return 'text-red-600'; // Needs improvement
}

/**
 * Get performance label
 */
export function getPerformanceLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Improvement';
}

/**
 * Get trend emoji
 */
export function getTrendEmoji(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving':
      return '📈';
    case 'stable':
      return '→';
    case 'declining':
      return '📉';
  }
}

/**
 * Get recommendations for weakest subjects
 */
export function getStudyRecommendations(state: AppState): string[] {
  const weakest = getBottomPerformers(state, 3);
  const recommendations: string[] = [];
  
  weakest.forEach(subject => {
    if (subject.averageScore < 40) {
      recommendations.push(`🔴 ${subject.subject}: Critical - Needs immediate focus`);
    } else if (subject.averageScore < 60) {
      recommendations.push(`🟡 ${subject.subject}: Fair - Increase practice sessions`);
    }
  });
  
  return recommendations;
}

/**
 * Calculate time to allocate to each subject based on performance
 */
export function getOptimalStudyAllocation(state: AppState): Map<string, number> {
  const subjects = state.user.stats.subjectTracker.subjects;
  const allocation = new Map<string, number>();
  
  // Total study hours per week: 20 hours
  const totalHours = 20;
  
  // Allocate more time to weaker subjects
  const totalScore = subjects.reduce((sum, s) => sum + (100 - s.averageScore), 0);
  
  subjects.forEach(subject => {
    const needScore = 100 - subject.averageScore;
    const proportion = totalScore > 0 ? needScore / totalScore : 1 / subjects.length;
    const hoursToAllocate = totalHours * proportion;
    allocation.set(subject.subject, Math.round(hoursToAllocate * 10) / 10);
  });
  
  return allocation;
}

/**
 * Get subject statistics for dashboard
 */
export function getSubjectStats(state: AppState) {
  const subjects = state.user.stats.subjectTracker.subjects;
  
  return {
    totalSubjects: subjects.length,
    averagePerformance: state.user.stats.subjectTracker.allTimeStats.averagePerformance,
    strongestSubject: state.user.stats.subjectTracker.allTimeStats.strongestSubject,
    weakestSubject: state.user.stats.subjectTracker.allTimeStats.weakestSubject,
    totalTasksAcrossSubjects: subjects.reduce((sum, s) => sum + s.totalTasks, 0),
    totalXPAcrossSubjects: subjects.reduce((sum, s) => sum + s.totalXPEarned, 0),
    totalFocusHours: subjects.reduce((sum, s) => sum + s.focusHours, 0),
  };
}
