/*
  Parvaz Focus - Notification Bridge
  Sends messages to Service Worker to schedule background notifications.
  Works even when the app is closed or in background.
*/

async function getSWRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.ready;
  } catch { return null; }
}

function sendToSW(msg: object) {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready.then(reg => {
    reg.active?.postMessage(msg);
  }).catch(() => {});
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function showNotificationNow(title: string, body: string, tag = 'parvaz') {
  if (Notification.permission !== 'granted') return;
  
  // Send to service worker for display (works even when app is closed)
  sendToSW({ 
    type: 'SHOW_NOTIFICATION', 
    title, 
    body,
    tag
  });
  
  // Also try direct notification as fallback
  navigator.serviceWorker.ready.then(reg => {
    reg.showNotification(title, {
      body,
      icon: '/icon192x192.png',
      badge: '/icon32x32.png',
      tag,
      data: { url: '/' },
    });
  }).catch(() => {
    // Fallback to basic notification
    new Notification(title, { body, icon: '/icon192x192.png' });
  });
}

// Persisted pending timers storage key
const PENDING_TIMERS_KEY = 'parvaz_pending_timers';

function readPendingTimers() {
  try { return JSON.parse(localStorage.getItem(PENDING_TIMERS_KEY) || '[]'); } catch { return []; }
}

function writePendingTimers(arr: any[]) {
  try { localStorage.setItem(PENDING_TIMERS_KEY, JSON.stringify(arr)); } catch {}
}

export function scheduleTimerNotification(timerId: string, durationMs: number, label: string) {
  // Save pending timer so app can re-schedule after reload / SW restart
  const fireAt = Date.now() + durationMs;
  const pending = readPendingTimers();
  const entry = { timerId, durationMs, label, fireAt };
  const filtered = pending.filter((p: any) => p.timerId !== timerId).concat(entry);
  writePendingTimers(filtered);

  sendToSW({ type: 'TIMER_STARTED', timerId, durationMs, label });
}

export function cancelTimerNotification(timerId: string) {
  const pending = readPendingTimers().filter((p: any) => p.timerId !== timerId);
  writePendingTimers(pending);
  sendToSW({ type: 'TIMER_STOPPED', timerId });
}

// Called on app startup to re-send pending timers to service worker (recover after reload)
export function reschedulePendingTimers() {
  if (!('serviceWorker' in navigator)) return;
  const now = Date.now();
  const pending = readPendingTimers();
  const validPending: any[] = [];
  pending.forEach((p: any) => {
    const remaining = Math.max(0, p.fireAt - now);
    // Only reschedule if remaining time is reasonable (more than 1 minute)
    // This prevents old/expired timers from firing repeatedly
    if (remaining > 60000) {
      validPending.push(p);
      sendToSW({ type: 'TIMER_STARTED', timerId: p.timerId, durationMs: remaining, label: p.label });
    }
  });
  // Update localStorage with only valid pending timers
  writePendingTimers(validPending);
}

// ── Pomodoro ────────────────────────────────────────────────────────────────

export function schedulePomodoroNotifications(cycleId: string, studyMs: number, breakMs: number, totalCycles: number) {
  sendToSW({ type: 'POMODORO_STARTED', studyMs, breakMs, totalCycles, cycleId });
}

export function cancelPomodoroNotifications(cycleId: string) {
  sendToSW({ type: 'POMODORO_STOPPED', cycleId });
}

// ── Simple Timer (handled above with persistence) ─────────────────────────────

// ── Water Reminder ───────────────────────────────────────────────────────────

export function scheduleWaterReminder(delayMs = 45 * 60 * 1000) {
  sendToSW({ type: 'WATER_REMIND', delayMs });
}

// ── Category Alerts ──────────────────────────────────────────────────────────

export function sendCategoryAlert(category: string, title: string, message: string) {
  sendToSW({ type: 'CATEGORY_ALERT', category, title, message });
}
