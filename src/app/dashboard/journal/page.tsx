
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PlusCircle,
  NotebookPen,
  Trash2,
  Smile,
  Frown,
  Meh,
  Bed,
  Zap,
  Bot,
  Loader2,
  TrendingUp,
  ListChecks,
  Download,
  Stethoscope,
  Pill,
  Walk,
  Utensils,
  Tag,
} from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useTranslation } from '@/context/language-provider';
import { useJournal, type JournalEntry } from '@/context/journal-provider';
import { summarizeSymptoms } from '@/ai/flows/summarize-symptoms';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import jsPDF from 'jspdf';
import type { Symptom } from '@/ai/flows/schemas';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const levelConfig: {
  [key: string]: {
    labels: { [key: number]: { label: string; icon: React.ReactNode } };
    color: string;
  };
} = {
  mood: {
    labels: {
      1: { label: 'Very Bad', icon: <Frown className="h-5 w-5" /> },
      2: { label: 'Bad', icon: <Frown className="h-5 w-5" /> },
      3: { label: 'Neutral', icon: <Meh className="h-5 w-5" /> },
      4: { label: 'Good', icon: <Smile className="h-5 w-5" /> },
      5: { label: 'Very Good', icon: <Smile className="h-5 w-5" /> },
    },
    color: 'text-blue-500',
  },
  pain: {
    labels: {
      1: { label: 'None', icon: <Smile className="h-5 w-5" /> },
      2: { label: 'Mild', icon: <Meh className="h-5 w-5" /> },
      3: { label: 'Moderate', icon: <Frown className="h-5 w-5" /> },
      4: { label: 'Severe', icon: <Frown className="h-5 w-5" /> },
      5: { label: 'Very Severe', icon: <Frown className="h-5 w-5" /> },
    },
    color: 'text-red-500',
  },
  sleep: {
    labels: {
      1: { label: 'Very Poor', icon: <Bed className="h-5 w-5" /> },
      2: { label: 'Poor', icon: <Bed className="h-5 w-5" /> },
      3: { label: 'Average', icon: <Bed className="h-5 w-5" /> },
      4: { label: 'Good', icon: <Bed className="h-5 w-5" /> },
      5: { label: 'Excellent', icon: <Bed className="h-5 w-5" /> },
    },
    color: 'text-purple-500',
  },
  energy: {
    labels: {
      1: { label: 'Very Low', icon: <Zap className="h-5 w-5" /> },
      2: { label: 'Low', icon: <Zap className="h-5 w-5" /> },
      3: { label: 'Medium', icon: <Zap className="h-5 w-5" /> },
      4: { label: 'High', icon: <Zap className="h-5 w-5" /> },
      5: { label: 'Very High', icon: <Zap className="h-5 w-5" /> },
    },
    color: 'text-yellow-500',
  },
};

