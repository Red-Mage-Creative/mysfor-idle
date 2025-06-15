
import React, { useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Gamepad2, Info, Settings, Zap, Trophy, Star } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const Header = () => {
    const game = useGame();
    const { devMode, toggleDevMode, devGrantResources, hasBeatenGame } = game || {};

    useEffect(() => {
        // The keyboard shortcut should only be active in development
        if (!import.meta.env.DEV) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
                e.preventDefault();
                toggleDevMode?.();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleDevMode]);

    const navLinkClasses = ({ isActive }: { isActive: boolean; }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary via-fuchsia-500 to-primary bg-clip-text text-transparent">Mystic Forge</h1>
        </Link>
        <nav className="hidden md:flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
                <a href="https://github.com/lovable-dev/mystic-forge-gemini" target="_blank" rel="noopener noreferrer" aria-label="Star us on GitHub">
                    <Star />
                    Star us on GitHub
                </a>
            </Button>

            {/* Dev mode controls are only available in development */}
            {import.meta.env.DEV && (
              <>
                <div className="flex items-center gap-2 pr-4 border-r">
                    <Switch
                        id="dev-mode-switch"
                        checked={!!devMode}
                        onCheckedChange={toggleDevMode}
                        disabled={!toggleDevMode}
                    />
                    <Label htmlFor="dev-mode-switch" className="text-sm font-medium whitespace-nowrap">Dev Mode</Label>
                </div>

                {devMode && (
                    <Button size="sm" variant="outline" onClick={devGrantResources}>
                        <Zap className="mr-2 h-4 w-4" />
                        Grant Resources
                    </Button>
                )}
              </>
            )}
          <NavLink to="/" className={navLinkClasses} end>
            <Gamepad2 className="h-4 w-4" />
            <span>Game</span>
          </NavLink>
          <NavLink to="/about" className={navLinkClasses}>
            <Info className="h-4 w-4" />
            <span>About</span>
          </NavLink>
          <NavLink to="/settings" className={navLinkClasses}>
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </NavLink>
          {hasBeatenGame && (
             <NavLink to="/end-credits" className={navLinkClasses}>
                <Trophy className="h-4 w-4" />
                <span>End Credits</span>
            </NavLink>
          )}
        </nav>
        {/* A mobile menu could be added here later */}
      </div>
    </header>
  );
};

export default Header;
