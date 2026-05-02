// Parvaz Focus — Firebase
// Firestore sync only. No auth. Works offline via IndexedDB persistence.

import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import type { AppState } from './types';

const firebaseConfig = {
  apiKey: "AIzaSyDnFEBV6zSGjhLF83Us4c1wPktPX30InP4",
  authDomain: "parvaz-focus.firebaseapp.com",
  projectId: "parvaz-focus",
  storageBucket: "parvaz-focus.firebasestorage.app",
  messagingSenderId: "238637772262",
  appId: "1:238637772262:web:daa1055404356d3a50fa27",
  measurementId: "G-FK89GEZ0KJ",
};

// Init once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

// Single document per owner — personal app, one user
const OWNER_ID_KEY = 'parvaz-focus-owner';
const DEFAULT_OWNER_ID = 'owner-main';

export function getUserId(): string {
  // Optional: set VITE_FIREBASE_OWNER_ID in .env to override
  const fromEnv = (import.meta as any).env?.VITE_FIREBASE_OWNER_ID as string | undefined;
  if (fromEnv?.trim()) return fromEnv.trim();

  let id = localStorage.getItem(OWNER_ID_KEY);
  if (!id) {
    id = DEFAULT_OWNER_ID;
    localStorage.setItem(OWNER_ID_KEY, id);
  }
  return id;
}

const userRef = () => doc(db, 'users', getUserId());

// Recursively convert Firestore Timestamps → JS Dates
function hydrateDates(obj: any): any {
  if (obj instanceof Timestamp) return obj.toDate();
  if (Array.isArray(obj)) return obj.map(hydrateDates);
  if (obj && typeof obj === 'object') {
    const out: any = {};
    for (const k of Object.keys(obj)) out[k] = hydrateDates(obj[k]);
    return out;
  }
  return obj;
}

// One-time load on startup
export async function loadFromFirestore(): Promise<AppState | null> {
  try {
    const snap = await getDoc(userRef());
    if (!snap.exists()) return null;
    return hydrateDates(snap.data()?.state ?? null) as AppState;
  } catch {
    return null;
  }
}

// Save — fire and forget, silent on offline
export function saveToFirestore(state: AppState): void {
  try {
    setDoc(
      userRef(),
      { state: JSON.parse(JSON.stringify(state)), updatedAt: Timestamp.now() },
      { merge: true }
    ).catch(() => {});
  } catch {}
}

// Real-time subscription for cross-device sync
export function subscribeToFirestoreState(
  onChange: (remoteState: AppState | null, remoteUpdatedAtMs: number | null) => void
): Unsubscribe {
  return onSnapshot(
    userRef(),
    (snap) => {
      if (!snap.exists()) { onChange(null, null); return; }
      const data = snap.data();
      const updatedAt = data?.updatedAt;
      const remoteUpdatedAtMs = updatedAt instanceof Timestamp ? updatedAt.toMillis() : null;
      const remoteState = hydrateDates(data?.state ?? null) as AppState | null;
      onChange(remoteState, remoteUpdatedAtMs);
    },
    () => {} // silent on error — local state still works
  );
}
