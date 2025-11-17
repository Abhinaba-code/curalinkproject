

'use client';

import { useFavorites, type FavoriteItem } from '@/context/favorites-provider';
import {
  FlaskConical,
  FileText,
  Users,
  Star,
  ExternalLink,
  Trash2,
  Download,
  Stethoscope,
  BookOpen,
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
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { useAuth } from '@/context/auth-provider';


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

function DoctorSummaryGenerator({ favorites }: { favorites: FavoriteItem[] }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [includeTrials, setIncludeTrials] = useState(true);
    const [includePublications, setIncludePublications] = useState(true);
    const [includeExperts, setIncludeExperts] = useState(true);

    const generateSummary = () => {
        const trials = includeTrials ? favorites.filter(f => f.type === 'trial') : [];
        const publications = includePublications ? favorites.filter(f => f.type === 'publication') : [];
        const experts = includeExperts ? favorites.filter(f => f.type === 'expert') : [];

        if (trials.length === 0 && publications.length === 0 && experts.length === 0) {
            toast({
                variant: 'destructive',
                title: "Nothing to Summarize",
                description: "Please select at least one category with favorites to generate a summary.",
            });
            return;
        }

        const doc = new jsPDF();
        let y = 20;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text("Doctor's Discussion Summary", 105, y, { align: 'center' });
        y += 8;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Generated for: ${user?.name || 'N/A'}`, 105, y, { align: 'center' });
        y += 5;
        doc.text(`Date: ${format(new Date(), 'PPP')}`, 105, y, { align: 'center' });
        y += 10;
        
        doc.setFontSize(12);
        const intro = doc.splitTextToSize("This document summarizes items I've saved on CuraLink that I would like to discuss with you.", 180);
        doc.text(intro, 15, y);
        y += (intro.length * 5) + 10;

        const checkY = (requiredSpace = 20) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
        };

        if (trials.length > 0) {
            checkY(20);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text("Saved Clinical Trials", 15, y);
            y += 8;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            trials.forEach(fav => {
                const trial = fav.item as ClinicalTrial;
                checkY(15);
                const title = doc.splitTextToSize(`- ${trial.title} (ID: ${trial.id})`, 170);
                doc.text(title, 20, y);
                y += (title.length * 5) + 2;
                doc.text(`Status: ${trial.status}, Phase: ${trial.phase}`, 20, y);
                y += 7;
            });
        }

        if (publications.length > 0) {
            checkY(20);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text("Saved Publications", 15, y);
            y += 8;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            publications.forEach(fav => {
                const pub = fav.item as Publication;
                checkY(15);
                const title = doc.splitTextToSize(`- ${pub.title}`, 170);
                doc.text(title, 20, y);
                y += (title.length * 5) + 2;
                doc.text(`By ${pub.authors[0]} et al., ${pub.journal} (${pub.year})`, 20, y);
                y += 7;
            });
        }
        
        if (experts.length > 0) {
            checkY(20);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text("Saved Researchers/Specialists", 15, y);
            y += 8;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            experts.forEach(fav => {
                const expert = fav.item as Expert;
                checkY(15);
                doc.text(`- ${expert.name} (Specialty: ${expert.specialty})`, 20, y);
                y += 7;
            });
        }

        doc.save(`CuraLink_Doctor_Summary_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
         toast({
            title: "Summary Generated",
            description: "Your PDF summary is downloading.",
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Doctor's Summary</CardTitle>
                <CardDescription>
                    Select the categories you'd like to include in a printable summary to discuss with your doctor.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Checkbox id="include-trials" checked={includeTrials} onCheckedChange={(checked) => setIncludeTrials(!!checked)} />
                    <Label htmlFor="include-trials" className="font-medium">Clinical Trials ({favorites.filter(f => f.type === 'trial').length})</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="include-publications" checked={includePublications} onCheckedChange={(checked) => setIncludePublications(!!checked)} />
                    <Label htmlFor="include-publications" className="font-medium">Publications ({favorites.filter(f => f.type === 'publication').length})</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="include-experts" checked={includeExperts} onCheckedChange={(checked) => setIncludeExperts(!!checked)} />
                    <Label htmlFor="include-experts" className="font-medium">Researchers ({favorites.filter(f => f.type === 'expert').length})</Label>
                </div>
                 <Button onClick={generateSummary} className="w-full mt-4">
                    <Download className="mr-2 h-4 w-4" />
                    Generate Summary PDF
                </Button>
            </CardContent>
        </Card>
    );
}

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

        <DoctorSummaryGenerator favorites={favorites} />

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
                      <BookOpen className="h-6 w-6" />
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
                      <Stethoscope className="h-6 w-6" />
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

    