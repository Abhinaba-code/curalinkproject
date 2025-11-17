
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Trash2,
  Filter,
} from 'lucide-react';
import { useForum, type Notification } from '@/context/forum-provider';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/context/language-provider';
import { NotificationItem } from '@/components/notification-item';

type NotificationType = Notification['type'];
const ALL_TYPES: NotificationType[] = ['new_post', 'new_reply', 'nudge', 'meeting_request', 'meeting_reply'];


export default function NotificationsPage() {
  const { notifications, clearNotifications, deleteNotification } = useForum();
  const [filterTypes, setFilterTypes] = useState<NotificationType[]>(ALL_TYPES);
  const { t } = useTranslation();

  const typeLabels: Record<NotificationType, string> = {
    new_post: t('notifications.types.new_post'),
    new_reply: t('notifications.types.new_reply'),
    nudge: t('notifications.types.nudge'),
    meeting_request: t('notifications.types.meeting_request'),
    meeting_reply: t('notifications.types.meeting_reply'),
  };

  const handleFilterChange = (type: NotificationType, checked: boolean) => {
    setFilterTypes(prev => {
        if (checked) {
            return [...prev, type];
        } else {
            return prev.filter(t => t !== type);
        }
    });
  };

  const filteredNotifications = notifications.filter(n => filterTypes.includes(n.type));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            {t('notifications.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('notifications.description')}
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                {t('notifications.filterButton')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('notifications.filter.title')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ALL_TYPES.map(type => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={filterTypes.includes(type)}
                  onCheckedChange={(checked) => handleFilterChange(type, !!checked)}
                >
                  {typeLabels[type]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="destructive"
            onClick={clearNotifications}
            disabled={notifications.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" /> {t('notifications.clearAllButton')}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y">
              {filteredNotifications.map((n) => (
                <NotificationItem key={n.id} notif={n} onDelete={deleteNotification} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 text-center text-muted-foreground">
                <Bell className="h-12 w-12" />
                <p className="font-semibold text-lg mt-4">{t('notifications.empty.title')}</p>
                <p className="text-sm">
                    {notifications.length > 0 ? t('notifications.empty.adjustFilters') : t('notifications.empty.noNotifications')}
                </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
