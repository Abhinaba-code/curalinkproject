
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
  CornerDownRight,
  Smile,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForum, type ForumPost, type PostReply, type Reactions } from '@/context/forum-provider';
import { useAuth } from '@/context/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/context/language-provider';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢'];

function EmojiReactions({
  reactions = {},
  onSelect,
  canReact,
}: {
  reactions: Reactions;
  onSelect: (emoji: string) => void;
  canReact: boolean;
}) {
  const { user } = useAuth();
  if (!user) return null;

  const reactionEntries = Object.entries(reactions);

  return (
    <div className="flex items-center gap-2">
      {reactionEntries.length > 0 &&
        reactionEntries.map(([emoji, userIds]) =>
          userIds.length > 0 ? (
            <button
              key={emoji}
              onClick={() => canReact && onSelect(emoji)}
              className={cn(
                'flex items-center gap-1 rounded-full border bg-secondary/50 px-2 py-0.5 text-xs transition-colors hover:bg-secondary',
                userIds.includes(user.id) &&
                  'border-primary bg-primary/10 text-primary',
                !canReact && 'cursor-not-allowed'
              )}
            >
              <span>{emoji}</span>
              <span>{userIds.length}</span>
            </button>
          ) : null
        )}

      {canReact && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
            >
              <Smile className="h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-1">
            <div className="flex gap-1">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onSelect(emoji)}
                  className="rounded-md p-2 text-xl transition-transform hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}


function ReplyCard({ reply, postId }: { reply: PostReply; postId: string }) {
  const { user } = useAuth();
  const { toggleReplyReaction, deleteReply } = useForum();
  const { toast } = useToast();

  const canReact = user?.role === 'patient' && reply.author.role === 'researcher';
  const canDelete = user?.id === reply.author.id;
  
  const handleDelete = () => {
    deleteReply(postId, reply.id);
    toast({
        title: 'Reply Deleted',
        description: 'Your reply has been permanently removed.'
    });
  }

  return (
    <div className="flex items-start gap-3 pl-8 mt-4 border-l-2 border-primary/20">
      <Avatar className="h-8 w-8">
        <AvatarImage src={reply.author.avatarUrl} alt={reply.author.name} />
        <AvatarFallback>
          {reply.author.name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">{reply.author.name}</p>
                <p className="text-xs text-muted-foreground">{reply.author.role}</p>
            </div>
            {canDelete && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive"/>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your reply.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{reply.content}</p>
        <div className="mt-2">
           <EmojiReactions
            reactions={reply.reactions}
            onSelect={(emoji) => toggleReplyReaction(postId, reply.id, emoji)}
            canReact={!!canReact}
          />
        </div>
      </div>
    </div>
  );
}


function PostCard({ post, onTagClick }: { post: ForumPost, onTagClick: (tag: string) => void }) {
  const { addReply, togglePostReaction, deletePost } = useForum();
  const { user } = useAuth();
  const [replyContent, setReplyContent] = useState('');
  const [showReplyInput, setShowReplyInput] = useState(false);
  const { toast } = useToast();

  const handleAddReply = () => {
    if (!replyContent.trim() || !user) return;
    addReply(post.id, replyContent);
    setReplyContent('');
    setShowReplyInput(false);
    toast({
        title: 'Reply Posted!',
        description: 'Your reply has been added to the post.'
    });
  };

  const handleDeletePost = () => {
    deletePost(post.id);
    toast({
      variant: 'destructive',
      title: 'Post Deleted',
      description: 'Your post has been permanently removed from the forum.',
    });
  };

  const canReactToPost = user?.role === 'researcher' && post.author.role === 'patient';
  const canDeletePost = user?.id === post.author.id;
  const canReplyToPost = user?.role === 'researcher' || (user?.role === 'patient' && user?.id === post.author.id);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
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
           {canDeletePost && (
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive"/>
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your post and all its replies.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePost}>Delete Post</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-xl font-bold mb-2">{post.title}</CardTitle>
        <p className="text-muted-foreground whitespace-pre-wrap">{post.content}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <button key={tag} onClick={() => onTagClick(tag)} className="text-xs border px-2 py-1 rounded-full hover:bg-secondary">
              {tag}
            </button>
          ))}
        </div>
        <div className="mt-4">
           <EmojiReactions
            reactions={post.reactions}
            onSelect={(emoji) => togglePostReaction(post.id, emoji)}
            canReact={!!canReactToPost}
          />
        </div>
        <div className="mt-6 space-y-4">
            {post.replies?.map(reply => (
                <ReplyCard key={reply.id} reply={reply} postId={post.id} />
            ))}
        </div>

      </CardContent>
      <CardFooter className="flex-col items-start gap-4">
        <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-4 text-muted-foreground">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowUpCircle className="h-5 w-5" />
                <span>{post.upvotes}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => setShowReplyInput(!showReplyInput)}>
                <MessageSquare className="h-5 w-5" />
                <span>{post.replies?.length || 0} Comments</span>
            </Button>
            </div>
            <Button variant="ghost" size="icon">
            <Share2 className="h-5 w-5" />
            </Button>
        </div>
        {showReplyInput && canReplyToPost && (
            <div className="w-full pl-10 flex gap-2">
                <Textarea 
                    placeholder={`Replying to ${post.author.name}...`}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[60px]"
                />
                <Button onClick={handleAddReply}>Reply</Button>
            </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default function ForumsPage() {
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const { posts, addPost } = useForum();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleCreatePost = () => {
    if (!title || !content || !user) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Post',
        description: 'Please provide a title and content for your post.',
      });
      return;
    }
    
    let finalTags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    if(user.isPremium) {
        finalTags = ["Expert Q&A", ...finalTags];
    }

    addPost({
      title,
      content,
      tags: finalTags,
    });
    
    toast({
      title: 'Post Created!',
      description: 'Your post has been successfully added to the forum.',
    });

    // Reset form and close dialog
    setTitle('');
    setContent('');
    setTags('');
    setIsNewPostOpen(false);
  };
  
  const handleTagClick = (tag: string) => {
    setFilterTag(tag);
  };

  const clearFilter = () => {
    setFilterTag(null);
  }

  const filteredPosts = filterTag
    ? posts.filter(post => post.tags.includes(filterTag))
    : posts;

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
          {user && (
            <Button onClick={() => setIsNewPostOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Post
            </Button>
          )}
        </div>

        {filterTag && (
          <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
            <p className="font-semibold">Filtering by tag: <span className="px-2 py-1 bg-background rounded-full text-sm">{filterTag}</span></p>
            <Button variant="ghost" onClick={clearFilter}>Clear Filter</Button>
          </div>
        )}

        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} onTagClick={handleTagClick} />
          ))}
        </div>
      </div>
      <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader className="text-left">
            <DialogTitle>Create a New Post</DialogTitle>
            <DialogDescription>
              Share your story, ask a question, or start a discussion. Add tags for diseases or topics to help researchers find your post.
              {user?.isPremium && <span className="font-bold text-primary block mt-1">As a premium member, your post will be prioritized for expert review.</span>}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
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
                value={content}
                onChange={e => setContent(e.target.value)}
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
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="e.g., Lung Cancer, Patient Story, Glioblastoma"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreatePost}>Post to Forum</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
