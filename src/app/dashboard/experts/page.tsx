'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function ExpertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">
          Connect with Experts
        </h1>
        <p className="text-muted-foreground">
          Find collaborators and specialists in your field.
        </p>
      </div>
      <Card className="flex items-center justify-center h-96 border-dashed">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Users className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle>Coming Soon!</CardTitle>
          <CardContent>
            <p className="text-muted-foreground">
              Our expert connection features are under construction.
            </p>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
}
