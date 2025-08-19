'use client';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { SidebarProvider } from "@/components/layout/SidebarContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </SidebarProvider>
  );
} 