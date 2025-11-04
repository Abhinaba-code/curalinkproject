'use client';

import { useAuth } from '@/context/auth-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, FlaskConical, PlusCircle, Users } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

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
            <Button variant="outline"><FlaskConical className="mr-2 h-4 w-4" />Find Clinical Trials</Button>
            <Button variant="outline"><FileText className="mr-2 h-4 w-4" />Browse Publications</Button>
            <Button variant="outline"><Users className="mr-2 h-4 w-4" />Discover Experts</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personalized Feed</CardTitle>
            <CardDescription>Updates relevant to your profile and interests.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Your personalized feed is coming soon.</p>
            </div>
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
