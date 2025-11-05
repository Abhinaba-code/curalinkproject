'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  FlaskConical,
  HeartPulse,
  LayoutDashboard,
  Users,
  FileText,
  Star,
  Loader2,
  History,
  Search,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { AppHeader } from '@/components/app-header';
import { useAuth } from '@/context/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { FavoritesProvider } from '@/context/favorites-provider';
import { ForumProvider } from '@/context/forum-provider';
import { FollowProvider } from '@/context/follow-provider';
import { Chatbot } from '@/components/chatbot';
import { HistoryProvider } from '@/context/history-provider';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/search', label: 'Search', icon: Search },
  { href: '/dashboard/trials', label: 'Clinical Trials', icon: FlaskConical },
  { href: '/dashboard/publications', label: 'Publications', icon: FileText },
  { href: '/dashboard/experts', label: 'Health Experts', icon: Users },
  { href: '/dashboard/forums', label: 'Forums', icon: HeartPulse },
  { href: '/dashboard/favorites', label: 'Favorites', icon: Star },
  { href: '/dashboard/history', label: 'History', icon: History },
];

function DashboardApp({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/auth/login');
      return;
    }

    const isCreateProfilePage = pathname === '/dashboard/create-profile';
    const profileComplete = user.interests && user.interests.length > 0;

    if (user.role === 'patient' && !profileComplete && !isCreateProfilePage) {
      router.replace('/dashboard/create-profile');
    }
  }, [user, loading, router, pathname]);

  if (loading || !user) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
         <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
         </div>
      </div>
    );
  }

  const isCreateProfilePage = pathname === '/dashboard/create-profile';
  
  if (isCreateProfilePage) {
    return <main className="flex-1 p-4 sm:p-6 animate-fade-in">{children}</main>;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  href={item.href}
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, className: 'bg-primary text-primary-foreground' }}
                >
                  <a href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col flex-1">
          <AppHeader />
          <main className="flex-1 p-4 sm:p-6 animate-fade-in">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HistoryProvider>
      <FavoritesProvider>
        <FollowProvider>
          <ForumProvider>
            <DashboardApp>{children}</DashboardApp>
          </ForumProvider>
        </FollowProvider>
      </FavoritesProvider>
    </HistoryProvider>
  );
}