function JournalEntryDialog({
  onEntryAdded,
}: {
  onEntryAdded: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
}) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState([3]);
  const [pain, setPain] = useState([1]);
  const [sleep, setSleep] = useState([3]);
  const [energy, setEnergy] = useState([3]);
  const [symptoms, setSymptoms] = useState('');
  const [medications, setMedications] = useState('');
  const [activities, setActivities] = useState('');
  const [diet, setDiet] = useState('');
  const { t } = useTranslation();

  const handleAddEntry = () => {
    const newEntry: Omit<JournalEntry, 'id' | 'date'> = {
      notes,
      mood: mood[0],
      pain: pain[0],
      sleep: sleep[0],
      energy: energy[0],
      symptoms: symptoms.split(',').map(s => s.trim()).filter(Boolean),
      medications: medications.split(',').map(s => s.trim()).filter(Boolean),
      activities: activities.split(',').map(s => s.trim()).filter(Boolean),
      diet,
    };

    onEntryAdded(newEntry);

    toast({
      title: 'Journal Entry Added',
      description: 'Your thoughts and feelings have been recorded.',
    });

    setIsOpen(false);
    setNotes('');
    setMood([3]);
    setPain([1]);
    setSleep([3]);
    setEnergy([3]);
    setSymptoms('');
    setMedications('');
    setActivities('');
    setDiet('');
  };

  const renderSlider = (
    label: string,
    value: number[],
    setValue: (value: number[]) => void,
    type: 'mood' | 'pain' | 'sleep' | 'energy'
  ) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor={`journal-${label}`}>{label}</Label>
        <span className={`text-sm font-medium ${levelConfig[type].color}`}>
          {levelConfig[type].labels[value[0]].label}
        </span>
      </div>
      <Slider
        id={`journal-${label}`}
        min={1}
        max={5}
        step={1}
        value={value}
        onValueChange={setValue}
      />
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Journal Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Journal Entry</DialogTitle>
          <DialogDescription>
            Record your thoughts, feelings, and symptoms for today.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-2">
          <div className="space-y-2">
            <Label htmlFor="journal-notes">General Notes</Label>
            <Textarea
              id="journal-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How are you feeling today? Any new thoughts?"
              className="min-h-[80px]"
            />
          </div>
          {renderSlider('Mood', mood, setMood, 'mood')}
          {renderSlider('Pain Level', pain, setPain, 'pain')}
          {renderSlider('Sleep Quality', sleep, setSleep, 'sleep')}
          {renderSlider('Energy Level', energy, setEnergy, 'energy')}
          
          <div className="space-y-2">
            <Label htmlFor="journal-symptoms">Symptoms (comma-separated)</Label>
            <Input
              id="journal-symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., Headache, Nausea, Fatigue"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="journal-meds">Medications Taken (comma-separated)</Label>
            <Input
              id="journal-meds"
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              placeholder="e.g., Metformin, Lisinopril"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="journal-activities">Activities (comma-separated)</Label>
            <Input
              id="journal-activities"
              value={activities}
              onChange={(e) => setActivities(e.target.value)}
              placeholder="e.g., Light exercise, Social outing"
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="journal-diet">Diet / Meals</Label>
            <Textarea
              id="journal-diet"
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              placeholder="What did you eat today?"
              className="min-h-[80px]"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleAddEntry}>Add Entry</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function JournalEntryCard({
  entry,
  onDelete,
}: {
  entry: JournalEntry;
  onDelete: (id: string) => void;
}) {
  const renderMetric = (
    type: 'mood' | 'pain' | 'sleep' | 'energy',
    value: number
  ) => {
    const config = levelConfig[type];
    return (
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-full bg-muted/50 ${config.color}`}>
          {config.labels[value].icon}
        </div>
        <div>
          <p className="text-sm font-medium capitalize">{type}</p>
          <p className="text-xs text-muted-foreground">
            {config.labels[value].label}
          </p>
        </div>
      </div>
    );
  };
  
  const renderDetailSection = (icon: React.ReactNode, title: string, content: React.ReactNode) => {
    if (!content) return null;
    return (
        <div className="flex items-start gap-3">
            <div className="text-muted-foreground mt-1">{icon}</div>
            <div>
                <h4 className="text-sm font-semibold">{title}</h4>
                <div className="text-sm text-muted-foreground">{content}</div>
            </div>
        </div>
    );
  };

  return (
    <Card className="hover:shadow-lg transition-shadow relative group">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <span>Journal Entry</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onDelete(entry.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          {format(new Date(entry.date), 'EEEE, MMMM d, yyyy')} -{' '}
          {formatDistanceToNow(new Date(entry.date), { addSuffix: true })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b">
          {renderMetric('mood', entry.mood)}
          {renderMetric('pain', entry.pain)}
          {renderMetric('sleep', entry.sleep)}
          {renderMetric('energy', entry.energy)}
        </div>
        
        {entry.notes && (
          <p className="text-sm text-muted-foreground pt-4 border-t whitespace-pre-wrap">
            {entry.notes}
          </p>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {renderDetailSection(
                <Stethoscope className="h-4 w-4" />,
                "Symptoms",
                entry.symptoms?.length ? (
                    <div className="flex flex-wrap gap-1">
                        {entry.symptoms.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                    </div>
                ) : <p className="text-xs italic">No symptoms logged.</p>
            )}
            {renderDetailSection(
                <Pill className="h-4 w-4" />,
                "Medications",
                 entry.medications?.length ? (
                    <div className="flex flex-wrap gap-1">
                        {entry.medications.map(m => <Badge key={m} variant="outline">{m}</Badge>)}
                    </div>
                ) : <p className="text-xs italic">No medications logged.</p>
            )}
            {renderDetailSection(
                <Walk className="h-4 w-4" />,
                "Activities",
                entry.activities?.length ? (
                    <div className="flex flex-wrap gap-1">
                        {entry.activities.map(a => <Badge key={a} variant="outline">{a}</Badge>)}
                    </div>
                ) : <p className="text-xs italic">No activities logged.</p>
            )}
            {renderDetailSection(
                <Utensils className="h-4 w-4" />,
                "Diet",
                entry.diet ? <p className="whitespace-pre-wrap">{entry.diet}</p> : <p className="text-xs italic">No diet notes.</p>
            )}
        </div>
        
      </CardContent>
    </Card>
  );
}

function AiSymptomSummary({ entries }: { entries: JournalEntry[] }) {
  const [summary, setSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateSummary = async () => {
    setLoading(true);
    setSummary(null);

    const symptoms: Symptom[] = entries.map(entry => ({
        id: entry.id,
        notes: entry.notes,
        date: entry.date,
        // For simplicity, we'll use 'pain' as the main severity metric
        severity: entry.pain, 
    }));

    try {
      const result = await summarizeSymptoms({ symptoms });
      setSummary(result);
    } catch (error) {
      console.error('Failed to generate AI summary:', error);
      toast({
        variant: 'destructive',
        title: 'AI Analysis Failed',
        description: 'Could not generate a summary for your symptoms at this time.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Symptom Analysis</CardTitle>
        <CardDescription>Get an AI-powered summary of your logged symptoms.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4">Analyzing your symptoms...</p>
          </div>
        ) : summary ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Overall Summary</h4>
              <p className="text-sm text-muted-foreground">{summary.summary}</p>
            </div>
            {summary.patterns.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" /> Patterns Identified
                </h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {summary.patterns.map((pattern: any, i: number) => <li key={i}>{pattern}</li>)}
                </ul>
              </div>
            )}
            {summary.nextSteps.length > 0 && (
               <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <ListChecks className="h-5 w-5" /> Suggested Next Steps
                </h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {summary.nextSteps.map((step: any, i: number) => <li key={i}>{step}</li>)}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center h-48 flex flex-col items-center justify-center">
            <p className="text-muted-foreground mb-4">
              Click the button to generate an analysis of your symptom log.
            </p>
            <Button onClick={handleGenerateSummary} disabled={entries.length === 0}>
              <Bot className="mr-2 h-4 w-4" />
              Generate AI Summary
            </Button>
             {entries.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">Log a symptom to enable this feature.</p>
            )}
          </div>
        )}
      </CardContent>
      {summary && (
        <CardFooter>
            <p className="text-xs text-muted-foreground">
                This analysis was generated by AI and is not a substitute for professional medical advice.
            </p>
        </CardFooter>
      )}
    </Card>
  );
}

export default function JournalPage() {
  const { entries, addEntry, deleteEntry } = useJournal();
  const { t } = useTranslation();
  const { toast } = useToast();

  const chartData = entries
    .map(symptom => ({
      date: format(new Date(symptom.date), 'MMM d'),
      pain: symptom.pain,
      mood: symptom.mood,
      energy: symptom.energy,
      sleep: symptom.sleep,
    }))
    .slice(0, 10)
    .reverse();

  const chartConfig = {
    pain: { label: 'Pain', color: 'hsl(var(--chart-1))' },
    mood: { label: 'Mood', color: 'hsl(var(--chart-2))' },
    energy: { label: 'Energy', color: 'hsl(var(--chart-3))' },
    sleep: { label: 'Sleep', color: 'hsl(var(--chart-4))' },
  } satisfies ChartConfig;

  const handleDownloadJournal = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text('Personal Health Journal', 105, y, { align: 'center' });
    y += 10;

    entries.forEach(entry => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(format(new Date(entry.date), 'EEEE, MMMM d, yyyy'), 15, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`- Mood: ${entry.mood}/5 | Pain: ${entry.pain}/5 | Sleep: ${entry.sleep}/5 | Energy: ${entry.energy}/5`, 20, y);
      y += 7;
      if (entry.notes) {
        const notes = doc.splitTextToSize(`Notes: ${entry.notes}`, 170);
        doc.text(notes, 20, y);
        y += (notes.length * 5) + 5;
      }
    });

    doc.save(`CuraLink_Health_Journal_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast({
        title: "Journal Downloading",
        description: "Your health journal is being generated as a PDF.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
            <NotebookPen className="h-8 w-8" />
            Personal Health Journal
          </h1>
          <p className="text-muted-foreground">
            A private log of your health journey. Only you can see these
            entries.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadJournal} disabled={entries.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Download Journal
          </Button>
          <JournalEntryDialog onEntryAdded={addEntry} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           {entries.length > 0 ? (
            <div className="space-y-6">
              {entries.map((entry) => (
                <JournalEntryCard key={entry.id} entry={entry} onDelete={deleteEntry} />
              ))}
            </div>
            ) : (
                <Card className="flex flex-col items-center justify-center h-full text-center text-muted-foreground border-dashed min-h-[400px]">
                    <CardHeader>
                        <div className="mx-auto bg-secondary rounded-full p-4">
                        <NotebookPen className="h-12 w-12" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="font-semibold text-lg">Your Journal is Empty</p>
                        <p className="text-sm">
                        Click "New Journal Entry" to log your first entry.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
        <div className="space-y-6 lg:col-span-1">
            <AiSymptomSummary entries={entries} />
            <Card>
                <CardHeader>
                    <CardTitle>Recent Trends</CardTitle>
                    <CardDescription>A quick look at your last {chartData.length} entries.</CardDescription>
                </CardHeader>
                <CardContent>
                {entries.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <BarChart accessibilityLayer data={chartData} margin={{ top: 20 }}>
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                fontSize={12}
                            />
                             <YAxis dataKey="pain" domain={[0, 5]} hide />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent 
                                    formatter={(value, name) => (
                                        <div className="flex flex-col">
                                            <span className="capitalize font-medium">{name}</span>
                                            <span>Level: {value} / 5</span>
                                        </div>
                                    )}
                                />}
                            />
                            <Bar dataKey="pain" fill="var(--color-pain)" radius={4} />
                            <Bar dataKey="mood" fill="var(--color-mood)" radius={4} />
                            <Bar dataKey="energy" fill="var(--color-energy)" radius={4} />
                            <Bar dataKey="sleep" fill="var(--color-sleep)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="text-center text-muted-foreground p-8 h-[250px] flex flex-col justify-center">
                        <p className="text-sm">Log your symptoms to see trends here.</p>
                    </div>
                )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
