"use client";

import { ReactNode } from "react";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import Sidebar from "@/app/components/Sidebar";

interface ChatAppLayoutProps {
  children: ReactNode;
}

export default function ChatAppLayout({ children }: ChatAppLayoutProps) {
  return (
    <SidebarProvider>
      <MainLayout>{children}</MainLayout>
    </SidebarProvider>
  );
}

function MainLayout({ children }: { children: ReactNode }) {
  const { isOpen, close } = useSidebar();
  return (
    <div className="flex h-screen overflow-hidden bg-[#FFFCF5]">
      <Sidebar isOpen={isOpen} onClose={close} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
