import { LifeBuoy } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function HelpPage() {
  return (
    <main className="flex-1">
      <section id="help" className="py-20 md:py-32">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <LifeBuoy className="h-12 w-12 text-primary mb-4 mx-auto" />
            <h1 className="font-headline text-4xl font-bold">Help Center</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Welcome to the CuraLink Help Center. Find answers to common questions and learn how to use our platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-16">
              <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><a href="/dashboard/profile" className="text-primary underline">How to set up your profile?</a></p>
                <p><a href="/dashboard" className="text-primary underline">Navigating your dashboard.</a></p>
              </CardContent>
            </Card>
              <Card>
              <CardHeader>
                <CardTitle>For Patients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><a href="/dashboard/trials" className="text-primary underline">How to find clinical trials?</a></p>
                <p><a href="/dashboard/experts" className="text-primary underline">How to connect with experts?</a></p>
              </CardContent>
            </Card>
              <Card>
              <CardHeader>
                <CardTitle>For Researchers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><a href="/dashboard/publications" className="text-primary underline">How to search publications?</a></p>
                  <p>How to list a new clinical trial?</p>
              </CardContent>
            </Card>
              <Card>
              <CardHeader>
                <CardTitle>Account & Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>How to change your password?</p>
                <p>Is my data secure?</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-16">
            <h2 className="font-bold text-2xl">Still need help?</h2>
            <p className="text-muted-foreground mt-2">
              Our support team is here for you.
            </p>
            <div className="mt-4">
              <a href="/dashboard/contact" className="text-primary underline">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
