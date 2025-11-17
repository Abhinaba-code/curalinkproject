
'use client';

import { useAuth } from '@/context/auth-provider';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
  HeartPulse,
  BookUser,
  Star,
  MessageSquare,
  Loader2,
  TrendingUp,
  ListChecks,
} from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
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
import { useFavorites } from '@/context/favorites-provider';
import { useFollow } from '@/context/follow-provider';
import { useForum } from '@/context/forum-provider';
import { Slider } from '@/components/ui/slider';
import { type ChartConfig } from '@/components/ui/chart';
import { summarizeSymptoms } from '@/ai/flows/summarize-symptoms';
import { useJournal } from '@/context/journal-provider';


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

function AiSymptomSummary({ symptoms }: { symptoms: any[] }) {
  const [summary, setSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateSummary = async () => {
    setLoading(true);
    setSummary(null);
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
            <Button onClick={handleGenerateSummary} disabled={symptoms.length === 0}>
              <Bot className="mr-2 h-4 w-4" />
              Generate AI Summary
            </Button>
             {symptoms.length === 0 && (
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


const ActivityItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) => (
    <div className="flex items-center gap-3 rounded-md border p-3">
        <div className="text-primary">{icon}</div>
        <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    </div>
);


export default function DashboardPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const { entries: symptoms, addEntry: handleSymptomTracked, deleteEntry: handleClearSymptom } = useJournal();

  const { favorites } = useFavorites();
  const { followedExperts } = useFollow();
  const { posts } = useForum();

  const savedTrialsCount = favorites.filter(f => f.type === 'trial').length;
  const savedPublicationsCount = favorites.filter(f => f.type === 'publication').length;
  const followedExpertsCount = followedExperts.length;
  const symptomsLoggedCount = symptoms.length;
  const forumPostsCount = user ? posts.filter(p => p.author.id === user.id).length : 0;
  
  const getStorageKey = useCallback((type: 'announcements') => {
    if (!user) return null;
    return `cura-${type}-${user.id}`;
  }, [user]);

  useEffect(() => {
    const announcementsKey = getStorageKey('announcements');

    if (announcementsKey) {
      const storedAnnouncements = localStorage.getItem(announcementsKey);
      if (storedAnnouncements) setAnnouncements(JSON.parse(storedAnnouncements));
      else setAnnouncements([]);
    }
  }, [user, getStorageKey]);

  const handleAnnounce = (newAnnouncement: Announcement) => {
    const announcementsKey = getStorageKey('announcements');
    if (!announcementsKey) return;
    const updatedAnnouncements = [newAnnouncement, ...announcements];
    setAnnouncements(updatedAnnouncements);
    localStorage.setItem(announcementsKey, JSON.stringify(updatedAnnouncements));
  };
  
  const chartData = symptoms
    .map(symptom => ({
      date: format(new Date(symptom.date), 'MMM d'),
      pain: symptom.pain,
      mood: symptom.mood,
      energy: symptom.energy,
    }))
    .slice(0, 10) // Show last 10 symptoms for clarity
    .reverse();

  const chartConfig = {
    pain: { label: 'Pain', color: 'hsl(var(--chart-1))' },
    mood: { label: 'Mood', color: 'hsl(var(--chart-2))' },
    energy: { label: 'Energy', color: 'hsl(var(--chart-3))' },
  } satisfies ChartConfig;


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-headline text-3xl font-bold">
          Welcome back, {user?.name || 'User'}!
        </h1>
        {user?.role === 'researcher' && (
            <NewPublicationDialog onAnnounce={handleAnnounce} />
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
                <CardTitle>Activity Snapshot</CardTitle>
                <CardDescription>A summary of your activity on the platform.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <ActivityItem icon={<Star />} label="Saved Trials" value={savedTrialsCount} />
                <ActivityItem icon={<FileText />} label="Saved Publications" value={savedPublicationsCount} />
                <ActivityItem icon={<Users />} label="Followed Experts" value={followedExpertsCount} />
                {user?.role === 'patient' && (
                    <ActivityItem icon={<HeartPulse />} label="Symptoms Logged" value={symptomsLoggedCount} />
                )}
                <ActivityItem icon={<MessageSquare />} label="Forum Posts" value={forumPostsCount} />
            </CardContent>
        </Card>

        {user?.role === 'patient' && (
            <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AiSymptomSummary symptoms={symptoms} />
                <Card>
                    <CardHeader>
                        <CardTitle>Health Insights: Symptoms Over Time</CardTitle>
                        <CardDescription>Visualizing your most recently logged symptoms.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    {symptoms.length > 0 ? (
                            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                <BarChart accessibilityLayer data={chartData}>
                                    <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    />
                                    <YAxis dataKey="pain" domain={[0, 5]} hide />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent 
                                            formatter={(value, name) => (
                                                <div className="flex flex-col">
                                                    <span className="capitalize font-medium">{name}</span>
                                                    <span>Severity: {value} / 5</span>
                                                </div>
                                            )}
                                        />}
                                    />
                                    <Bar dataKey="pain" fill="var(--color-pain)" radius={4} />
                                    <Bar dataKey="mood" fill="var(--color-mood)" radius={4} />
                                    <Bar dataKey="energy" fill="var(--color-energy)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        ) : (
                            <div className="text-center text-muted-foreground p-8 h-[250px] flex flex-col justify-center">
                                <p>No symptom data to display.</p>
                                <p className="text-sm">Log a symptom to see your health trends.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
             </div>
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
      </div>
    </div>
  );
}
