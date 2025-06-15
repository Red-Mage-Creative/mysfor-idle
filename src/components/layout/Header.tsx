
import React, { useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Gamepad2, Info, Settings, Zap, Trophy, Star, Menu, Award } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';

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
    
    const mobileNavLinkClasses = ({ isActive }: { isActive: boolean; }) =>
    `flex items-center gap-3 px-3 py-3 rounded-lg text-lg font-medium transition-colors ${
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
                <a href="https://github.com/Red-Mage-Creative/mysfor-idle" target="_blank" rel="noopener noreferrer" aria-label="Star us on GitHub">
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
          <NavLink to="/achievements" className={navLinkClasses}>
            <Award className="h-4 w-4" />
            <span>Achievements</span>
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
        {/* Mobile Menu */}
        <div className="md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Open navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right">
                    <nav className="grid gap-6 text-lg font-medium mt-8">
                        <SheetClose asChild>
                            <NavLink to="/" className={mobileNavLinkClasses} end>
                                <Gamepad2 className="h-5 w-5" />
                                <span>Game</span>
                            </NavLink>
                        </SheetClose>
                        <SheetClose asChild>
                            <NavLink to="/about" className={mobileNavLinkClasses}>
                                <Info className="h-5 w-5" />
                                <span>About</span>
                            </NavLink>
                        </SheetClose>
                        <SheetClose asChild>
                            <NavLink to="/achievements" className={mobileNavLinkClasses}>
                                <Award className="h-5 w-5" />
                                <span>Achievements</span>
                            </NavLink>
                        </SheetClose>
                        <SheetClose asChild>
                            <NavLink to="/settings" className={mobileNavLinkClasses}>
                                <Settings className="h-5 w-5" />
                                <span>Settings</span>
                            </NavLink>
                        </SheetClose>
                        {hasBeatenGame && (
                            <SheetClose asChild>
                                <NavLink to="/end-credits" className={mobileNavLinkClasses}>
                                    <Trophy className="h-5 w-5" />
                                    <span>End Credits</span>
                                </NavLink>
                            </SheetClose>
                        )}

                        <div className="border-t pt-6 mt-4 space-y-4">
                            <Button asChild variant="outline" className="w-full justify-center">
                                <a href="https://github.com/Red-Mage-Creative/mysfor-idle" target="_blank" rel="noopener noreferrer" aria-label="Star us on GitHub">
                                    <Star />
                                    Star us on GitHub
                                </a>
                            </Button>

                            {import.meta.env.DEV && (
                                <div className="border-t pt-4 space-y-4">
                                    <div className="flex items-center justify-between gap-2 p-2 border rounded-lg">
                                        <Label htmlFor="dev-mode-switch-mobile" className="text-base font-medium whitespace-nowrap">Dev Mode</Label>
                                        <Switch
                                            id="dev-mode-switch-mobile"
                                            checked={!!devMode}
                                            onCheckedChange={toggleDevMode}
                                            disabled={!toggleDevMode}
                                        />
                                    </div>
                                    {devMode && (
                                        <Button size="sm" variant="outline" onClick={devGrantResources} className="w-full">
                                            <Zap className="mr-2 h-4 w-4" />
                                            Grant Resources
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
