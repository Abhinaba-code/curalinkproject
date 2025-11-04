'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { Input } from './ui/input';
import { Search, Star, Bell, MessageSquare } from 'lucide-react';
import { Logo } from './logo';
import { Button } from './ui/button';
import { useFavorites } from '@/context/favorites-provider';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useForum } from '@/context/forum-provider';
import Link from 'next/link';

export function AppHeader() {
  const { setShowFavorites } = useFavorites();
  const { notifications, markNotificationsAsRead, unreadCount } = useForum();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-lg px-4 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <div className="hidden md:block">
          <Logo />
        </div>
      </div>
      <div className="flex flex-1 items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search trials, publications..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>
        <Button variant="outline" size="icon" onClick={() => setShowFavorites(true)}>
            <Star className="h-4 w-4" />
        </Button>
        <Popover onOpenChange={(open) => { if (!open) markNotificationsAsRead() }}>
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
            <PopoverContent className="w-80" align="end">
                <div className="p-4">
                    <h4 className="font-medium leading-none">Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                        New posts from patients.
                    </p>
                </div>
                <div className="grid gap-2 p-2">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                        <Link
                            key={notif.id}
                            href="/dashboard/forums"
                            className="flex items-start gap-3 rounded-lg p-2 hover:bg-accent"
                        >
                            <div className="mt-1">
                                <MessageSquare className="h-4 w-4 text-primary" />
                            </div>
                            <div className="grid gap-1">
                                <p className="text-sm font-medium leading-none">
                                    New Post: "{notif.postTitle}"
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    By {notif.authorName} in the forums.
                                </p>
                            </div>
                        </Link>
                        ))
                    ) : (
                        <div className="text-center text-sm text-muted-foreground p-4">
                            No new notifications.
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
        <UserNav />
      </div>
    </header>
  );
}
