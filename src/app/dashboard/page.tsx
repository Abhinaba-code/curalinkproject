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
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useEffect, useState } from 'react';
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
import { useForum } from '@/context/forum-provider';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

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

function NewPublicationDialog() {
  const { user } = useAuth();
  const { addPost } = useForum();
  const { toast } = useToast();
  const router = useRouter();
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

    addPost({
      author: {
        id: user.id,
        name: user.name || 'Anonymous Researcher',
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
      title,
      content: abstract,
      tags: ['New Publication', ...tags.split(',').map((t) => t.trim()).filter(Boolean)],
    });

    toast({
      title: 'Publication Shared!',
      description: 'Your new publication has been posted to the community forum.',
    });

    setIsOpen(false);
    setTitle('');
    setAbstract('');
    setTags('');
    router.push('/dashboard/forums');
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
            Share your latest research with the CuraLink community. This will create a post in the forums.
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
          <Button onClick={handlePublish}>Publish to Forum</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-headline text-3xl font-bold">
          Welcome back, {user?.name || 'User'}!
        </h1>
        {user?.role === 'researcher' ? (
            <NewPublicationDialog />
        ) : (
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Track a new symptom
            </Button>
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
