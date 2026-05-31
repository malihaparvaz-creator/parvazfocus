/* Profile avatar with XP Store frame — visible in nav and headers */

import { useAppContext } from '@/contexts/AppContext';
import { getAvatarDisplay, getProfileTitleLabel } from '@/lib/store-unlocks';
import { cn } from '@/lib/utils';

const SIZE = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-14 h-14 text-lg',
  lg: 'w-20 h-20 text-2xl',
};

export function ProfileAvatar({
  size = 'md',
  showTitle = true,
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
  className?: string;
}) {
  const { state } = useAppContext();
  const avatar = getAvatarDisplay(state);
  const title = getProfileTitleLabel(state);

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div
        className={cn(
          'profile-avatar flex items-center justify-center rounded-full font-bold shrink-0',
          SIZE[size],
          avatar.frameClass
        )}
        title={avatar.name}
      >
        <span aria-hidden>{avatar.emoji}</span>
      </div>
      {showTitle && title && (
        <span className="text-[10px] font-semibold text-accent uppercase tracking-wide text-center max-w-[88px] leading-tight">
          {title}
        </span>
      )}
      {showTitle && !title && avatar.name !== 'Default' && (
        <span className="text-[10px] text-muted-foreground text-center">{avatar.name}</span>
      )}
    </div>
  );
}
