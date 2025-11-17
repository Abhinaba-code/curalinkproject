
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, FlaskConical, CalendarDays } from 'lucide-react';
import { useTranslation } from '@/context/language-provider';
import { useAuth } from '@/context/auth-provider';
import { useFavorites } from '@/context/favorites-provider';
import { useJournal } from '@/context/journal-provider';
import jsPDF from 'jspdf';
import { format } from 'date-fns';

export default function ReportsPage() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const { entries: journalEntries } = useJournal();

  const handleDownload = (reportName: string) => {
    const doc = new jsPDF();
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('CuraLink Health Report', 105, 20, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(`Report Type: ${reportName}`, 105, 30, { align: 'center' });
    doc.text(`Generated for: ${user?.name || 'N/A'}`, 105, 36, { align: 'center' });
    doc.text(`Date: ${format(new Date(), 'PPP')}`, 105, 42, { align: 'center' });

    doc.line(20, 50, 190, 50); // a line separator

    let yPosition = 60;
    
    switch(reportName) {
        case t('reports.symptomHistory.title'):
            doc.setFontSize(16);
            doc.text('Symptom History', 20, yPosition);
            yPosition += 10;
            if (journalEntries.length > 0) {
              journalEntries.forEach(entry => {
                if (yPosition > 270) {
                  doc.addPage();
                  yPosition = 20;
                }
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text(`${format(new Date(entry.date), 'PPP')}:`, 20, yPosition);
                yPosition += 7;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.text(`- Mood: ${entry.mood}/5 | Pain: ${entry.pain}/5 | Sleep: ${entry.sleep}/5 | Energy: ${entry.energy}/5`, 25, yPosition);
                yPosition += 5;
                if(entry.notes) {
                    const notes = doc.splitTextToSize(`Notes: ${entry.notes}`, 160);
                    doc.text(notes, 25, yPosition);
                    yPosition += (notes.length * 5) + 5;
                }
              });
            } else {
                doc.text('No symptom history available.', 20, yPosition);
            }
            break;

        case t('reports.savedTrials.title'):
            doc.setFontSize(16);
            doc.text('Saved Clinical Trials', 20, yPosition);
            yPosition += 10;
            const savedTrials = favorites.filter(f => f.type === 'trial');
            if (savedTrials.length > 0) {
                savedTrials.forEach(fav => {
                    const trial = fav.item;
                    if (yPosition > 270) {
                      doc.addPage();
                      yPosition = 20;
                    }
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'bold');
                    const title = doc.splitTextToSize(trial.title, 170);
                    doc.text(title, 20, yPosition);
                    yPosition += (title.length * 5) + 2;

                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');
                    doc.text(`ID: ${trial.id} | Phase: ${trial.phase} | Status: ${trial.status}`, 25, yPosition);
                    yPosition += 10;
                });
            } else {
                doc.text('No saved clinical trials found.', 20, yPosition);
            }
            break;

        case t('reports.medicationSchedule.title'):
             doc.setFontSize(16);
             doc.text('Current Medication Schedule', 20, yPosition);
             yPosition += 10;
             if (user?.medications && user.medications.length > 0) {
                 user.medications.forEach(med => {
                    if (yPosition > 270) {
                      doc.addPage();
                      yPosition = 20;
                    }
                    doc.setFontSize(12);
                    doc.text(`- ${med}`, 20, yPosition);
                    yPosition += 7;
                 });
             } else {
                 doc.text('No current medications listed in profile.', 20, yPosition);
             }
            break;
    }

    doc.save(`${reportName.toLowerCase().replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);

    toast({
      title: t('reports.toast.title'),
      description: t('reports.toast.description', { reportName }),
    });
  };

  const reportItems = [
    {
      title: t('reports.symptomHistory.title'),
      description: t('reports.symptomHistory.description'),
      icon: <FileText className="h-8 w-8 text-primary" />,
      action: () => handleDownload(t('reports.symptomHistory.title')),
    },
    {
      title: t('reports.savedTrials.title'),
      description: t('reports.savedTrials.description'),
      icon: <FlaskConical className="h-8 w-8 text-primary" />,
      action: () => handleDownload(t('reports.savedTrials.title')),
    },
    {
      title: t('reports.medicationSchedule.title'),
      description: t('reports.medicationSchedule.description'),
      icon: <CalendarDays className="h-8 w-8 text-primary" />,
      action: () => handleDownload(t('reports.medicationSchedule.title')),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
          <Download className="h-8 w-8" />
          {t('reports.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('reports.description')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportItems.map((item, index) => (
          <Card key={index}>
            <CardHeader className="items-center text-center">
                <div className="rounded-full bg-primary/10 p-4">
                    {item.icon}
                </div>
                <CardTitle className="pt-4">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                {item.description}
              </CardDescription>
            </CardContent>
            <CardContent className="flex justify-center">
              <Button onClick={item.action}>
                <Download className="mr-2 h-4 w-4" />
                {t('reports.downloadButton')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
