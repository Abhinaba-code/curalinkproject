
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { Input } from './ui/input';
import { Search, Star, Bell, MessageSquare, CornerDownRight, Users, Calendar, Send, CheckCircle, Trash2 } from 'lucide-react';
import { Logo } from './logo';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useForum, type Notification } from '@/context/forum-provider';
import Link from 'next/link';
import { useAuth } from '@/context/auth-provider';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useState } from 'react';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useHistory } from '@/context/history-provider';

function ReplyToMeetingRequestDialog({ notif, children }: { notif: Notification, children: React.ReactNode }) {
    const { addMeetingReply } = useForum();
    const { user } = useAuth();
    const { toast } = useToast();
    const [replyContent, setReplyContent] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleSendReply = () => {
        if (!replyContent.trim() || !user) return;
        addMeetingReply(notif, replyContent);
        setReplyContent('');
        setIsOpen(false);
        toast({
            title: "Reply Sent!",
            description: `Your reply has been sent to ${notif.authorName}.`
        });
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div className="w-full">{children}</div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reply to {notif.authorName || 'Anonymous'}</DialogTitle>
                    <DialogDescription>
                        Replying to a meeting request regarding expert: {notif.postTitle}. 
                        The patient will be notified of your response.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <Label htmlFor="reply-content">Your Message</Label>
                    <Textarea 
                        id="reply-content"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your response..."
                        className="min-h-[120px]"
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSendReply}>
                        <Send className="mr-2 h-4 w-4" />
                        Send Reply
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function MeetingReplyDialog({ notif, children }: { notif: Notification, children: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update on Your Meeting Request</DialogTitle>
                    <DialogDescription>
                        A researcher has responded to your request regarding {notif.postTitle}.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <p className="font-semibold text-sm">Researcher's Message:</p>
                    <div className="text-sm text-muted-foreground border p-3 rounded-md bg-secondary/50">
                        <p>{notif.originalRequest?.content}</p>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button>Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


function NotificationItem({ notif, deleteNotification }: { notif: Notification, deleteNotification: (id: string) => void }) {
    const { user } = useAuth();
    let Icon, text, subtext, link;
    
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        deleteNotification(notif.id);
    }

    switch (notif.type) {
        case 'new_post':
            Icon = MessageSquare;
            text = `New Post: "${notif.postTitle}"`;
            subtext = `By ${notif.authorName}`;
            link = '/dashboard/forums';
            break;
        case 'new_reply':
            Icon = CornerDownRight;
            text = `New Reply on: "${notif.postTitle}"`;
            subtext = `By ${notif.authorName}`;
            link = '/dashboard/forums';
            break;
        case 'nudge':
            Icon = Users;
            text = `${notif.authorName} nudged an expert to join!`;
            subtext = `Expert: ${notif.postTitle}`;
            link = '/dashboard/experts';
            break;
        case 'meeting_request':
            Icon = Calendar;
            text = `Meeting request for ${notif.postTitle}`;
            subtext = `From: ${notif.authorName}`;
            link = '#'; // Handled by dialog
            break;
        case 'meeting_reply':
            Icon = Calendar;
            text = `Update on your meeting request`;
            subtext = `From: ${notif.authorName} re: ${notif.postTitle}`;
            link = '#'; // Informational, handled by dialog for patient
            break;
        default:
            return null;
    }

    const content = (
         <div className="group flex items-start gap-3 rounded-lg p-2 hover:bg-accent cursor-pointer w-full relative">
            <div className="mt-1">
                <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="grid gap-1 flex-1 pr-8">
                <p className="text-sm font-medium leading-none">
                    {text}
                </p>
                <p className="text-sm text-muted-foreground">
                    {subtext}
                </p>
            </div>
            {!notif.read && (
                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
            )}
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-1 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100"
                onClick={handleDelete}
            >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
        </div>
    );

    const Wrapper = ({ children }: { children: React.ReactNode }) => {
        if (notif.type === 'meeting_request' && user?.role === 'researcher') {
            return <ReplyToMeetingRequestDialog notif={notif}>{children}</ReplyToMeetingRequestDialog>;
        }
        if (notif.type === 'meeting_reply' && user?.role === 'patient') {
            return <MeetingReplyDialog notif={notif}>{children}</MeetingReplyDialog>;
        }
        if (link === '#') {
            return <div className="w-full cursor-default">{children}</div>;
        }
        return <Link href={link} className="w-full">{children}</Link>;
    };

    return (
        <Wrapper>
            {content}
        </Wrapper>
    );
}

export function AppHeader() {
  const { user } = useAuth();
  const { notifications, markNotificationsAsRead, unreadCount, clearNotifications, deleteNotification } = useForum();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { addHistoryItem } = useHistory();

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
      <div className="flex flex-1 items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial" onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search trials, publications..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-background/50"
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
                <div className="p-4">
                    <h4 className="font-medium leading-none">Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                        Recent updates and interactions.
                    </p>
                </div>
                <div className="grid gap-1 p-2 max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                           <NotificationItem key={notif.id} notif={notif} deleteNotification={deleteNotification} />
                        ))
                    ) : (
                        <div className="text-center text-sm text-muted-foreground p-4">
                            No new notifications.
                        </div>
                    )}
                </div>
                {notifications.length > 0 && (
                    <div className="border-t p-2 grid grid-cols-2 gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={markNotificationsAsRead}
                            disabled={unreadCount === 0}
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark all as read
                        </Button>
                         <Button
                            variant="ghost"
                            size="sm"
                            className="w-full hover:bg-destructive/10 hover:text-destructive"
                            onClick={clearNotifications}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear all
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
