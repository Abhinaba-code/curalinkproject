'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './auth-provider';

export interface ForumPostAuthor {
  name: string;
  avatarUrl: string;
  role: 'patient' | 'researcher';
}

export interface ForumPost {
  id: string;
  author: ForumPostAuthor;
  title: string;
  content: string;
  upvotes: number;
  comments: number;
  tags: string[];
}

export interface Notification {
  id: string;
  postId: string;
  postTitle: string;
  authorName: string;
  read: boolean;
}

const samplePosts: ForumPost[] = [
    {
      id: 'post-1',
      author: {
        name: 'Dr. Evelyn Reed',
        avatarUrl: 'https://picsum.photos/seed/expert1/200/200',
        role: 'researcher',
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
        role: 'patient',
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
        role: 'researcher',
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

interface ForumContextType {
  posts: ForumPost[];
  notifications: Notification[];
  addPost: (post: Omit<ForumPost, 'id' | 'upvotes' | 'comments'>) => void;
  markNotificationsAsRead: () => void;
  unreadCount: number;
}

const ForumContext = createContext<ForumContextType | undefined>(undefined);

export function ForumProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>(samplePosts);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    try {
      const storedPosts = localStorage.getItem('cura-posts');
      if (storedPosts) {
        setPosts(JSON.parse(storedPosts));
      } else {
        // If no posts in storage, set the initial sample posts
        localStorage.setItem('cura-posts', JSON.stringify(samplePosts));
      }
      
      if (user?.role === 'researcher') {
        const storedNotifs = localStorage.getItem('cura-notifications');
        if (storedNotifs) {
            const parsedNotifs: Notification[] = JSON.parse(storedNotifs);
            setNotifications(parsedNotifs.reverse()); // Show newest first
            setUnreadCount(parsedNotifs.filter(n => !n.read).length);
        }
      }
    } catch (error) {
      console.error('Failed to parse from localStorage', error);
      localStorage.removeItem('cura-posts');
      localStorage.removeItem('cura-notifications');
    }
  }, [user]);

  const addPost = (postData: Omit<ForumPost, 'id' | 'upvotes' | 'comments'>) => {
    const newPost: ForumPost = {
      ...postData,
      id: `post-${Date.now()}`,
      upvotes: 0,
      comments: 0,
    };

    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('cura-posts', JSON.stringify(updatedPosts));

    // If a patient creates a post, generate a notification
    if (newPost.author.role === 'patient') {
      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        postId: newPost.id,
        postTitle: newPost.title,
        authorName: newPost.author.name,
        read: false,
      };

      const allNotifs = [newNotification, ...notifications];
      setNotifications(allNotifs);
      setUnreadCount(prev => prev + 1);
      localStorage.setItem('cura-notifications', JSON.stringify(allNotifs));
    }
  };
  
  const markNotificationsAsRead = () => {
    if (unreadCount === 0) return;
    
    const updatedNotifications = notifications.map(n => ({...n, read: true}));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
    localStorage.setItem('cura-notifications', JSON.stringify(updatedNotifications));
  }

  const value = { posts, notifications, addPost, unreadCount, markNotificationsAsRead };

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
