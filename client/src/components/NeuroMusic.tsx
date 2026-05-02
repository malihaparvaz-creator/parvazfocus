/*
  Parvaz Focus - Neuroscience-Backed Music Player
  Uses global MusicContext so music persists across ALL page navigation.
  Music only stops when user explicitly presses Stop.
*/

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Play, Square, Plus, Trash2, Volume2, VolumeX, ExternalLink } from 'lucide-react';
import { useMusic, MusicTrack } from '@/contexts/MusicContext';

const DEFAULT_TRACKS: MusicTrack[] = [
  {
    id: 'brown_noise',
    name: 'Brown Noise',
    description: 'Deeper and softer than white noise. Masks environmental distractions without fatiguing the auditory cortex over long sessions.',
    bestFor: 'Blocking distractions, long study sessions',
    youtubeId: 'RqzGzwTY-6w',
    tag: 'Noise',
  },
  {
    id: 'alpha_waves',
    name: 'Alpha Waves (10Hz)',
    description: 'Alpha frequencies (8–12Hz) promote relaxed alertness — the ideal brain state for absorbing new material without stress.',
    bestFor: 'Reading, note-taking, revision',
    youtubeId: 'WPni755-Krg',
    tag: 'Alpha',
  },
  {
    id: 'white_noise',
    name: 'White Noise',
    description: 'Flat frequency spectrum creates a consistent audio mask. Prevents sudden sounds from breaking concentration and flow state.',
    bestFor: 'Noisy environments, preventing interruptions',
    youtubeId: 'nMfPqeZjc2c',
    tag: 'Noise',
  },
  {
    id: 'lofi_focus',
    name: 'Lo-Fi Focus Beats',
    description: 'Low-information-density music with a steady 60–80 BPM rhythm. Activates focus without overstimulating the prefrontal cortex.',
    bestFor: 'Light study, creative work, warm-up sessions',
    youtubeId: 'jfKfPfyJRdk',
    tag: 'Lo-Fi',
  },
  {
    id: 'deep_focus',
    name: 'Deep Focus Music',
    description: 'Ambient instrumental composed for sustained concentration. Minimal melodic variation keeps your brain from getting distracted by the music itself.',
    bestFor: 'Deep work, problem-solving, writing',
    youtubeId: 'lTRiuFIWV54',
    tag: 'Focus',
  },
  {
    id: 'classical_study',
    name: 'Classical Study',
    description: 'Structured classical compositions activate spatial-temporal reasoning and improve memory encoding during study sessions.',
    bestFor: 'Maths, science, analytical work',
    youtubeId: '4Tr0otuiQuU',
    tag: 'Classical',
  },
  {
    id: 'rain_sounds',
    name: 'Rain & Thunder',
    description: 'Pink noise from rainfall calms the amygdala (stress centre) while maintaining gentle background stimulation for focus.',
    bestFor: 'Stress reduction, relaxed deep work',
    youtubeId: 'mPZkdNFkNps',
    tag: 'Nature',
  },
  {
    id: 'binaural_focus',
    name: 'Binaural Beats (Focus)',
    description: 'Slightly different frequencies in each ear cause the brain to perceive a third beat that entrains neural oscillations for focus. Use headphones.',
    bestFor: 'Memory consolidation, exam prep (headphones required)',
    youtubeId: 'F5ML28cGlMc',
    tag: 'Binaural',
  },
];

const TAG_COLORS: Record<string, string> = {
  Binaural: '#d8b4fe',
  Alpha:    '#a78bfa',
  Focus:    '#93c5fd',
  Nature:   '#6ee7b7',
  Noise:    '#fca5a5',
  'Lo-Fi':  '#fde68a',
  Classical:'#fcd34d',
  Custom:   '#e5e7eb',
};

const CUSTOM_KEY = 'parvaz-custom-music';

function loadCustom(): MusicTrack[] {
  try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]'); } catch { return []; }
}
function saveCustom(tracks: MusicTrack[]) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(tracks));
}
function extractYtId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) { const m = url.match(p); if (m) return m[1]; }
  return null;
}

