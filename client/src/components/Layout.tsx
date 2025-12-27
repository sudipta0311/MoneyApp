import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Shield, Lock, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const isActive = location === href;
    return (
      <Link href={href}>
        <div className={cn(
          "flex flex-col items-center justify-center gap-1 p-2 w-16 transition-colors",
          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}>
          <Icon className={cn("w-6 h-6", isActive && "fill-current opacity-20")} strokeWidth={isActive ? 2.5 : 2} />
          <span className="text-[10px] font-medium">{label}</span>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center font-sans">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md bg-background h-[100dvh] md:h-[90vh] md:rounded-3xl md:shadow-2xl relative overflow-hidden flex flex-col md:border md:border-border">
        
        {/* Status Bar Simulation (MD only) */}
        <div className="hidden md:flex justify-between items-center px-6 py-2 bg-background/80 backdrop-blur-sm sticky top-0 z-50 text-[10px] font-medium text-foreground/60">
          <span>9:41</span>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-foreground/20" />
            <div className="w-3 h-3 rounded-full bg-foreground/20" />
            <div className="w-5 h-3 rounded-full bg-foreground/20" />
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto scroll-smooth pb-20 no-scrollbar">
          {children}
        </main>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 left-0 right-0 bg-background border-t border-border px-6 py-2 pb-6 md:pb-2 z-40">
          <div className="flex justify-between items-center max-w-xs mx-auto">
            <NavItem href="/" icon={Home} label="Transactions" />
            <NavItem href="/permissions" icon={Shield} label="Permissions" />
            <NavItem href="/disclaimer" icon={Lock} label="Privacy" />
          </div>
        </nav>
        
        <Toaster />
      </div>
    </div>
  );
}
