import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextProps {
  collapsed: boolean;
  setCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar deve ser usado dentro de SidebarProvider');
  }
  return context;
}; 