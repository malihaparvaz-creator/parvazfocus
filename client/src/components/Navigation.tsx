/* Parvaz Focus - Navigation Component
   Responsive: sidebar on desktop (lg+), bottom bar on mobile/tablet
*/

import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Home, BookOpen, Zap, Settings } from 'lucide-react';

export function Navigation() {
  const [location, navigate] = useLocation();

  const links = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/study', label: 'Study', icon: BookOpen },
    { href: '/projects', label: 'Projects', icon: Zap },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Sidebar — desktop only (lg and up) */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-screen w-20 bg-card border-r border-border/50 flex-col items-center py-8 gap-4 z-50">
        {links.slice(0, 3).map(({ href, label, icon: Icon }) => (
          <Button
            key={href}
            onClick={() => navigate(href)}
            variant={location === href ? 'default' : 'ghost'}
            size="icon"
            className="rounded-lg w-12 h-12 touch-manipulation"
            title={label}
          >
            <Icon className="w-5 h-5" />
          </Button>
        ))}

        <div className="flex-1" />

        <Button
          onClick={() => navigate('/settings')}
          variant={location === '/settings' ? 'default' : 'ghost'}
          size="icon"
          className="rounded-lg w-12 h-12 touch-manipulation"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </nav>

      {/* Bottom bar — mobile & tablet (below lg) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border/50 flex items-center justify-around z-50 px-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = location === href;
          return (
            <button
              key={href}
              onClick={() => navigate(href)}
              className={[
                'flex flex-col items-center justify-center flex-1 h-full gap-1 rounded-lg mx-1',
                'touch-manipulation select-none transition-colors',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              ].join(' ')}
              style={{ WebkitTapHighlightColor: 'transparent' }}
              aria-label={label}
            >
              <Icon className={`w-6 h-6 ${active ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className={`text-[10px] font-medium leading-none ${active ? 'font-semibold' : ''}`}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
