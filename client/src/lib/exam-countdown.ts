/* Parvaz Focus - Exam Countdown Utilities
   Manage exams and focus on weak subjects as exams approach
*/

import { AppState, Exam } from './types';
import { nanoid } from 'nanoid';

function toStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Add an exam to the countdown
 */
export function addExam(
  state: AppState,
  subject: string,
  date: Date,
  weakAreas: string[] = []
): AppState {
  const newState = { ...state };
  const normalizedDate = toStartOfDay(date);
  const now = toStartOfDay(new Date());
  const daysUntil = Math.ceil((normalizedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  const priority = daysUntil <= 7 ? 'critical' : daysUntil <= 14 ? 'high' : 'medium';

  const exam: Exam = {
    id: nanoid(),
    subject,
    date: normalizedDate,
    daysUntil,
    priority,
    weakAreas,
    focusSubjects: weakAreas,
    createdAt: new Date(),
  };

  newState.examCountdown.exams.push(exam);
  updateExamCountdown(newState);

  return newState;
}

/**
 * Update exam countdown state
 */
export function updateExamCountdown(state: AppState): void {
  const exams = state.examCountdown.exams;
  
  // Sort by date
  exams.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  // Recompute daysUntil and priority for each exam so values stay fresh across days
  const now = toStartOfDay(new Date());
  exams.forEach(exam => {
    const days = Math.ceil((toStartOfDay(new Date(exam.date)).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    exam.daysUntil = days;
    exam.priority = days <= 7 ? 'critical' : days <= 14 ? 'high' : 'medium';
  });

  // Get upcoming exam (first future date)
  const upcomingExam = exams.find(e => new Date(e.date).getTime() > now.getTime());

  state.examCountdown.upcomingExam = upcomingExam || null;
  state.examCountdown.daysUntilNextExam = upcomingExam 
    ? Math.max(0, Math.ceil((new Date(upcomingExam.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Enable focus mode if exam is within 14 days
  state.examCountdown.focusMode = state.examCountdown.daysUntilNextExam <= 14 && state.examCountdown.daysUntilNextExam > 0;

  // Set weak subjects focus
  state.examCountdown.weakSubjectsFocus = upcomingExam ? upcomingExam.weakAreas : [];
}

/**
 * Get exam priority color
 */
export function getExamPriorityColor(priority: string): string {
  switch (priority) {
    case 'critical':
      return 'text-foreground bg-destructive/12 dark:bg-destructive/22 border-destructive/30';
    case 'high':
      return 'text-foreground bg-accent/12 dark:bg-accent/22 border-accent/30';
    case 'medium':
      return 'text-foreground bg-secondary/12 dark:bg-secondary/22 border-secondary/30';
    default:
      return 'text-foreground bg-secondary/30';
  }
}

/**
 * Get exam priority label
 */
export function getExamPriorityLabel(priority: string): string {
  switch (priority) {
    case 'critical':
      return 'CRITICAL - Study Now! 🔴';
    case 'high':
      return 'High Priority 🟠';
    case 'medium':
      return 'Medium Priority 🟡';
    default:
      return 'Low Priority';
  }
}

/**
 * Get focus recommendation based on exam countdown
 */
export function getExamFocusRecommendation(state: AppState): string {
  const countdown = state.examCountdown;

  if (!countdown.upcomingExam) {
    return 'No exams scheduled. Focus on your current priorities. 📚';
  }

  const days = countdown.daysUntilNextExam;

  if (days <= 3) {
    return `${countdown.upcomingExam.subject} exam in ${days} days! Final revision mode. Focus on weak areas. 🔥`;
  }

  if (days <= 7) {
    return `${countdown.upcomingExam.subject} exam in ${days} days. Intensive study required. 💪`;
  }

  if (days <= 14) {
    return `${countdown.upcomingExam.subject} exam in ${days} days. Start focused preparation. 📖`;
  }

  return `${countdown.upcomingExam.subject} exam in ${days} days. Regular study pace. 🎯`;
}

/**
 * Get weak subjects to focus on
 */
export function getWeakSubjectsToFocus(state: AppState): string[] {
  return state.examCountdown.weakSubjectsFocus;
}

/**
 * Update exam weak areas
 */
export function updateExamWeakAreas(
  state: AppState,
  examId: string,
  weakAreas: string[]
): AppState {
  const newState = { ...state };
  const exam = newState.examCountdown.exams.find(e => e.id === examId);
  
  if (exam) {
    exam.weakAreas = weakAreas;
    exam.focusSubjects = weakAreas;
    updateExamCountdown(newState);
  }

  return newState;
}

/**
 * Remove an exam
 */
export function removeExam(state: AppState, examId: string): AppState {
  const newState = { ...state };
  newState.examCountdown.exams = newState.examCountdown.exams.filter(e => e.id !== examId);
  updateExamCountdown(newState);
  return newState;
}

/**
 * Get all exams sorted by date
 */
export function getExamsSortedByDate(state: AppState): Exam[] {
  return [...state.examCountdown.exams].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

/**
 * Get critical exams (within 7 days)
 */
export function getCriticalExams(state: AppState): Exam[] {
  return state.examCountdown.exams.filter(e => e.daysUntil <= 7 && e.daysUntil > 0);
}

/**
 * Get exam statistics
 */
export function getExamStats(state: AppState) {
  const exams = state.examCountdown.exams;
  const now = new Date();
  
  const upcoming = exams.filter(e => new Date(e.date) > now);
  const critical = upcoming.filter(e => e.daysUntil <= 7);
  const completed = exams.filter(e => new Date(e.date) <= now);

  return {
    totalExams: exams.length,
    upcomingExams: upcoming.length,
    criticalExams: critical.length,
    completedExams: completed.length,
    nextExamDays: upcoming.length > 0 ? upcoming[0].daysUntil : null,
  };
}
