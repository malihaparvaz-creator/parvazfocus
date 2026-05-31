/* Shows currently active XP store unlocks */

import { useAppContext } from '@/contexts/AppContext';
import { getActiveUnlockLabels } from '@/lib/store-unlocks';

export function ActiveUnlocksBar() {
  const { state } = useAppContext();
  const labels = getActiveUnlockLabels(state);
  if (labels.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {labels.map(label => (
        <span
          key={label}
          className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-accent/15 text-accent border border-accent/25"
        >
          {label}
        </span>
      ))}
    </div>
  );
}
