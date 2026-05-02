/*
  Parvaz Focus - Mini Music Bar
  Shows at bottom of screen when music is playing on any page
  Tapping it navigates to Study > Music tab
*/

import { useMusic } from '@/contexts/MusicContext';
import { Volume2, VolumeX, Square } from 'lucide-react';
import { useLocation } from 'wouter';

export function MiniMusicBar() {
  const { playingTrack, volume, isMuted, stopTrack, toggleMute } = useMusic();
  const [, navigate] = useLocation();

  if (!playingTrack) return null;

  return (
    <div
      className="fixed bottom-0 left-20 right-0 z-40 flex items-center gap-3 px-5 py-2.5 border-t"
      style={{
        background: 'linear-gradient(135deg, rgba(167,139,250,0.12) 0%, rgba(216,180,254,0.08) 100%)',
        borderColor: 'rgba(167,139,250,0.25)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Animated bars */}
      <div className="flex gap-0.5 items-end h-4 flex-shrink-0">
        {[1,2,3,4].map(i => (
          <span
            key={i}
            className="w-0.5 bg-accent rounded-full animate-bounce"
            style={{ height: `${6 + (i % 3) * 4}px`, animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </div>

      {/* Track name — click to go to music tab */}
      <button
        onClick={() => navigate('/study')}
        className="flex-1 text-left"
      >
        <p className="text-xs font-semibold text-accent truncate">{playingTrack.name}</p>
        <p className="text-[10px] text-muted-foreground">Now playing · tap to open</p>
      </button>

      {/* Mute toggle */}
      <button
        onClick={toggleMute}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-accent transition-colors"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      {/* Stop */}
      <button
        onClick={stopTrack}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
        title="Stop music"
      >
        <Square className="w-4 h-4" />
      </button>
    </div>
  );
}
