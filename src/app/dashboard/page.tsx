'use client';

import { useAuth } from '@/context/auth-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, FlaskConical, PlusCircle, Users, Bot, Loader2, ExternalLink } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useEffect, useState } from 'react';
import { generatePersonalizedFeed, type GeneratePersonalizedFeedOutput } from '@/ai/flows/ai-generate-personalized-feed';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
]
const chartConfig = {
  desktop: {
    label: "Progress",
    color: "hsl(var(--primary))",
  },
}

function PersonalizedFeed() {
  const [feed, setFeed] = useState<GeneratePersonalizedFeedOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getFeed() {
      setLoading(true);
      try {
        // In a real app, you would fetch the user's actual interests.
        // We'll use mock interests for this demonstration.
        const mockInterests = ["Glioblastoma", "Immunotherapy", "Cancer Research"];
        const result = await generatePersonalizedFeed({ interests: mockInterests });
        setFeed(result);
      } catch (error) {
        console.error("Failed to generate personalized feed:", error);
        // Optionally set an error state here
      } finally {
        setLoading(false);
      }
    }
    getFeed();
  }, []);

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
      <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">Could not generate a feed at this time.</p>
      </div>
    );
  }

  const getIcon = (type: 'trial' | 'publication' | 'expert') => {
    switch (type) {
      case 'trial': return <FlaskConical className="h-5 w-5 text-primary" />;
      case 'publication': return <FileText className="h-5 w-5 text-primary" />;
      case 'expert': return <Users className="h-5 w-5 text-primary" />;
      default: return <Bot className="h-5 w-5 text-primary" />;
    }
  }

  return (
    <div className="space-y-4">
      {feed.feed.map((item, index) => (
        <div key={index} className="flex gap-4 p-4 border rounded-lg">
          <div className="mt-1">{getIcon(item.type)}</div>
          <div>
            <h4 className="font-semibold">{item.title}</h4>
            <p className="text-sm text-muted-foreground">{item.summary}</p>
            <Link href={item.link} passHref legacyBehavior>
                <a className="text-sm font-medium text-primary hover:underline flex items-center gap-1 mt-2">
                    Learn More <ExternalLink className="h-3 w-3" />
                </a>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}


export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-headline text-3xl font-bold">
          Welcome back, {user?.name}!
        </h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          {user?.role === 'patient' ? 'Track a new symptom' : 'Add new publication'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button variant="outline" asChild><Link href="/dashboard/trials"><FlaskConical className="mr-2 h-4 w-4" />Find Clinical Trials</Link></Button>
            <Button variant="outline" asChild><Link href="/dashboard/publications"><FileText className="mr-2 h-4 w-4" />Browse Publications</Link></Button>
            <Button variant="outline" asChild><Link href="/dashboard/experts"><Users className="mr-2 h-4 w-4" />Discover Health Experts</Link></Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personalized Feed</CardTitle>
            <CardDescription>AI-powered updates relevant to your profile and interests.</CardDescription>
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
