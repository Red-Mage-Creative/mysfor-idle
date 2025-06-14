
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
