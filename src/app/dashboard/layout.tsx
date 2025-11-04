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
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { AppHeader } from '@/components/app-header';
import { useAuth } from '@/context/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { FavoritesSidebar } from '@/components/favorites-sidebar';
import { FavoritesProvider } from '@/context/favorites-provider';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/trials', label: 'Clinical Trials', icon: FlaskConical },
  { href: '/dashboard/publications', label: 'Publications', icon: FileText },
  { href: '/dashboard/experts', label: 'Experts', icon: Users },
  { href: '/dashboard/forums', label: 'Forums', icon: HeartPulse },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
       <div className="flex h-screen w-full">
        <div className="hidden md:flex flex-col w-64 border-r p-4 gap-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="flex-1 p-4">
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <FavoritesProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon" className="bg-sidebar">
          <SidebarHeader>
            <Logo className="text-sidebar-foreground group-data-[collapsible=icon]:hidden" />
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
                 <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={{ children: 'Favorites', className: 'bg-primary text-primary-foreground' }}
                  >
                    <Star />
                    <span>Favorites</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="bg-background flex">
          <div className="flex flex-col flex-1">
            <AppHeader />
            <main className="flex-1 p-4 sm:p-6">{children}</main>
          </div>
          <FavoritesSidebar />
        </SidebarInset>
      </SidebarProvider>
    </FavoritesProvider>
  );
}
