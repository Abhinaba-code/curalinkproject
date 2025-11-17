
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './auth-provider';
import type { Expert, User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';


export interface ForumPostAuthor {
  id: string;
  name: string;
  avatarUrl: string;
  role: 'patient' | 'researcher';
}

export type Reactions = { [emoji: string]: string[] }; // emoji: user_id[]

export interface PostReply {
  id: string;
  author: ForumPostAuthor;
  content: string;
  reactions: Reactions;
}

export interface ForumPost {
  id: string;
  author: ForumPostAuthor;
  title: string;
  content: string;
  upvotes: number;
  tags: string[];
  replies: PostReply[];
  reactions: Reactions;
}

export interface Notification {
  id: string;
  postId: string; // Can be post ID, expert ID, etc.
  postTitle: string; // Can be post title, expert name, etc.
  authorId: string;
  authorName: string;
  read: boolean;
  type: 'new_post' | 'new_reply' | 'nudge' | 'meeting_request' | 'meeting_reply';
  recipientId: string; // Can be a user ID or 'all_researchers'
  originalRequest?: Notification & { content?: string };
  senderId?: string; // ID of the user who triggered the notification
}

const samplePosts: ForumPost[] = [
    {
      id: 'post-1',
      author: {
        id: 'usr_researcher_evelyn',
        name: 'Dr. Evelyn Reed',
        avatarUrl: 'https://picsum.photos/seed/expert1/200/200',
        role: 'researcher',
      },
      title: 'Breakthrough in Glioblastoma Research: A New Immunotherapy Approach',
      content:
        "Our latest study published in the New England Journal of Medicine explores a novel CAR-T cell therapy targeting a specific protein expressed on glioblastoma cells. We've seen promising results in our pre-clinical models, with significant tumor regression and minimal off-target effects. This could be a game-changer for patients with this devastating disease. We are now moving towards a Phase I clinical trial and are looking for eligible participants. Happy to answer any questions from patients, caregivers, or fellow researchers.",
      upvotes: 128,
      tags: ['Glioblastoma', 'Immunotherapy', 'Clinical Trial'],
      replies: [],
      reactions: { '👍': ['usr_patient_john'] },
    },
    {
      id: 'post-2',
      author: {
        id: 'usr_patient_john',
        name: 'John Anderson',
        avatarUrl: 'https://picsum.photos/seed/patient2/200/200',
        role: 'patient',
      },
      title: 'My Experience with Clinical Trial NCT04485958 for Lung Cancer',
      content:
        "I was diagnosed with Stage IV non-small cell lung cancer two years ago. After standard chemotherapy stopped working, my oncologist suggested I enroll in a clinical trial for a new targeted therapy. It's been a tough journey, but I wanted to share my experience for others in a similar situation. The side effects have been manageable, and my recent scans showed that the tumors are shrinking. It's not a cure, but it's given me more time. If you're considering a trial, I highly recommend talking to your doctor about it.",
      upvotes: 256,
      tags: ['Lung Cancer', 'Patient Story', 'Targeted Therapy'],
      replies: [],
      reactions: { '❤️': ['usr_researcher_evelyn'] },
    },
];

const getInitialSampleNotifications = (user: User): Notification[] => {
    if (user.role === 'patient') {
      return [
        {
          id: `notif-${Date.now() + 1}`,
          type: 'new_reply',
          postTitle: "My Experience with Clinical Trial...",
          authorName: "Dr. Evelyn Reed",
          read: false,
          postId: 'post-2', authorId: 'usr_researcher_evelyn', recipientId: user.id, senderId: 'usr_researcher_evelyn'
        },
        {
          id: `notif-${Date.now() + 2}`,
          type: 'meeting_reply',
          postTitle: 'Dr. Ben Carter',
          authorName: 'Dr. Sofia Hernandez',
          read: false,
          postId: 'expert-2', authorId: 'usr_researcher_sofia', recipientId: user.id, senderId: 'usr_researcher_sofia',
          originalRequest: { content: "Thank you for reaching out. Please schedule a time through my assistant." } as any,
        }
      ];
    } else { // researcher
      return [
        {
          id: `notif-${Date.now() + 3}`,
          type: 'new_post',
          postTitle: "My Experience with Clinical Trial...",
          authorName: "John Anderson",
          read: false,
          postId: 'post-2', authorId: 'usr_patient_john', recipientId: 'all_researchers', senderId: 'usr_patient_john'
        },
        {
          id: `notif-${Date.now() + 4}`,
          type: 'nudge',
          postTitle: "Dr. Ben Carter",
          authorName: "A Patient",
          read: true,
          postId: 'expert-2', authorId: 'usr_patient_john', recipientId: 'all_researchers', senderId: 'usr_patient_john'
        }
      ];
    }
  }


interface ForumContextType {
  posts: ForumPost[];
  notifications: Notification[];
  addPost: (post: Omit<ForumPost, 'id' | 'upvotes' | 'replies' | 'reactions' | 'author'>) => void;
  deletePost: (postId: string) => void;
  addReply: (postId: string, content: string) => void;
  deleteReply: (postId: string, replyId: string) => void;
  togglePostReaction: (postId: string, emoji: string) => void;
  toggleReplyReaction: (postId: string, replyId: string, emoji: string) => void;
  sendNudgeNotification: (expert: Expert) => void;
  removeNudgeNotification: (expertId: string) => void;
  sendMeetingRequest: (expert: Expert, fromUser: User, reason: string) => Notification;
  removeMeetingRequest: (expertId: string) => void;
  addMeetingReply: (originalNotification: Notification, replyContent: string) => void;
  markNotificationsAsRead: () => void;
  clearNotifications: () => void;
  deleteNotification: (notificationId: string) => void;
  unreadCount: number;
}

const ForumContext = createContext<ForumContextType | undefined>(undefined);

export function ForumProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  
  // Derived state: notifications for the current user
  const notifications = user 
    ? allNotifications
        .filter(n => {
            const isRecipient = n.recipientId === user.id || (user.role === 'researcher' && n.recipientId === 'all_researchers');
            const isNotSender = n.senderId ? n.senderId !== user.id : true;
            return isRecipient && isNotSender;
        })
        .sort((a, b) => parseInt(b.id.split('-')[1]) - parseInt(a.id.split('-')[1]))
    : [];
    
  const unreadCount = notifications.filter(n => !n.read).length;


  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedPosts = localStorage.getItem('cura-posts');
      if (storedPosts) {
        setPosts(JSON.parse(storedPosts));
      } else {
        localStorage.setItem('cura-posts', JSON.stringify(samplePosts));
        setPosts(samplePosts);
      }
      
      const storedNotifs = localStorage.getItem('cura-notifications');
      let currentNotifs = storedNotifs ? JSON.parse(storedNotifs) : [];

      if (user) {
        // This key tracks if we've seeded notifications for this user before
        const userNotifKey = `cura-notifs-seeded-${user.id}`;
        const hasBeenSeeded = localStorage.getItem(userNotifKey);

        if (!hasBeenSeeded) {
          const initialSamples = getInitialSampleNotifications(user);
          currentNotifs = [...currentNotifs, ...initialSamples];
          localStorage.setItem(userNotifKey, 'true'); // Mark as seeded
        }
      }
      
      setAllNotifications(currentNotifs);
      localStorage.setItem('cura-notifications', JSON.stringify(currentNotifs));

    } catch (error) {
      console.error('Failed to parse from localStorage', error);
      localStorage.removeItem('cura-posts');
      localStorage.removeItem('cura-notifications');
    }
  }, [user]);

  const addPost = (postData: Omit<ForumPost, 'id' | 'upvotes' | 'replies' | 'reactions' | 'author'>) => {
    if (!user) return;

    const newPost: ForumPost = {
      ...postData,
      id: `post-${Date.now()}`,
      upvotes: 0,
      replies: [],
      reactions: {},
      author: {
        id: user.id,
        name: user.name || 'Anonymous',
        avatarUrl: user.avatarUrl,
        role: user.role,
      }
    };

    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('cura-posts', JSON.stringify(updatedPosts));

    // If a patient creates a post, generate a notification for all researchers
    if (newPost.author.role === 'patient') {
      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        postId: newPost.id,
        postTitle: newPost.title,
        authorId: user.id,
        authorName: newPost.author.name,
        read: false,
        type: 'new_post',
        recipientId: 'all_researchers', // Special ID for all researchers
        senderId: user.id,
      };

      const updatedNotifs = [newNotification, ...allNotifications];
      setAllNotifications(updatedNotifs);
      localStorage.setItem('cura-notifications', JSON.stringify(updatedNotifs));
    }
  };

  const deletePost = (postId: string) => {
    if (!user) return;

    const postToDelete = posts.find(p => p.id === postId);
    if (postToDelete?.author.id !== user.id) {
        console.error("User is not authorized to delete this post.");
        return;
    }
    
    const updatedPosts = posts.filter(p => p.id !== postId);
    setPosts(updatedPosts);
    localStorage.setItem('cura-posts', JSON.stringify(updatedPosts));
  };


  const addReply = (postId: string, content: string) => {
    if (!user) return;

    const updatedPosts = posts.map(p => {
        if (p.id === postId) {
            const newReply: PostReply = {
                id: `reply-${Date.now()}`,
                author: {
                    id: user.id,
                    name: user.name || 'Anonymous',
                    avatarUrl: user.avatarUrl,
                    role: user.role,
                },
                content,
                reactions: {},
            };
            const updatedReplies = p.replies ? [...p.replies, newReply] : [newReply];
            
            // If a researcher replies to a patient's post, create a notification
            if (user.role === 'researcher' && p.author.role === 'patient') {
                const newNotification: Notification = {
                    id: `notif-${Date.now()}`,
                    postId: p.id,
                    postTitle: p.title,
                    authorId: user.id,
                    authorName: user.name || 'Anonymous',
                    read: false,
                    type: 'new_reply',
                    recipientId: p.author.id, // Target the specific patient
                    senderId: user.id,
                };
                const updatedNotifs = [newNotification, ...allNotifications];
                setAllNotifications(updatedNotifs);
                localStorage.setItem('cura-notifications', JSON.stringify(updatedNotifs));
            }
            return { ...p, replies: updatedReplies };
        }
        return p;
    });

    setPosts(updatedPosts);
    localStorage.setItem('cura-posts', JSON.stringify(updatedPosts));
  };

  const deleteReply = (postId: string, replyId: string) => {
    if (!user) return;

    const updatedPosts = posts.map(p => {
        if (p.id === postId) {
            const replyToDelete = p.replies.find(r => r.id === replyId);
            if (replyToDelete?.author.id !== user.id) {
                console.error("User is not authorized to delete this reply.");
                return p;
            }
            return {
                ...p,
                replies: p.replies.filter(r => r.id !== replyId)
            };
        }
        return p;
    });

    setPosts(updatedPosts);
    localStorage.setItem('cura-posts', JSON.stringify(updatedPosts));
  };
  
  const toggleReaction = (currentReactions: Reactions, userId: string, emoji: string): Reactions => {
    const reactions = { ...(currentReactions || {}) };
    // User wants to remove their reaction
    if (reactions[emoji]?.includes(userId)) {
      reactions[emoji] = reactions[emoji].filter(id => id !== userId);
      if (reactions[emoji].length === 0) {
        delete reactions[emoji];
      }
    } else { // User wants to add a reaction
      // Ensure user can only have one reaction
      Object.keys(reactions).forEach(key => {
        reactions[key] = reactions[key].filter(id => id !== userId);
        if (reactions[key].length === 0) {
            delete reactions[key];
        }
      });

      if (!reactions[emoji]) {
        reactions[emoji] = [];
      }
      reactions[emoji].push(userId);
    }
    return reactions;
  };
  
  const togglePostReaction = (postId: string, emoji: string) => {
    if (!user) return;
    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          reactions: toggleReaction(p.reactions, user.id, emoji),
        };
      }
      return p;
    });
    setPosts(updatedPosts);
    localStorage.setItem('cura-posts', JSON.stringify(updatedPosts));
  };

  const toggleReplyReaction = (postId: string, replyId: string, emoji: string) => {
    if (!user) return;
    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          replies: p.replies.map(r => {
            if (r.id === replyId) {
              return {
                ...r,
                reactions: toggleReaction(r.reactions, user.id, emoji),
              };
            }
            return r;
          }),
        };
      }
      return p;
    });
    setPosts(updatedPosts);
    localStorage.setItem('cura-posts', JSON.stringify(updatedPosts));
  };


  const sendNudgeNotification = (expert: Expert) => {
    if (!user) return;

    const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        postId: expert.id, // Use expert ID as postId for nudges
        postTitle: expert.name, // Use expert name as title
        authorId: user.id,
        authorName: user.name || 'Anonymous',
        read: false,
        type: 'nudge',
        recipientId: 'all_researchers',
        senderId: user.id,
    };

    const updatedNotifs = [newNotification, ...allNotifications];
    setAllNotifications(updatedNotifs);
    localStorage.setItem('cura-notifications', JSON.stringify(updatedNotifs));
  }
  
    const removeNudgeNotification = (expertId: string) => {
        if (!user) return;

        const updatedNotifs = allNotifications.filter(
        n => !(n.type === 'nudge' && n.postId === expertId && n.senderId === user.id)
        );
        
        setAllNotifications(updatedNotifs);
        localStorage.setItem('cura-notifications', JSON.stringify(updatedNotifs));
    };
    
    const sendMeetingRequest = (expert: Expert, fromUser: User, reason: string): Notification => {
        const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            postId: expert.id,
            postTitle: expert.name, // Expert's name
            authorId: fromUser.id,
            authorName: fromUser.name || 'Anonymous',
            read: false,
            type: 'meeting_request',
            recipientId: 'all_researchers',
            senderId: fromUser.id,
        };
        const updatedNotifs = [newNotification, ...allNotifications];
        setAllNotifications(updatedNotifs);
        localStorage.setItem('cura-notifications', JSON.stringify(updatedNotifs));
        return newNotification;
    };
    
    const removeMeetingRequest = (expertId: string) => {
        if (!user) return;
        const updatedNotifs = allNotifications.filter(
            (n) => !(n.type === 'meeting_request' && n.postId === expertId && n.senderId === user.id)
        );
        setAllNotifications(updatedNotifs);
        localStorage.setItem('cura-notifications', JSON.stringify(updatedNotifs));
    };

    const addMeetingReply = (originalNotification: Notification, replyContent: string) => {
        if (!user) return;

        const newReplyNotification: Notification = {
            id: `notif-${Date.now()}`,
            postId: originalNotification.postId, // ID of the expert
            postTitle: originalNotification.postTitle, // Name of the expert
            authorId: user.id,
            authorName: user.name || 'Anonymous',
            read: false,
            type: 'meeting_reply',
            recipientId: originalNotification.authorId, // The patient who made the request
            originalRequest: {...originalNotification, content: replyContent },
            senderId: user.id,
        };
        const updatedNotifs = [newReplyNotification, ...allNotifications];
        setAllNotifications(updatedNotifs);
        localStorage.setItem('cura-notifications', JSON.stringify(updatedNotifs));
    };


  const markNotificationsAsRead = () => {
    if (!user || unreadCount === 0) return;
    
    const currentUserNotifIds = notifications.map(n => n.id);

    const updatedNotifications = allNotifications.map(n => {
        if (currentUserNotifIds.includes(n.id) && !n.read) {
            return {...n, read: true};
        }
        return n;
    });
    
    setAllNotifications(updatedNotifications);
    localStorage.setItem('cura-notifications', JSON.stringify(updatedNotifications));
  }

  const clearNotifications = () => {
    if (!user) return;
    
    const currentUserNotifIds = notifications.map(n => n.id);

    const updatedNotifications = allNotifications.filter(n => !currentUserNotifIds.includes(n.id));
    
    setAllNotifications(updatedNotifications);
    localStorage.setItem('cura-notifications', JSON.stringify(updatedNotifications));
    
    toast({
        title: "Notifications Cleared",
        description: "All your notifications have been removed.",
    });
  };

  const deleteNotification = (notificationId: string) => {
    const updatedNotifications = allNotifications.filter(n => n.id !== notificationId);
    setAllNotifications(updatedNotifications);
    localStorage.setItem('cura-notifications', JSON.stringify(updatedNotifications));

    toast({
        title: "Notification Removed",
        duration: 2000,
    });
  };


  const value = { posts, notifications: notifications, addPost, deletePost, addReply, deleteReply, sendNudgeNotification, removeNudgeNotification, sendMeetingRequest, addMeetingReply, removeMeetingRequest, markNotificationsAsRead, unreadCount, togglePostReaction, toggleReplyReaction, clearNotifications, deleteNotification };

  return (
    <ForumContext.Provider value={value}>
      {children}
    </ForumContext.Provider>
  );
}

export function useForum() {
  const context = useContext(ForumContext);
  if (context === undefined) {
    throw new Error('useForum must be used within a ForumProvider');
  }
  return context;
}

    