'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './auth-provider';
import type { Expert } from '@/lib/types';


export interface ForumPostAuthor {
  id: string;
  name: string;
  avatarUrl: string;
  role: 'patient' | 'researcher';
}

export interface PostReply {
  id: string;
  author: ForumPostAuthor;
  content: string;
}

export interface ForumPost {
  id: string;
  author: ForumPostAuthor;
  title: string;
  content: string;
  upvotes: number;
  tags: string[];
  replies: PostReply[];
}

export interface Notification {
  id: string;
  postId: string;
  postTitle: string;
  authorName: string;
  read: boolean;
  type: 'new_post' | 'new_reply' | 'nudge';
  recipientId: string;
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
    },
];

interface ForumContextType {
  posts: ForumPost[];
  notifications: Notification[];
  addPost: (post: Omit<ForumPost, 'id' | 'upvotes' | 'replies'>) => void;
  addReply: (postId: string, content: string) => void;
  sendNudgeNotification: (expert: Expert) => void;
  removeNudgeNotification: (expertId: string) => void;
  markNotificationsAsRead: () => void;
  unreadCount: number;
}

const ForumContext = createContext<ForumContextType | undefined>(undefined);

export function ForumProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  
  // Derived state: notifications for the current user
  const notifications = user ? allNotifications.filter(n => n.recipientId === user.id || (user.role === 'researcher' && n.recipientId === 'all_researchers')).sort((a, b) => parseInt(b.id.split('-')[1]) - parseInt(a.id.split('-')[1])) : [];
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
      if (storedNotifs) {
          setAllNotifications(JSON.parse(storedNotifs));
      }
    } catch (error) {
      console.error('Failed to parse from localStorage', error);
      localStorage.removeItem('cura-posts');
      localStorage.removeItem('cura-notifications');
    }
  }, []);

  const addPost = (postData: Omit<ForumPost, 'id' | 'upvotes' | 'replies'>) => {
    if (!user) return;

    const newPost: ForumPost = {
      ...postData,
      id: `post-${Date.now()}`,
      upvotes: 0,
      replies: [],
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
        authorName: newPost.author.name,
        read: false,
        type: 'new_post',
        recipientId: 'all_researchers', // Special ID for all researchers
      };

      const updatedNotifs = [newNotification, ...allNotifications];
      setAllNotifications(updatedNotifs);
      localStorage.setItem('cura-notifications', JSON.stringify(updatedNotifs));
    }
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
            };
            const updatedReplies = p.replies ? [...p.replies, newReply] : [newReply];
            
            // If a researcher replies to a patient's post, create a notification
            if (user.role === 'researcher' && p.author.role === 'patient') {
                const newNotification: Notification = {
                    id: `notif-${Date.now()}`,
                    postId: p.id,
                    postTitle: p.title,
                    authorName: user.name || 'Anonymous',
                    read: false,
                    type: 'new_reply',
                    recipientId: p.author.id, // Target the specific patient
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

  const sendNudgeNotification = (expert: Expert) => {
    if (!user) return;

    const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        postId: expert.id, // Use expert ID as postId for nudges
        postTitle: expert.name, // Use expert name as title
        authorName: user.name || 'Anonymous',
        read: false,
        type: 'nudge',
        recipientId: 'all_researchers',
    };

    const updatedNotifs = [newNotification, ...allNotifications];
    setAllNotifications(updatedNotifs);
    localStorage.setItem('cura-notifications', JSON.stringify(updatedNotifs));
  }
  
    const removeNudgeNotification = (expertId: string) => {
        if (!user) return;

        const updatedNotifs = allNotifications.filter(
        n => !(n.type === 'nudge' && n.postId === expertId)
        );
        
        setAllNotifications(updatedNotifs);
        localStorage.setItem('cura-notifications', JSON.stringify(updatedNotifs));
    };

  const markNotificationsAsRead = () => {
    if (!user || unreadCount === 0) return;
    
    const updatedNotifications = allNotifications.map(n => {
        const isRecipient = n.recipientId === user.id || (user.role === 'researcher' && n.recipientId === 'all_researchers');
        if (isRecipient && !n.read) {
            return {...n, read: true};
        }
        return n;
    });
    
    setAllNotifications(updatedNotifications);
    localStorage.setItem('cura-notifications', JSON.stringify(updatedNotifications));
  }

  const value = { posts, notifications, addPost, addReply, sendNudgeNotification, removeNudgeNotification, unreadCount, markNotificationsAsRead };

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
