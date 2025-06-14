
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Gamepad2, Info, Settings } from 'lucide-react';

const Header = () => {
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
          <h1 className="text-2xl font-bold tracking-tight text-primary">Mystic Forge</h1>
        </Link>
        <nav className="hidden md:flex items-center gap-2">
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
        </nav>
        {/* A mobile menu could be added here later */}
      </div>
    </header>
  );
};

export default Header;
