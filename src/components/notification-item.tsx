
'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useAuth } from '@/context/auth-provider';
import { useForum, type Notification } from '@/context/forum-provider';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, CornerDownRight, Users, Calendar, Send, CheckCircle, Trash2, Bell } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from '@/context/language-provider';
import { formatDistanceToNow } from 'date-fns';

const notificationIcons = {
  new_post: MessageSquare,
  new_reply: CornerDownRight,
  nudge: Users,
  meeting_request: Users, // Changed from Calendar for Connect feature
  meeting_reply: CheckCircle,
};

function ReplyToMeetingRequestDialog({ notif, children }: { notif: Notification, children: React.ReactNode }) {
    const { addMeetingReply } = useForum();
    const { user } = useAuth();
    const { toast } = useToast();
    const { t } = useTranslation();
    const [replyContent, setReplyContent] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const handleSendReply = () => {
        if (!replyContent.trim() || !user) return;
        addMeetingReply(notif, replyContent);
        setReplyContent('');
        setIsOpen(false);
        toast({
            title: t('notifications.meetingRequest.replySuccess.title'),
            description: t('notifications.meetingRequest.replySuccess.description', { name: notif.authorName }),
        });
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div className="w-full">{children}</div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{`Reply to ${notif.authorName}`}</DialogTitle>
                    <DialogDescription>
                        {`Replying to a connection request from ${notif.authorName}. They will be notified of your response.`}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <Label htmlFor="reply-content">{t('notifications.meetingRequest.messageLabel')}</Label>
                    <Textarea 
                        id="reply-content"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={`Hi ${notif.authorName.split(' ')[0]}, thanks for reaching out...`}
                        className="min-h-[120px]"
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">{t('common.cancel')}</Button>
                    </DialogClose>
                    <Button onClick={handleSendReply}>
                        <Send className="mr-2 h-4 w-4" />
                        {t('notifications.meetingRequest.sendButton')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function MeetingReplyDialog({ notif, children }: { notif: Notification, children: React.ReactNode }) {
    const { t } = useTranslation();
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{`Message from ${notif.authorName}`}</DialogTitle>
                    <DialogDescription>
                        {`Response to your connection request for ${notif.postTitle}.`}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <p className="font-semibold text-sm">{t('notifications.meetingReply.messageLabel')}</p>
                    <div className="text-sm text-muted-foreground border p-3 rounded-md bg-secondary/50">
                        <p>{notif.originalRequest?.content}</p>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button>{t('common.close')}</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export function NotificationItem({ notif, onDelete }: { notif: Notification, onDelete: (id: string) => void }) {
    const { user } = useAuth();
    const { t } = useTranslation();
    let text, subtext, link;
    
    const Icon = notificationIcons[notif.type] || Bell;

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onDelete(notif.id);
    }
    
    const notificationText = t(`notifications.text.${notif.type}`, {
        postTitle: notif.postTitle,
        authorName: notif.authorName,
    });

    text = notificationText.split('||')[0];
    subtext = notificationText.split('||')[1];

    switch (notif.type) {
        case 'new_post':
        case 'new_reply':
            link = '/dashboard/forums';
            break;
        case 'nudge':
             link = '/dashboard/experts';
            break;
        default:
            link = '#';
            break;
    }
    
    // Override for researcher-to-researcher connection requests
    if (notif.type === 'meeting_request' && user?.role === 'researcher') {
        text = `${notif.authorName} wants to connect.`;
        subtext = "Click to view message and respond.";
    }
    if (notif.type === 'meeting_reply' && user?.role === 'researcher') {
        text = `Response from ${notif.authorName}.`;
        subtext = `Regarding your connection request.`;
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
                <p className="text-sm text-muted-foreground flex justify-between w-full">
                    <span>{subtext}</span>
                     <span className="text-xs">
                        {formatDistanceToNow(new Date(parseInt(notif.id.split('-')[1])), { addSuffix: true })}
                    </span>
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
        if (notif.type === 'meeting_reply') { // For both patient and researcher
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
