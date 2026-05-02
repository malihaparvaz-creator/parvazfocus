/* Creative Apps Setup Dialog
   Shown when projects are unlocked for the first time
   Asks user which apps/websites they use for creative projects
*/

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CreativeAppsSetupDialogProps {
  open: boolean;
  onComplete: (apps: string[]) => void;
  onOpenChange?: (open: boolean) => void;
}

const COMMON_CREATIVE_APPS = [
  'Adobe Photoshop',
  'Adobe Premiere',
  'Figma',
  'Blender',
  'VS Code',
  'Notion',
  'Canva',
  'DaVinci Resolve',
  'Final Cut Pro',
  'Logic Pro',
  'Ableton Live',
  'OBS Studio',
  'Audacity',
  'Procreate',
  'Adobe XD',
  'Sketch',
];

export function CreativeAppsSetupDialog({ open, onComplete, onOpenChange }: CreativeAppsSetupDialogProps) {
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [customApp, setCustomApp] = useState('');

  const handleAddCustom = () => {
    if (customApp.trim() && !selectedApps.includes(customApp.trim())) {
      setSelectedApps([...selectedApps, customApp.trim()]);
      setCustomApp('');
    }
  };

  const handleToggleApp = (app: string) => {
    if (selectedApps.includes(app)) {
      setSelectedApps(selectedApps.filter(a => a !== app));
    } else {
      setSelectedApps([...selectedApps, app]);
    }
  };

  const handleRemoveApp = (app: string) => {
    setSelectedApps(selectedApps.filter(a => a !== app));
  };

  const handleComplete = () => {
    onComplete(selectedApps);
    onOpenChange?.(false); // Close dialog
    setSelectedApps([]); // Reset
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle className="text-2xl">Welcome to Creative Zone! 🎨</DialogTitle>
          <button
            onClick={() => onOpenChange?.(false)}
            className="p-1 hover:bg-accent/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
        <div className="space-y-6 pr-4">
          <div>
            <p className="text-muted-foreground mb-4">
              Which apps and websites do you use for your creative projects? We'll track time spent on these to show your creative productivity.
            </p>
          </div>

          {/* Common Apps - Scrollable */}
          <div>
            <p className="text-sm font-semibold mb-3">Popular Creative Tools</p>
            <ScrollArea className="h-48 border border-border/50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-2 pr-4">
                {COMMON_CREATIVE_APPS.map(app => (
                  <button
                    key={app}
                    onClick={() => handleToggleApp(app)}
                    className={`p-3 text-left rounded-lg border-2 transition-all text-sm ${
                      selectedApps.includes(app)
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:border-accent/50'
                    }`}
                  >
                    <span className="font-medium">{app}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Custom App Input */}
          <div>
            <p className="text-sm font-semibold mb-2">Add Custom Apps/Websites</p>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., YouTube, Spotify, Notion..."
                value={customApp}
                onChange={e => setCustomApp(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddCustom()}
              />
              <Button
                onClick={handleAddCustom}
                className="bg-accent hover:bg-accent/90"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Selected Apps */}
          {selectedApps.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-3">Selected Apps ({selectedApps.length})</p>
              <div className="flex flex-wrap gap-2">
                {selectedApps.map(app => (
                  <Badge
                    key={app}
                    variant="secondary"
                    className="px-3 py-2 text-sm flex items-center gap-2 cursor-pointer hover:bg-secondary/80"
                    onClick={() => handleRemoveApp(app)}
                  >
                    {app}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleComplete}
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={selectedApps.length === 0}
            >
              Start Tracking ({selectedApps.length} apps)
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            You can update this list anytime in Settings
          </p>
        </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
