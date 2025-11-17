
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
  const { t } = useTranslation();

  const handleAddEntry = () => {
    const newEntry: Omit<JournalEntry, 'id' | 'date'> = {
      notes,
      mood: mood[0],
      pain: pain[0],
      sleep: sleep[0],
      energy: energy[0],
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
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="journal-notes">Daily Notes</Label>
            <Textarea
              id="journal-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How are you feeling today? Any new symptoms or thoughts?"
              className="min-h-[80px]"
            />
          </div>
          {renderSlider('Mood', mood, setMood, 'mood')}
          {renderSlider('Pain Level', pain, setPain, 'pain')}
          {renderSlider('Sleep Quality', sleep, setSleep, 'sleep')}
          {renderSlider('Energy Level', energy, setEnergy, 'energy')}
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
        {entry.notes && (
          <p className="text-sm text-muted-foreground pt-4 border-t whitespace-pre-wrap">
            {entry.notes}
          </p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          {renderMetric('mood', entry.mood)}
          {renderMetric('pain', entry.pain)}
          {renderMetric('sleep', entry.sleep)}
          {renderMetric('energy', entry.energy)}
        </div>
      </CardContent>
    </Card>
  );
}

export default function JournalPage() {
  const { entries, addEntry, deleteEntry } = useJournal();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
        <JournalEntryDialog onEntryAdded={addEntry} />
      </div>

      {entries.length > 0 ? (
        <div className="space-y-6">
          {entries.map((entry) => (
            <JournalEntryCard key={entry.id} entry={entry} onDelete={deleteEntry} />
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center h-80 text-center text-muted-foreground border-dashed">
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
  );
}
