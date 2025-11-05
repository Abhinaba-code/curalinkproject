'use client';

import { useFavorites } from '@/context/favorites-provider';
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
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

export default function FavoritesPage() {
  const { favorites, toggleFavorite } = useFavorites();

  const trials = favorites.filter((f) => f.type === 'trial');
  const publications = favorites.filter((f) => f.type === 'publication');
  const experts = favorites.filter((f) => f.type === 'expert');

  const renderItem = (fav: any) => {
    const { item, type } = fav;
    const internalLink = `/dashboard/${type}s`;
    const itemUrl = item.url || '#';

    return (
      <div
        key={item.id}
        className="group relative rounded-lg border p-4 text-sm transition-colors hover:bg-muted/50"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleFavorite(item, type)}
          aria-label={`Remove ${item.title || item.name} from favorites`}
          className="absolute top-2 right-2 z-10 h-7 w-7 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        
        <Link
            href={internalLink}
            className="font-semibold text-base truncate pr-8 block hover:underline"
        >
            {item.title || item.name}
        </Link>
        
        {type === 'trial' && (
          <p className="text-sm text-muted-foreground">{item.id}</p>
        )}
        {type === 'publication' && (
          <p className="text-sm text-muted-foreground italic">
            {item.journal}, {item.year}
          </p>
        )}
        {type === 'expert' && (
          <p className="text-sm text-muted-foreground">{item.specialty}</p>
        )}
        <Link
          href={itemUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
        >
          <ExternalLink className="h-4 w-4" />
          View Source
        </Link>
      </div>
    );
  };

  return (
    <div className="space-y-8">
       <div>
            <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
                <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
                Your Favorites
            </h1>
            <p className="text-muted-foreground">
                Your saved trials, publications, and health experts.
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
                    <p className="font-semibold text-lg">No Favorites Yet</p>
                    <p className="text-sm">
                        Click the star icon on any item to save it here.
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
                      Clinical Trials
                    </CardTitle>
                    <CardDescription>Saved clinical trials for future reference.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    {trials.map(renderItem)}
                  </CardContent>
                </Card>
              )}
              {publications.length > 0 && (
                <Card>
                   <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-6 w-6" />
                       Publications
                    </CardTitle>
                    <CardDescription>Your collection of saved medical publications.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    {publications.map(renderItem)}
                  </CardContent>
                </Card>
              )}
              {experts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-6 w-6" />
                       Health Experts
                    </CardTitle>
                    <CardDescription>A list of health experts you are following.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    {experts.map(renderItem)}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
    </div>
  );
}
