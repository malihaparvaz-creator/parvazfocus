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

  // If reflection is locked, cannot add
  if (today.reflectionLocked) {
    return false;
  }

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
  // Cannot edit if reflection is locked
  if (today.reflectionLocked) {
    return false;
  }

  // Can only edit if reflection exists and is from today
  if (today.reflection && isReflectionFromToday(today.reflection)) {
    return true;
  }

  return false;
}

export function getReflectionStatus(today: { reflection?: NightReflection; reflectionLocked?: boolean }): {
  canAdd: boolean;
  canEdit: boolean;
  isLocked: boolean;
  message: string;
} {
  const canAdd = canAddReflectionToday(today);
  const canEdit = canEditReflection(today);
  const isLocked = today.reflectionLocked || false;

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
