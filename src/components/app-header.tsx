'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { Input } from './ui/input';
import { Search, Star, Bell, MessageSquare, CornerDownRight, Users, Calendar, Send, CheckCircle } from 'lucide-react';
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


function NotificationItem({ notif }: { notif: Notification }) {
    const { user } = useAuth();
    let Icon, text, subtext, link;
    
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
            link = '#'; // Informational
            break;
        default:
            return null;
    }

    const content = (
         <div className="flex items-start gap-3 rounded-lg p-2 hover:bg-accent cursor-pointer w-full">
            <div className="mt-1">
                <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="grid gap-1 flex-1">
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
        </div>
    );

    const Wrapper = ({ children }: { children: React.ReactNode }) => {
        if (notif.type === 'meeting_request' && user?.role === 'researcher') {
            return <ReplyToMeetingRequestDialog notif={notif}>{children}</ReplyToMeetingRequestDialog>;
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
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-background/50"
            />
          </div>
        </form>
        <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/favorites">
              <Star className="h-4 w-4" />
            </Link>
        </Button>
        <Popover onOpenChange={(open) => { if (open) markNotificationsAsRead() }}>
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
                           <NotificationItem key={notif.id} notif={notif} />
                        ))
                    ) : (
                        <div className="text-center text-sm text-muted-foreground p-4">
                            No new notifications.
                        </div>
                    )}
                </div>
                {notifications.length > 0 && (
                    <div className="border-t p-2">
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
                    </div>
                )}
            </PopoverContent>
        </Popover>
        <UserNav />
      </div>
    </header>
  );
}
