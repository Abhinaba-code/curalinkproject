'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useFavorites } from '@/context/favorites-provider';
import {
  FlaskConical,
  FileText,
  Users,
  Star,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import Link from 'next/link';
import { Button } from './ui/button';

export function FavoritesSidebar() {
  const { favorites, toggleFavorite, showFavorites, setShowFavorites } = useFavorites();

  const trials = favorites.filter((f) => f.type === 'trial');
  const publications = favorites.filter((f) => f.type === 'publication');
  const experts = favorites.filter((f) => f.type === 'expert');

  const renderItem = (fav: any) => {
    const { item, type } = fav;
    let internalLink = '';
    if (type === 'trial') internalLink = '/dashboard/trials';
    else if (type === 'publication') internalLink = '/dashboard/publications';
    else if (type === 'expert') internalLink = '/dashboard/experts';

    return (
      <div
        key={item.id}
        className="group relative rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleFavorite(item, type)}
          aria-label={`Remove ${item.title || item.name} from favorites`}
          className="absolute top-1 right-1 z-10 h-6 w-6 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        
        <Link
            href={internalLink || '#'}
            className="font-semibold truncate pr-6 block hover:underline"
        >
            {item.title || item.name}
        </Link>
        
        {type === 'trial' && (
          <p className="text-xs text-muted-foreground">{item.id}</p>
        )}
        {type === 'publication' && (
          <p className="text-xs text-muted-foreground italic">
            {item.journal}, {item.year}
          </p>
        )}
        {type === 'expert' && (
          <p className="text-xs text-muted-foreground">{item.specialty}</p>
        )}
        <Link
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
        >
          <ExternalLink className="h-3 w-3" />
          View Source
        </Link>
      </div>
    );
  };

  return (
    <Sheet open={showFavorites} onOpenChange={setShowFavorites}>
      <SheetContent className="w-[350px] sm:w-[400px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Your Favorites
          </SheetTitle>
          <SheetDescription>
            Your saved trials, publications, and health experts.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 -mx-6 px-6">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Star className="h-12 w-12 mb-4" />
              <p className="font-semibold">No Favorites Yet</p>
              <p className="text-sm">
                Click the star icon on any item to save it here.
              </p>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {trials.length > 0 && (
                <section>
                  <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                    <FlaskConical className="h-5 w-5" />
                    Clinical Trials
                  </h3>
                  <div className="space-y-2">{trials.map(renderItem)}</div>
                </section>
              )}
              {publications.length > 0 && (
                <section>
                  <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5" />
                    Publications
                  </h3>
                  <div className="space-y-2">
                    {publications.map(renderItem)}
                  </div>
                </section>
              )}
              {experts.length > 0 && (
                <section>
                  <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5" />
                    Health Experts
                  </h3>
                  <div className="space-y-2">{experts.map(renderItem)}</div>
                </section>
              )}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
