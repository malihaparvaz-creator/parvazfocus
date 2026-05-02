// Parvaz Focus - Service Worker
// Handles: offline caching, background notifications, scheduled timer alerts

const CACHE_NAME = 'parvaz-focus-v2';
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json', '/icon192x192.png', '/icon512x512.png'];

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(STATIC_ASSETS).catch(() => {})));
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

// ── Fetch (offline support) ───────────────────────────────────────────────────
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith('http')) return;
  if (e.request.url.includes('/api/') || e.request.url.includes('youtube') ||
      e.request.url.includes('fonts.gstatic') || e.request.url.includes('analytics')) return;

  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok && e.request.mode === 'navigate') {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() =>
      caches.match(e.request).then(cached =>
        cached || (e.request.mode === 'navigate' ? caches.match('/index.html') : new Response('Offline', { status: 503 }))
      )
    )
  );
});

// ── Scheduled notification timers ────────────────────────────────────────────
// Map of active timers: { id -> timeoutId }
const activeTimers = new Map();

function scheduleNotification(id, delayMs, title, body, tag) {
  // Clear existing timer for this id if any
  if (activeTimers.has(id)) {
    clearTimeout(activeTimers.get(id));
    activeTimers.delete(id);
  }
  if (delayMs <= 0) return;

  const timerId = setTimeout(() => {
    self.registration.showNotification(title, {
      body,
      icon: '/icon192x192.png',
      badge: '/icon32x32.png',
      tag,
      requireInteraction: false,
      vibrate: [200, 100, 200],
      data: { url: '/', timestamp: Date.now() },
    });
    activeTimers.delete(id);
  }, delayMs);

  activeTimers.set(id, timerId);
}

function cancelTimer(id) {
  if (activeTimers.has(id)) {
    clearTimeout(activeTimers.get(id));
    activeTimers.delete(id);
  }
}

// ── Message handler (from app) ────────────────────────────────────────────────
self.addEventListener('message', e => {
  const msg = e.data;
  if (!msg || !msg.type) return;

  switch (msg.type) {

    // Pomodoro: schedule "break time!" after study phase
    case 'POMODORO_STARTED': {
      const { studyMs, breakMs, cycleId } = msg;
      // After study time → break notification
      scheduleNotification(
        `pomo_break_${cycleId}`,
        studyMs,
        '⏰ Pomodoro Complete!',
        `25 mins done! Take your ${Math.round(breakMs/60000)}-minute break now. You earned it.`,
        'pomodoro'
      );
      // After study + break → back to study
      scheduleNotification(
        `pomo_study_${cycleId}`,
        studyMs + breakMs,
        '📚 Break Over — Back to Work!',
        'Your break is done. Lock in and start your next Pomodoro.',
        'pomodoro-resume'
      );
      break;
    }

    // Pomodoro paused/stopped → cancel pending notifications
    case 'POMODORO_STOPPED': {
      const { cycleId } = msg;
      cancelTimer(`pomo_break_${cycleId}`);
      cancelTimer(`pomo_study_${cycleId}`);
      break;
    }

    // Simple timer: notify when done
    case 'TIMER_STARTED': {
      const { timerId, durationMs, label } = msg;
      scheduleNotification(
        `timer_${timerId}`,
        durationMs,
        '⏱️ Timer Complete!',
        `${label || 'Your timer'} is done!`,
        'simple-timer'
      );
      break;
    }

    case 'TIMER_STOPPED': {
      cancelTimer(`timer_${msg.timerId}`);
      break;
    }

    // Water reminder: schedule next one
    case 'WATER_REMIND': {
      const delayMs = msg.delayMs || 45 * 60 * 1000;
      scheduleNotification(
        'water',
        delayMs,
        '💧 Drink Water!',
        'Stay sharp — 45 minutes have passed. Drink a glass of water now.',
        'water-reminder'
      );
      break;
    }

    // Category time limit reached
    case 'CATEGORY_ALERT': {
      const { category, message, title } = msg;
      self.registration.showNotification(`Parvaz Focus — ${title}`, {
        body: message,
        icon: '/icon192x192.png',
        badge: '/icon32x32.png',
        tag: `category-${category}`,
        requireInteraction: false,
        vibrate: [100, 50, 100],
        data: { url: '/' },
      });
      break;
    }

    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    // Immediate notification display
    case 'SHOW_NOTIFICATION': {
      const { title, body, tag } = msg;
      self.registration.showNotification(title, {
        body,
        icon: '/icon192x192.png',
        badge: '/icon32x32.png',
        tag: tag || 'parvaz-reminder',
        requireInteraction: false,
        vibrate: [200, 100, 200],
        data: { url: '/', timestamp: Date.now() },
      });
      break;
    }
  }
});

// ── Notification click → open app ────────────────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          return;
        }
      }
      return clients.openWindow(url);
    })
  );
});
