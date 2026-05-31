/* Subject name normalization — keeps task progress in sync with Settings subjects */

import { SubjectPerformance } from './types';

/** Trim and lowercase for comparisons */
export function subjectKey(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Map a raw task subject to a canonical bucket:
 * - exact match (case-insensitive) to a defined subject
 * - partial match (e.g. "English Literature" → "English")
 * - otherwise "Other"
 */
export function resolveSubjectBucket(raw: string, definedSubjects: string[]): string {
  const trimmed = raw.trim();
  if (!trimmed) return 'Other';

  const lower = subjectKey(trimmed);
  const defined = definedSubjects.filter(Boolean);

  const exact = defined.find(ds => subjectKey(ds) === lower);
  if (exact) return exact;

  const byLength = [...defined].sort((a, b) => b.length - a.length);
  for (const ds of byLength) {
    const dsKey = subjectKey(ds);
    if (lower.includes(dsKey) || dsKey.includes(lower)) {
      return ds;
    }
  }

  return 'Other';
}

/** Sum completed tasks for a settings subject (handles duplicate tracker rows) */
export function getSubjectTasksCompleted(
  performances: SubjectPerformance[],
  settingsSubject: string,
  definedSubjects: string[]
): number {
  const targetKey = subjectKey(settingsSubject);
  return performances.reduce((sum, perf) => {
    const bucket = resolveSubjectBucket(perf.subject, definedSubjects);
    return subjectKey(bucket) === targetKey ? sum + perf.tasksCompleted : sum;
  }, 0);
}

/** Sum completed tasks bucketed as Other */
export function getOtherTasksCompleted(
  performances: SubjectPerformance[],
  definedSubjects: string[]
): number {
  return performances.reduce((sum, perf) => {
    const bucket = resolveSubjectBucket(perf.subject, definedSubjects);
    return bucket === 'Other' ? sum + perf.tasksCompleted : sum;
  }, 0);
}
