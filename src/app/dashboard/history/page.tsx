
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  History,
  Trash2,
  FlaskConical,
  FileText,
  Users,
  Search,
} from 'lucide-react';
import { useHistory, type HistoryItem, type ActivityType } from '@/context/history-provider';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { useTranslation } from '@/context/language-provider';

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case 'trial_search':
      return <FlaskConical className="h-5 w-5 text-primary" />;
    case 'publication_search':
      return <FileText className="h-5 w-5 text-primary" />;
    case 'expert_search':
      return <Users className="h-5 w-5 text-primary" />;
    case 'global_search':
      return <Search className="h-5 w-5 text-primary" />;
    default:
      return <Search className="h-5 w-5 text-primary" />;
  }
};


function HistoryItemCard({ item }: { item: HistoryItem }) {
  const { deleteHistoryItem } = useHistory();
  const { t } = useTranslation();

  const getActivityDescription = (item: HistoryItem) => {
    return t(`history.activity.${item.type}`, { query: item.query });
  }

  return (
    <div className="group flex items-center justify-between gap-4 rounded-lg p-3 hover:bg-muted/50">
      <div className="flex items-center gap-4">
        {getActivityIcon(item.type)}
        <div>
          <p className="text-sm font-medium">
             <Link href={item.link} className="hover:underline">
                {getActivityDescription(item)}
             </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={() => deleteHistoryItem(item.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function HistoryPage() {
  const { history, clearHistory } = useHistory();
  const { t } = useTranslation();

  const groupedHistory = history.reduce((acc, item) => {
    const date = new Date(item.timestamp);
    let group: string;

    if (isToday(date)) {
      group = t('history.today');
    } else if (isYesterday(date)) {
      group = t('history.yesterday');
    } else {
      group = format(date, 'MMMM d, yyyy');
    }

    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(item);

    return acc;
  }, {} as Record<string, HistoryItem[]>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
            <History className="h-8 w-8" />
            {t('history.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('history.description')}
          </p>
        </div>
        {history.length > 0 && (
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> {t('history.clearAllButton')}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('history.clearConfirm.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('history.clearConfirm.description')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={clearHistory}>
                            {t('history.clearConfirm.action')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )}
      </div>

      {history.length === 0 ? (
        <Card className="flex flex-col items-center justify-center h-80 text-center text-muted-foreground border-dashed">
          <CardHeader>
            <div className="mx-auto bg-secondary rounded-full p-4">
              <History className="h-12 w-12" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-lg">{t('history.empty.title')}</p>
            <p className="text-sm">
              {t('history.empty.description')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedHistory).map(([group, items]) => (
            <div key={group}>
              <h2 className="text-lg font-semibold mb-2">{group}</h2>
              <Card>
                <CardContent className="p-3">
                  {items.map((item) => (
                    <HistoryItemCard key={item.id} item={item} />
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
