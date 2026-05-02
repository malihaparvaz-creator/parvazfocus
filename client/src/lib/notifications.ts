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

// ── Pomodoro ────────────────────────────────────────────────────────────────

export function schedulePomodoroNotifications(cycleId: string, studyMs: number, breakMs: number) {
  sendToSW({ type: 'POMODORO_STARTED', studyMs, breakMs, cycleId });
}

export function cancelPomodoroNotifications(cycleId: string) {
  sendToSW({ type: 'POMODORO_STOPPED', cycleId });
}

// ── Simple Timer ─────────────────────────────────────────────────────────────

export function scheduleTimerNotification(timerId: string, durationMs: number, label: string) {
  sendToSW({ type: 'TIMER_STARTED', timerId, durationMs, label });
}

export function cancelTimerNotification(timerId: string) {
  sendToSW({ type: 'TIMER_STOPPED', timerId });
}

// ── Water Reminder ───────────────────────────────────────────────────────────

export function scheduleWaterReminder(delayMs = 45 * 60 * 1000) {
  sendToSW({ type: 'WATER_REMIND', delayMs });
}

// ── Category Alerts ──────────────────────────────────────────────────────────

export function sendCategoryAlert(category: string, title: string, message: string) {
  sendToSW({ type: 'CATEGORY_ALERT', category, title, message });
}