export function NeuroMusic() {
  const { playingTrack, volume, isMuted, playTrack, stopTrack, setVolume, toggleMute } = useMusic();
  const [customTracks, setCustomTracks] = useState<MusicTrack[]>(loadCustom);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newBestFor, setNewBestFor] = useState('');
  const [addError, setAddError] = useState('');

  const allTracks = [...DEFAULT_TRACKS, ...customTracks];

  const handleAdd = () => {
    setAddError('');
    if (!newName.trim()) { setAddError('Please enter a name.'); return; }
    const ytId = extractYtId(newUrl.trim());
    if (!ytId) { setAddError('Invalid YouTube URL or video ID.'); return; }
    const track: MusicTrack = {
      id: `custom_${Date.now()}`,
      name: newName.trim(),
      description: newDesc.trim() || 'Custom focus track.',
      bestFor: newBestFor.trim() || 'Your study sessions',
      youtubeId: ytId,
      tag: 'Custom',
      isCustom: true,
    };
    const updated = [...customTracks, track];
    setCustomTracks(updated);
    saveCustom(updated);
    setNewName(''); setNewUrl(''); setNewDesc(''); setNewBestFor('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    if (playingTrack?.id === id) stopTrack();
    const updated = customTracks.filter(t => t.id !== id);
    setCustomTracks(updated);
    saveCustom(updated);
  };

  const effectiveVolume = isMuted ? 0 : volume;

  return (
    <div className="space-y-6">
      {/* Header card with volume control */}
      <Card className="p-6 shadow-md border-accent/30 bg-accent/5">
        <h2 className="text-xl font-bold mb-1">Neuroscience-Backed Music</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Music keeps playing as you switch pages or work in other apps. It only stops when you press Stop.
        </p>

        {playingTrack && (
          <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-accent/10 border border-accent/20">
            <span className="flex gap-0.5 items-end h-4">
              {[1,2,3].map(i => (
                <span key={i} className="w-1 bg-accent rounded-full animate-bounce"
                  style={{ height: `${6 + i * 4}px`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </span>
            <span className="text-sm font-semibold text-accent flex-1">{playingTrack.name}</span>
            <Button onClick={stopTrack} size="sm"
              className="h-7 px-3 text-xs bg-red-100 text-red-700 hover:bg-red-200 border border-red-200">
              <Square className="w-3 h-3 mr-1" /> Stop
            </Button>
          </div>
        )}

        {/* Volume */}
        <div className="flex items-center gap-3">
          <button onClick={toggleMute} className="text-muted-foreground hover:text-accent transition-colors">
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <Slider min={0} max={100} step={1} value={[effectiveVolume]}
            onValueChange={([v]) => { setVolume(v); if (v > 0 && isMuted) toggleMute(); }}
            className="flex-1 max-w-48" />
          <span className="text-xs text-muted-foreground w-8 text-right">{effectiveVolume}%</span>
        </div>
      </Card>

      {/* Track grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allTracks.map(track => {
          const isPlaying = playingTrack?.id === track.id;
          const tagColor = TAG_COLORS[track.tag] || '#e5e7eb';
          return (
            <Card key={track.id}
              className={`p-5 shadow-md transition-all duration-200 ${isPlaying ? 'border-accent shadow-lg bg-accent/5' : 'hover:border-accent/40'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="text-xs font-semibold px-2 py-0.5"
                      style={{ backgroundColor: 'transparent', color: tagColor, border: `1px solid ${tagColor}` }}>
                      {track.tag}
                    </Badge>
                    {isPlaying && (
                      <span className="flex gap-0.5 items-end h-4">
                        {[1,2,3].map(i => (
                          <span key={i} className="w-1 bg-accent rounded-full animate-bounce"
                            style={{ height: `${6+i*3}px`, animationDelay: `${i*0.1}s` }} />
                        ))}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-foreground">{track.name}</h3>
                </div>
                <div className="flex gap-1 ml-2">
                  {track.isCustom && (
                    <button onClick={() => handleDelete(track.id)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <a href={`https://youtube.com/watch?v=${track.youtubeId}`}
                    target="_blank" rel="noopener noreferrer"
                    className="p-1.5 rounded-md text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{track.description}</p>

              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-accent">Best for: {track.bestFor}</p>
                <Button onClick={() => isPlaying ? stopTrack() : playTrack(track)} size="sm"
                  className={`h-8 px-4 text-xs font-semibold gap-1.5 ${
                    isPlaying
                      ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                      : 'bg-accent text-white hover:bg-accent/90'
                  }`}>
                  {isPlaying ? <><Square className="w-3 h-3" /> Stop</> : <><Play className="w-3 h-3" /> Play</>}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add custom track */}
      <Card className="p-5 shadow-md border-dashed border-2 border-border/50">
        {!showAddForm ? (
          <button onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-accent transition-colors py-2">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add your own YouTube track</span>
          </button>
        ) : (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Add Custom Track</h3>
            <Input placeholder="Track name" value={newName} onChange={e => setNewName(e.target.value)} className="text-sm" />
            <Input placeholder="YouTube URL or video ID" value={newUrl} onChange={e => setNewUrl(e.target.value)} className="text-sm" />
            <Input placeholder="Description (optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="text-sm" />
            <Input placeholder="Best for... (optional)" value={newBestFor} onChange={e => setNewBestFor(e.target.value)} className="text-sm" />
            {addError && <p className="text-xs text-red-500">{addError}</p>}
            <div className="flex gap-2">
              <Button onClick={handleAdd} size="sm" className="bg-accent text-white hover:bg-accent/90">Add Track</Button>
              <Button onClick={() => { setShowAddForm(false); setAddError(''); }} size="sm" variant="outline">Cancel</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
