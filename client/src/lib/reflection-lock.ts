/* Reflection Lock System
   Prevents editing saved reflections
   Only allows new reflection the next day
*/

import { NightReflection } from '@/lib/types';

export function canAddReflectionToday(today: { reflection?: NightReflection; reflectionLocked?: boolean }): boolean {
  // If no reflection exists, can add
  if (!today.reflection) {
    return true;
  }

  // If the existing reflection is from today, do not allow another one
  if (isReflectionFromToday(today.reflection)) {
    return false;
  }

  // If the saved reflection is from a previous day, allow a new one regardless of an old lock flag
  return true;
}

export function isReflectionFromToday(reflection: NightReflection | undefined): boolean {
  if (!reflection) return false;

  const today = new Date();
  const reflectionDate = new Date(reflection.date);

  return (
    today.getFullYear() === reflectionDate.getFullYear() &&
    today.getMonth() === reflectionDate.getMonth() &&
    today.getDate() === reflectionDate.getDate()
  );
}

export function lockReflectionForDay(): boolean {
  // Reflection is locked after being saved for the day
  return true;
}

export function canEditReflection(today: { reflection?: NightReflection; reflectionLocked?: boolean }): boolean {
  // Can only edit a reflection that exists for today and is not locked
  if (!today.reflection || !isReflectionFromToday(today.reflection)) {
    return false;
  }

  if (today.reflectionLocked) {
    return false;
  }

  return true;
}

export function getReflectionStatus(today: { reflection?: NightReflection; reflectionLocked?: boolean }): {
  canAdd: boolean;
  canEdit: boolean;
  isLocked: boolean;
  message: string;
} {
  const canAdd = canAddReflectionToday(today);
  const canEdit = canEditReflection(today);
  const isLocked = today.reflectionLocked && today.reflection && isReflectionFromToday(today.reflection);

  let message = '';
  if (isLocked && today.reflection) {
    message = 'Your reflection for today is locked. You can add a new reflection tomorrow.';
  } else if (!canAdd) {
    message = 'You can only add one reflection per day. Come back tomorrow!';
  } else if (canAdd && !today.reflection) {
    message = 'Add your reflection for today';
  }

  return { canAdd, canEdit, isLocked, message };
}
