
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-transparent text-foreground font-sans">
      <div className="stars"></div>
      <div className="twinkling"></div>
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-8 z-10">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
