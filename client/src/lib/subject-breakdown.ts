/*
  Subject Breakdown Utility
  Calculates time spent per subject from completed tasks
*/

import { AppState } from './types';

export interface SubjectBreakdown {
  subject: string;
  timeSpent: number; // in minutes
  percentage: number;
  tasksCompleted: number;
  color: string;
}

const SUBJECT_COLORS = [
  '#d8b4fe', // Purple
  '#a78bfa', // Violet
  '#c084fc', // Fuchsia
  '#f472b6', // Pink
  '#fb7185', // Rose
  '#fca5a5', // Red
  '#fdba74', // Orange
  '#fcd34d', // Yellow
  '#bef264', // Lime
  '#86efac', // Green
  '#67e8f9', // Cyan
  '#06b6d4', // Sky
];

/**
 * Calculate time breakdown by subject from completed tasks
 */
export function calculateSubjectBreakdown(state: AppState): SubjectBreakdown[] {
  const subjectMap: Map<string, { timeSpent: number; tasksCompleted: number }> = new Map();

  // Iterate through all completed tasks
  state.today.mission.tasks.forEach(task => {
    if (task.completed && task.subject) {
      const subject = task.subject;
      const timeSpent = task.estimatedTime || 25; // Default to 25 minutes

      if (subjectMap.has(subject)) {
        const existing = subjectMap.get(subject)!;
        existing.timeSpent += timeSpent;
        existing.tasksCompleted += 1;
      } else {
        subjectMap.set(subject, {
          timeSpent,
          tasksCompleted: 1,
        });
      }
    }
  });

  // Convert to array and calculate percentages
  const totalTime = Array.from(subjectMap.values()).reduce((sum, item) => sum + item.timeSpent, 0);

  const breakdown: SubjectBreakdown[] = Array.from(subjectMap.entries()).map(
    ([subject, data], index) => ({
      subject,
      timeSpent: data.timeSpent,
      percentage: totalTime > 0 ? (data.timeSpent / totalTime) * 100 : 0,
      tasksCompleted: data.tasksCompleted,
      color: SUBJECT_COLORS[index % SUBJECT_COLORS.length],
    })
  );

  // Sort by time spent (descending)
  return breakdown.sort((a, b) => b.timeSpent - a.timeSpent);
}

/**
 * Get total time spent on subjects
 */
export function getTotalSubjectTime(breakdown: SubjectBreakdown[]): number {
  return breakdown.reduce((sum, item) => sum + item.timeSpent, 0);
}

/**
 * Format time for display
 */
export function formatSubjectTime(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
