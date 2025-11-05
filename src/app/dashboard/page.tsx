
'use client';

import { useAuth } from '@/context/auth-provider';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  FlaskConical,
  PlusCircle,
  Users,
  Bot,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useEffect, useState, useCallback } from 'react';
import {
  generatePersonalizedFeed,
  type GeneratePersonalizedFeedOutput,
} from '@/ai/flows/ai-generate-personalized-feed';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import type { Publication } from '@/lib/types';
import { format } from 'date-fns';

const chartData = [
  { month: 'January', desktop: 186 },
  { month: 'February', desktop: 305 },
  { month: 'March', desktop: 237 },
  { month: 'April', desktop: 73 },
  { month: 'May', desktop: 209 },
  { month: 'June', desktop: 214 },
];
const chartConfig = {
  desktop: {
    label: 'Progress',
    color: 'hsl(var(--primary))',
  },
};

function PersonalizedFeed() {
  const { user } = useAuth();
  const [feed, setFeed] =
    useState<GeneratePersonalizedFeedOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getFeed() {
      setLoading(true);
      try {
        const userInterests =
          user?.interests && user.interests.length > 0
            ? user.interests
            : ['General Health', 'Medical Research'];

        const result = await generatePersonalizedFeed({
          interests: userInterests,
        });
        setFeed(result);
      } catch (error) {
        console.error('Failed to generate personalized feed:', error);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      getFeed();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!feed || feed.feed.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed">
        <p className="text-muted-foreground">
          Could not generate a feed at this time.
        </p>
      </div>
    );
  }

  const getIcon = (type: 'trial' | 'publication' | 'expert') => {
    switch (type) {
      case 'trial':
        return <FlaskConical className="h-5 w-5 text-primary" />;
      case 'publication':
        return <FileText className="h-5 w-5 text-primary" />;
      case 'expert':
        return <Users className="h-5 w-5 text-primary" />;
      default:
        return <Bot className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-4">
      {feed.feed.map((item, index) => (
        <div
          key={index}
          className="flex gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50"
        >
          <div className="mt-1">{getIcon(item.type)}</div>
          <div>
            <h4 className="font-semibold">{item.title}</h4>
            <p className="text-sm text-muted-foreground">{item.summary}</p>
            <Link
              href={item.link}
              className="mt-2 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Learn More <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

interface Announcement extends Publication {
  tags?: string[];
}

function NewPublicationDialog({ onAnnounce }: { onAnnounce: (announcement: Announcement) => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [tags, setTags] = useState('');

  const handlePublish = () => {
    if (!title || !abstract || !user) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide a title and abstract.',
      });
      return;
    }

    const newAnnouncement: Announcement = {
        id: `pub-${Date.now()}`,
        title,
        abstract,
        authors: [user.name || 'Anonymous Researcher'],
        journal: 'CuraLink Announcements',
        year: new Date().getFullYear(),
        doi: '',
        url: '#',
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    onAnnounce(newAnnouncement);

    toast({
      title: 'Publication Announced!',
      description: 'Your new publication has been posted to the dashboard.',
    });

    setIsOpen(false);
    setTitle('');
    setAbstract('');
    setTags('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Announce Publication
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Announce a New Publication</DialogTitle>
          <DialogDescription>
            Share your latest research with the CuraLink community. This will create a post on the dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pub-title">Publication Title</Label>
              <Input
                id="pub-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., A novel approach to..."
              />
            </div>
            <div className="space-y-2">
                <Label htmlFor="pub-abstract">Abstract / Summary</Label>
                <Textarea
                    id="pub-abstract"
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    placeholder="Provide a summary of your findings."
                    className="min-h-[120px]"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="pub-tags">Tags</Label>
                <Input
                    id="pub-tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g., Oncology, Immunotherapy (comma-separated)"
                />
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handlePublish}>Publish to Dashboard</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Announcements({ announcements }: { announcements: Announcement[] }) {
    if (announcements.length === 0) {
        return (
            <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
                <p>No announcements yet.</p>
                <p className="text-sm">Researchers can announce publications from the dashboard.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {announcements.map((ann) => (
                <Card key={ann.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle>{ann.title}</CardTitle>
                        <CardDescription>{ann.authors.join(', ')} &middot; {ann.journal}, {ann.year}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{ann.abstract}</p>
                        {ann.tags && ann.tags.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {ann.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

interface TrackedSymptom {
  id: string;
  name: string;
  notes: string;
  date: string;
}

function TrackSymptomDialog({ onSymptomTracked }: { onSymptomTracked: (symptom: TrackedSymptom) => void }) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [symptom, setSymptom] = useState('');
  const [notes, setNotes] = useState('');

  const handleTrackSymptom = () => {
    if (!symptom) {
      toast({
        variant: 'destructive',
        title: 'Symptom name required',
        description: 'Please enter the name of the symptom.',
      });
      return;
    }

    const newSymptom: TrackedSymptom = {
        id: `symp-${Date.now()}`,
        name: symptom,
        notes,
        date: new Date().toISOString(),
    };
    
    onSymptomTracked(newSymptom);

    toast({
      title: 'Symptom Tracked',
      description: `Your symptom "${symptom}" has been logged.`,
    });

    setIsOpen(false);
    setSymptom('');
    setNotes('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Track a new symptom
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Track a New Symptom</DialogTitle>
          <DialogDescription>
            Log a new symptom you are experiencing. This information is for your personal tracking.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="symptom-name">Symptom Name</Label>
            <Input
              id="symptom-name"
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder="e.g., Headache, Fatigue"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="symptom-notes">Notes (Optional)</Label>
            <Textarea
              id="symptom-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the symptom, its severity, frequency, etc."
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleTrackSymptom}>Log Symptom</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SymptomLog({ symptoms, onClearSymptom }: { symptoms: TrackedSymptom[], onClearSymptom: (id: string) => void }) {
  if (symptoms.length === 0) {
    return (
      <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
        <p>No symptoms logged yet.</p>
        <p className="text-sm">Click "Track a new symptom" to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {symptoms.map((symptom) => (
        <Card key={symptom.id} className="hover:shadow-lg transition-shadow relative group">
          <CardHeader>
            <CardTitle className="flex justify-between items-start">
              <span>{symptom.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onClearSymptom(symptom.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>{format(new Date(symptom.date), 'PPP p')}</CardDescription>
          </CardHeader>
          {symptom.notes && (
            <CardContent>
              <p className="text-sm text-muted-foreground">{symptom.notes}</p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}


export default function DashboardPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [symptoms, setSymptoms] = useState<TrackedSymptom[]>([]);

  const getStorageKey = useCallback((type: 'announcements' | 'symptoms') => {
    if (!user) return null;
    return `cura-${type}-${user.id}`;
  }, [user]);

  useEffect(() => {
    const announcementsKey = getStorageKey('announcements');
    const symptomsKey = getStorageKey('symptoms');

    if (announcementsKey) {
      const storedAnnouncements = localStorage.getItem(announcementsKey);
      if (storedAnnouncements) setAnnouncements(JSON.parse(storedAnnouncements));
      else setAnnouncements([]);
    }

    if (symptomsKey) {
      const storedSymptoms = localStorage.getItem(symptomsKey);
      if (storedSymptoms) setSymptoms(JSON.parse(storedSymptoms));
      else setSymptoms([]);
    }
  }, [user, getStorageKey]);

  const handleAnnounce = (newAnnouncement: Announcement) => {
    const announcementsKey = getStorageKey('announcements');
    if (!announcementsKey) return;
    const updatedAnnouncements = [newAnnouncement, ...announcements];
    setAnnouncements(updatedAnnouncements);
    localStorage.setItem(announcementsKey, JSON.stringify(updatedAnnouncements));
  };

  const handleSymptomTracked = (newSymptom: TrackedSymptom) => {
    const symptomsKey = getStorageKey('symptoms');
    if (!symptomsKey) return;
    const updatedSymptoms = [newSymptom, ...symptoms];
    setSymptoms(updatedSymptoms);
    localStorage.setItem(symptomsKey, JSON.stringify(updatedSymptoms));
  };
  
  const handleClearSymptom = (id: string) => {
    const symptomsKey = getStorageKey('symptoms');
    if (!symptomsKey) return;
    const updatedSymptoms = symptoms.filter(s => s.id !== id);
    setSymptoms(updatedSymptoms);
    localStorage.setItem(symptomsKey, JSON.stringify(updatedSymptoms));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-headline text-3xl font-bold">
          Welcome back, {user?.name || 'User'}!
        </h1>
        {user?.role === 'researcher' ? (
            <NewPublicationDialog onAnnounce={handleAnnounce} />
        ) : (
            <TrackSymptomDialog onSymptomTracked={handleSymptomTracked} />
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/trials">
                <FlaskConical className="mr-2 h-4 w-4" />
                Find Clinical Trials
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/publications">
                <FileText className="mr-2 h-4 w-4" />
                Browse Publications
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/experts">
                <Users className="mr-2 h-4 w-4" />
                Discover Health Experts
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personalized Feed</CardTitle>
            <CardDescription>
              AI-powered updates relevant to your profile and interests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PersonalizedFeed />
          </CardContent>
        </Card>

        {user?.role === 'patient' && (
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Symptom Log</CardTitle>
                    <CardDescription>
                        A log of the symptoms you have tracked over time.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SymptomLog symptoms={symptoms} onClearSymptom={handleClearSymptom} />
                </CardContent>
            </Card>
        )}

        {user?.role === 'researcher' && (
             <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Recent Announcements</CardTitle>
                    <CardDescription>
                        Latest publications announced by researchers on CuraLink.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Announcements announcements={announcements} />
                </CardContent>
            </Card>
        )}

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Health Insights</CardTitle>
            <CardDescription>January - June 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    

    