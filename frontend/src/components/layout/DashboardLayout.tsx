"use client";

import React from 'react';
import Sidebar from './Sidebar';
import { useSidebar } from './SidebarContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  noMargin?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, noMargin }) => {
  const { collapsed, setCollapsed } = useSidebar();
  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300`}
        style={{ marginLeft: noMargin ? 0 : (collapsed ? 64 : 256) }}
      >
        <main className="flex-1 overflow-y-auto p-2">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
