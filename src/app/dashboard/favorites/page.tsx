
'use client';

import { useFavorites, type FavoriteItem } from '@/context/favorites-provider';
import {
  FlaskConical,
  FileText,
  Users,
  Star,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Badge as UiBadge } from '@/components/ui/badge';
import type { ClinicalTrial, Expert, Publication } from '@/lib/types';
import { useTranslation } from '@/context/language-provider';


const ItemCard = ({ favorite, onRemove }: { favorite: FavoriteItem, onRemove: (item: any, type: any) => void }) => {
    const { t } = useTranslation();
    const { item, type } = favorite;
    
    let title, description, link, externalUrl;

    const statusColor = (item as ClinicalTrial).status === 'Recruiting' ? 'bg-green-500' : 'bg-yellow-500';

    switch (type) {
        case 'trial':
            const trial = item as ClinicalTrial;
            title = trial.title;
            description = (
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{trial.phase}</span>
                    <UiBadge variant="outline" className="shrink-0">
                        <span className={`w-2 h-2 rounded-full ${statusColor} mr-2`}></span>
                        {trial.status}
                    </UiBadge>
                </div>
            );
            link = `/dashboard/trials`;
            externalUrl = trial.url;
            break;
        case 'publication':
            const pub = item as Publication;
            title = pub.title;
            description = <p className="text-xs text-muted-foreground italic">{pub.journal}, {pub.year}</p>;
            link = `/dashboard/publications`;
            externalUrl = pub.url;
            break;
        case 'expert':
            const expert = item as Expert;
            title = expert.name;
            description = <p className="text-xs text-muted-foreground">{expert.specialty}</p>;
            link = `/dashboard/experts`;
            externalUrl = expert.url;
            break;
    }

    return (
        <div className="group relative rounded-lg border p-4 transition-colors hover:bg-muted/50">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(item, type)}
                aria-label={t('favorites.removeAria', { title })}
                className="absolute top-2 right-2 z-10 h-7 w-7 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
            
            <Link href={link} className="font-semibold text-base truncate pr-8 block hover:underline">
                {title}
            </Link>
            
            <div className="mt-1">{description}</div>

            <Link
                href={externalUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
            >
                <ExternalLink className="h-4 w-4" />
                {t('favorites.viewSource')}
            </Link>
        </div>
    );
};


export default function FavoritesPage() {
  const { favorites, toggleFavorite } = useFavorites();
  const { t } = useTranslation();

  const trials = favorites.filter((f) => f.type === 'trial');
  const publications = favorites.filter((f) => f.type === 'publication');
  const experts = favorites.filter((f) => f.type === 'expert');

  return (
    <div className="space-y-8">
       <div>
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
                {t('favorites.title')}
            </h1>
            <p className="text-muted-foreground">
                {t('favorites.description')}
            </p>
        </div>

        {favorites.length === 0 ? (
            <Card className="flex flex-col items-center justify-center h-80 text-center text-muted-foreground border-dashed">
                <CardHeader>
                    <div className="mx-auto bg-secondary rounded-full p-4">
                        <Star className="h-12 w-12" />
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="font-semibold text-lg">{t('favorites.empty.title')}</p>
                    <p className="text-sm">
                        {t('favorites.empty.description')}
                    </p>
                </CardContent>
            </Card>
        ) : (
            <div className="space-y-8">
              {trials.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FlaskConical className="h-6 w-6" />
                      {t('favorites.trials.title')}
                    </CardTitle>
                    <CardDescription>{t('favorites.trials.description')}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    {trials.map(fav => <ItemCard key={fav.item.id} favorite={fav} onRemove={toggleFavorite} />)}
                  </CardContent>
                </Card>
              )}
              {publications.length > 0 && (
                <Card>
                   <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-6 w-6" />
                      {t('favorites.publications.title')}
                    </CardTitle>
                    <CardDescription>{t('favorites.publications.description')}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    {publications.map(fav => <ItemCard key={fav.item.id} favorite={fav} onRemove={toggleFavorite} />)}
                  </CardContent>
                </Card>
              )}
              {experts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-6 w-6" />
                       {t('favorites.experts.title')}
                    </CardTitle>
                    <CardDescription>{t('favorites.experts.description')}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    {experts.map(fav => <ItemCard key={fav.item.id} favorite={fav} onRemove={toggleFavorite} />)}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
    </div>
  );
}
