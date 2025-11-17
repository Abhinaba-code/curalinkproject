
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ClinicalTrial } from '@/lib/types';
import { Share2, Star, ExternalLink, Bot, Loader2, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { useFavorites } from '@/context/favorites-provider';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-provider';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  checkTrialEligibility,
  type CheckTrialEligibilityOutput
} from '@/ai/flows/check-trial-eligibility';
import { calculateAge } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

function EligibilityCheckDialog({ trial, user }: { trial: ClinicalTrial, user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckTrialEligibilityOutput | null>(null);

  const handleCheckEligibility = async () => {
    setLoading(true);
    setResult(null);
    try {
      const eligibilityResult = await checkTrialEligibility({
        userProfile: {
          age: user.dob ? calculateAge(new Date(user.dob)) : undefined,
          location: user.location,
          conditions: user.interests,
        },
        trial: {
          eligibilityCriteria: trial.eligibility,
          locations: [trial.location], // Assuming single location for now
        },
      });
      setResult(eligibilityResult);
    } catch (error) {
      console.error('Eligibility check failed:', error);
      // Handle error state in UI
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusIcon = (status: any) => {
    switch(status) {
      case 'Eligible':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'Not Eligible':
        return <XCircle className="h-12 w-12 text-destructive" />;
      case 'Partially Eligible':
        return <HelpCircle className="h-12 w-12 text-amber-500" />;
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Bot className="mr-2 h-4 w-4" />
          Check Eligibility
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>AI Eligibility Check</DialogTitle>
          <DialogDescription>
            Comparing your profile to the criteria for: {trial.title}
          </DialogDescription>
        </DialogHeader>
        
        {!result && !loading && (
          <div className="py-8 text-center">
            <p className="mb-4 text-muted-foreground">
                This AI-powered tool provides a preliminary check based on your profile. It is not medical advice.
            </p>
            <Button onClick={handleCheckEligibility}>
                <Bot className="mr-2 h-4 w-4" />
                Start AI Check
            </Button>
          </div>
        )}
        
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4">Analyzing criteria...</p>
          </div>
        )}
        
        {result && (
          <div className="space-y-4 py-4">
              <div className="flex flex-col items-center text-center gap-2">
                 {getStatusIcon(result.status)}
                <h3 className="text-xl font-bold">{result.status}</h3>
                <p className="text-muted-foreground">{result.explanation}</p>
              </div>

            {result.matchedCriteria.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-600">Potential Matches</h4>
                <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {result.matchedCriteria.map((item: any, i: number) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            )}
            
            {result.unmatchedCriteria.length > 0 && (
              <div>
                <h4 className="font-semibold text-amber-600">Areas to Review</h4>
                 <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {result.unmatchedCriteria.map((item: any, i: number) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            )}
            
            <Alert variant="default" className="mt-6">
                <HelpCircle className="h-4 w-4" />
                <AlertTitle>Disclaimer</AlertTitle>
                <AlertDescription>
                    This is an AI-generated assessment and not a substitute for professional medical advice. Always consult with a healthcare provider or the trial coordinator to confirm your eligibility.
                </AlertDescription>
            </Alert>
          </div>
        )}
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function TrialCard({ trial }: { trial: ClinicalTrial }) {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();
  const favorite = isFavorite(trial.id);

  const copyLinkToClipboard = async () => {
    try {
        await navigator.clipboard.writeText(trial.url);
        toast({
          title: 'Link Copied!',
          description: 'The trial link has been copied to your clipboard.',
        });
    } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Copy Failed',
          description: 'Could not copy the link to your clipboard.',
        });
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: trial.title,
      text: `Check out this clinical trial: ${trial.title}`,
      url: trial.url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // If share fails, copy to clipboard
        await copyLinkToClipboard();
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      await copyLinkToClipboard();
    }
  };
  
  const statusColor = trial.status === 'Recruiting' ? 'bg-green-500' : 'bg-yellow-500';

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-lg font-bold leading-tight">{trial.title}</CardTitle>
            <Badge variant="outline" className="shrink-0">
              <span className={`w-2 h-2 rounded-full ${statusColor} mr-2`}></span>
              {trial.status}
            </Badge>
          </div>
          <CardDescription>{trial.id} &middot; {trial.phase}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-3">{trial.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {trial.tags.slice(0,3).map(tag => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2">
            {user?.role === 'patient' && (
              <div className="w-full mb-2">
                  <EligibilityCheckDialog trial={trial} user={user} />
              </div>
            )}
             <div className="flex justify-between items-center w-full">
                <a href={trial.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    View on clinicaltrials.gov
                </a>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => toggleFavorite(trial, 'trial')}>
                    <Star className={`h-5 w-5 ${favorite ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </CardFooter>
      </Card>
    </>
  );
}
