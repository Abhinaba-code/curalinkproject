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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MessageSquare,
  ArrowUpCircle,
  Share2,
  PlusCircle,
  Badge,
} from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const samplePosts = [
  {
    id: 'post-1',
    author: {
      name: 'Dr. Evelyn Reed',
      avatarUrl: 'https://picsum.photos/seed/expert1/200/200',
      role: 'Researcher',
    },
    title:
      'Breakthrough in Glioblastoma Research: A New Immunotherapy Approach',
    content:
      "Our latest study published in the New England Journal of Medicine explores a novel CAR-T cell therapy targeting a specific protein expressed on glioblastoma cells. We've seen promising results in our pre-clinical models, with significant tumor regression and minimal off-target effects. This could be a game-changer for patients with this devastating disease. We are now moving towards a Phase I clinical trial and are looking for eligible participants. Happy to answer any questions from patients, caregivers, or fellow researchers.",
    upvotes: 128,
    comments: 42,
    tags: ['Glioblastoma', 'Immunotherapy', 'Clinical Trial'],
  },
  {
    id: 'post-2',
    author: {
      name: 'John Anderson',
      avatarUrl: 'https://picsum.photos/seed/patient2/200/200',
      role: 'Patient',
    },
    title: 'My Experience with Clinical Trial NCT04485958 for Lung Cancer',
    content:
      "I was diagnosed with Stage IV non-small cell lung cancer two years ago. After standard chemotherapy stopped working, my oncologist suggested I enroll in a clinical trial for a new targeted therapy. It's been a tough journey, but I wanted to share my experience for others in a similar situation. The side effects have been manageable, and my recent scans showed that the tumors are shrinking. It's not a cure, but it's given me more time. If you're considering a trial, I highly recommend talking to your doctor about it.",
    upvotes: 256,
    comments: 98,
    tags: ['Lung Cancer', 'Patient Story', 'Targeted Therapy'],
  },
  {
    id: 'post-3',
    author: {
      name: 'Dr. Ben Carter',
      avatarUrl: 'https://picsum.photos/seed/expert2/200/200',
      role: 'Researcher',
    },
    title:
      'AMA: I am a neurologist specializing in neurodegenerative diseases. Ask Me Anything!',
    content:
      "Hi CuraLink community, I'm Dr. Ben Carter. My lab at Johns Hopkins focuses on understanding the genetic underpinnings of diseases like ALS and Parkinson's. We are particularly interested in the role of a gene called C9orf72. I'm here to answer your questions about the latest research, what it's like to be a neurologist, or anything else on your mind.",
    upvotes: 512,
    comments: 215,
    tags: ['Neurology', 'ALS', 'Parkinsons', 'AMA'],
  },
];

function PostCard({ post }: { post: (typeof samplePosts)[0] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
            <AvatarFallback>
              {post.author.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{post.author.name}</p>
            <p className="text-sm text-muted-foreground">{post.author.role}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-xl font-bold mb-2">{post.title}</CardTitle>
        <p className="text-muted-foreground line-clamp-3">{post.content}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <div key={tag} className="text-xs border px-2 py-1 rounded-full">
              {tag}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-4 text-muted-foreground">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5" />
            <span>{post.upvotes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <span>{post.comments} Comments</span>
          </Button>
        </div>
        <Button variant="ghost" size="icon">
          <Share2 className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function ForumsPage() {
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-headline text-3xl font-bold">
              Community Forums
            </h1>
            <p className="text-muted-foreground">
              Connect with patients, caregivers, and researchers.
            </p>
          </div>
          <Button onClick={() => setIsNewPostOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Post
          </Button>
        </div>

        <div className="space-y-6">
          {samplePosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
      <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Create a New Post</DialogTitle>
            <DialogDescription>
              Share your story, ask a question, or start a discussion.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                placeholder="A clear and concise title"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="content" className="text-right pt-2">
                Content
              </Label>
              <Textarea
                id="content"
                placeholder="Write your post content here. You can use markdown for formatting."
                className="col-span-3 min-h-[150px]"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tags" className="text-right">
                Tags
              </Label>
              <Input
                id="tags"
                placeholder="e.g., Lung Cancer, Patient Story (comma-separated)"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Post to Forum</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}