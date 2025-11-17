
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { Input } from './ui/input';
import { Search, Star, Bell } from 'lucide-react';
import { Logo } from './logo';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useForum } from '@/context/forum-provider';
import Link from 'next/link';
import { useAuth } from '@/context/auth-provider';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useHistory } from '@/context/history-provider';
import { WalletDisplay } from './wallet-display';
import { NotificationItem } from './notification-item';
import { useTranslation } from '@/context/language-provider';

export function AppHeader() {
  const { user } = useAuth();
  const { notifications, markNotificationsAsRead, unreadCount, clearNotifications, deleteNotification } = useForum();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { addHistoryItem } = useHistory();
  const { t } = useTranslation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;
    addHistoryItem({
        type: 'global_search',
        query: trimmedQuery,
        link: `/dashboard/search?q=${encodeURIComponent(trimmedQuery)}`
    });
    router.push(`/dashboard/search?q=${encodeURIComponent(trimmedQuery)}`);
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-lg px-4 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <div className="hidden md:block">
          <Logo />
        </div>
      </div>
      <div className="flex flex-1 items-center justify-end gap-4">
        <WalletDisplay />
        <form className="flex-1 sm:flex-initial max-w-xs" onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('header.searchPlaceholder')}
              className="pl-8 w-full bg-background/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
        <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/favorites">
              <Star className="h-4 w-4" />
            </Link>
        </Button>
        <Popover onOpenChange={(open) => { if (open && unreadCount > 0) markNotificationsAsRead() }}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                           {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b">
                    <h4 className="font-medium leading-none">{t('header.notifications.title')}</h4>
                    <p className="text-sm text-muted-foreground">
                        {t('header.notifications.description')}
                    </p>
                </div>
                <div className="grid gap-1 p-2 max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                           <NotificationItem key={notif.id} notif={notif} onDelete={deleteNotification} />
                        ))
                    ) : (
                        <div className="text-center text-sm text-muted-foreground p-4">
                            {t('header.notifications.empty')}
                        </div>
                    )}
                </div>
                {notifications.length > 0 && (
                    <div className="border-t p-2 flex justify-end">
                         <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={clearNotifications}
                        >
                            {t('header.notifications.clearAll')}
                        </Button>
                         <Button variant="ghost" asChild size="sm" className="text-xs">
                           <Link href="/dashboard/notifications">{t('header.notifications.viewAll')}</Link>
                         </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
        <UserNav />
      </div>
    </header>
  );
}
