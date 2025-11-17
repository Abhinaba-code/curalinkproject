
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
  SidebarFooter,
  SidebarCollapse,
} from '@/components/ui/sidebar';
import {
  FlaskConical,
  HeartPulse,
  LayoutDashboard,
  Users,
  FileText,
  Loader2,
  NotebookPen,
  Shield,
  Download,
  Bell,
  Map,
  Star,
  History,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { AppHeader } from '@/components/app-header';
import { useAuth } from '@/context/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { FavoritesProvider } from '@/context/favorites-provider';
import { ForumProvider } from '@/context/forum-provider';
import { FollowProvider } from '@/context/follow-provider';
import { HistoryProvider } from '@/context/history-provider';
import { useTranslation } from '@/context/language-provider';
import { JournalProvider } from '@/context/journal-provider';
import { Chatbot } from '@/components/chatbot';
import { VoiceAssistant } from '@/components/voice-assistant';

function DashboardApp({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = (user?.role === 'researcher' 
    ? [
        { href: '/dashboard', label: t('dashboard.nav.dashboard'), icon: LayoutDashboard },
        { href: '/dashboard/trials', label: t('dashboard.nav.trials'), icon: FlaskConical },
        { href: '/dashboard/publications', label: t('dashboard.nav.publications'), icon: FileText },
        { href: '/dashboard/experts', label: t('dashboard.nav.collaborators'), icon: Users },
        { href: '/dashboard/experts/map', label: t('dashboard.nav.expertsMap'), icon: Map },
        { href: '/dashboard/forums', label: t('dashboard.nav.forums'), icon: HeartPulse },
        { href: '/dashboard/notifications', label: t('dashboard.nav.notifications'), icon: Bell },
        { href: '/dashboard/reports', label: t('dashboard.nav.reports'), icon: Download },
        { href: '/dashboard/audit-log', label: t('dashboard.nav.auditLog'), icon: Shield },
      ]
    : [
        { href: '/dashboard', label: t('dashboard.nav.dashboard'), icon: LayoutDashboard },
        { href: '/dashboard/journal', label: t('dashboard.nav.journal'), icon: NotebookPen },
        { href: '/dashboard/trials', label: t('dashboard.nav.trials'), icon: FlaskConical },
        { href: '/dashboard/publications', label: t('dashboard.nav.publications'), icon: FileText },
        { href: '/dashboard/experts', label: t('dashboard.nav.experts'), icon: Users },
        { href: '/dashboard/experts/map', label: t('dashboard.nav.expertsMap'), icon: Map },
        { href: '/dashboard/forums', label: t('dashboard.nav.forums'), icon: HeartPulse },
        { href: '/dashboard/notifications', label: t('dashboard.nav.notifications'), icon: Bell },
        { href: '/dashboard/reports', label: t('dashboard.nav.reports'), icon: Download },
        { href: '/dashboard/audit-log', label: t('dashboard.nav.auditLog'), icon: Shield },
      ]
  );


  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/auth/login');
      return;
    }

    const isPatientCreateProfilePage = pathname === '/dashboard/create-profile';
    const isResearcherCreateProfilePage = pathname === '/dashboard/create-researcher-profile';
    
    if (user.role === 'patient') {
      const profileComplete = user.interests && user.interests.length > 0;
      if (!profileComplete && !isPatientCreateProfilePage) {
        router.replace('/dashboard/create-profile');
      }
    }

    if (user.role === 'researcher') {
      const profileComplete = user.affiliation && user.specialties && user.specialties.length > 0;
      if (!profileComplete && !isResearcherCreateProfilePage) {
        router.replace('/dashboard/create-researcher-profile');
      }
    }

  }, [user, loading, router, pathname]);

  if (loading || !user) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
         <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">{t('dashboard.loading')}</p>
         </div>
      </div>
    );
  }
  
  const isCreateProfilePage = pathname === '/dashboard/create-profile' || pathname === '/dashboard/create-researcher-profile';
  
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
        <SidebarFooter>
          <SidebarCollapse />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex h-screen flex-col">
          <AppHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
          <VoiceAssistant />
          <Chatbot />
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
            <JournalProvider>
              <DashboardApp>{children}</DashboardApp>
            </JournalProvider>
          </ForumProvider>
        </FollowProvider>
      </FavoritesProvider>
    </HistoryProvider>
  );
}
