
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground font-sans">
      <div className="fixed top-0 left-0 w-full h-full -z-20 bg-background" />
      <div 
        className="fixed top-0 left-0 w-full h-full -z-10 animate-aurora"
        style={{
          backgroundImage: 'radial-gradient(ellipse at top, transparent 0%, hsl(var(--primary)/0.2)), radial-gradient(ellipse at bottom, transparent 0%, hsl(var(--secondary)/0.2))',
          backgroundSize: '200% 200%',
        }}
      />
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
