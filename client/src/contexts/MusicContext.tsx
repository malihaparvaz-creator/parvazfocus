/*
  Parvaz Focus - Global Music Context
  Lives at app root so music NEVER stops when user navigates between pages.
  Only stops when user explicitly presses Stop or closes the app.
*/

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

export interface MusicTrack {
  id: string;
  name: string;
  description: string;
  bestFor: string;
  youtubeId: string;
  tag: string;
  isCustom?: boolean;
}

interface MusicContextType {
  playingTrack: MusicTrack | null;
  volume: number;
  isMuted: boolean;
  playTrack: (track: MusicTrack) => void;
  stopTrack: () => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const VOLUME_KEY = 'parvaz-music-volume';

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [playingTrack, setPlayingTrack] = useState<MusicTrack | null>(null);
  const [volume, setVolumeState] = useState<number>(() => {
    try { return parseInt(localStorage.getItem(VOLUME_KEY) || '80'); } catch { return 80; }
  });
  const [isMuted, setIsMuted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const sendVolumeToIframe = useCallback((vol: number) => {
    try {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: 'setVolume', args: [vol] }), '*'
      );
    } catch {}
  }, []);

  // Send volume after iframe loads
  useEffect(() => {
    if (!playingTrack) return;
    const t = setTimeout(() => sendVolumeToIframe(isMuted ? 0 : volume), 2000);
    return () => clearTimeout(t);
  }, [playingTrack, volume, isMuted]);

  const playTrack = useCallback((track: MusicTrack) => {
    setPlayingTrack(prev => prev?.id === track.id ? null : track);
  }, []);

  const stopTrack = useCallback(() => setPlayingTrack(null), []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    localStorage.setItem(VOLUME_KEY, String(v));
    if (!isMuted) sendVolumeToIframe(v);
  }, [isMuted, sendVolumeToIframe]);

  const toggleMute = useCallback(() => {
    setIsMuted(m => {
      sendVolumeToIframe(!m ? 0 : volume);
      return !m;
    });
  }, [volume, sendVolumeToIframe]);

  return (
    <MusicContext.Provider value={{ playingTrack, volume, isMuted, playTrack, stopTrack, setVolume, toggleMute }}>
      {children}

      {/* GLOBAL persistent audio player - rendered once at root, never unmounts */}
      {playingTrack && (
        <div
          ref={containerRef}
          style={{
            position: 'fixed',
            left: '-99999px',
            top: '-99999px',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: -1,
          }}
          aria-hidden="true"
        >
          <iframe
            ref={iframeRef}
            key={playingTrack.id}
            width="1"
            height="1"
            src={`https://www.youtube.com/embed/${playingTrack.youtubeId}?autoplay=1&controls=0&loop=1&playlist=${playingTrack.youtubeId}&enablejsapi=1&origin=${window.location.origin}`}
            allow="autoplay; encrypted-media; gyroscope"
            allowFullScreen={false}
            title={playingTrack.name}
          />
        </div>
      )}
    </MusicContext.Provider>
  );
}

export function useMusic(): MusicContextType {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used within MusicProvider');
  return ctx;
}
