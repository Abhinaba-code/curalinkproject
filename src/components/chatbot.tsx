
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Bot, MessageSquare, Send, Loader2, X, User, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { chatbot } from '@/ai/flows/chatbot';
import { useAuth } from '@/context/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface Message {
  role: 'user' | 'model';
  content: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const isClick = useRef(true);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { user } = useAuth();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setPosition({ x: window.innerWidth - 90, y: window.innerHeight - 90 });

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onresult = (event: any) => {
        const spokenText = event.results[0][0].transcript;
        if (spokenText) {
          handleSendMessage(spokenText);
        }
      };
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
    }
  }, []);
  
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    isClick.current = true;
    const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartPos.current = { x: startX, y: startY };
    setIsDragging(true);
  }, []);

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - dragStartPos.current.x;
    const deltaY = clientY - dragStartPos.current.y;

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      isClick.current = false;
    }
    
    setPosition(pos => ({ x: pos.x + deltaX, y: pos.y + deltaY }));
    dragStartPos.current = { x: clientX, y: clientY };
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    if (isClick.current && !isDragging) { // Ensure it was a click, not the end of a drag
        setIsOpen(true);
    }
    setIsDragging(false);
  }, [isDragging]);

  const handlePointerUp = () => {
    if(isClick.current) {
        setIsOpen(true);
    }
    setIsDragging(false);
    isClick.current = true; // Reset for next interaction
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleDragMove);
      document.addEventListener('touchend', handleDragEnd);
    } else {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);
  
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { role: 'model', content: `Hi ${user?.name || 'there'}! I'm the CuraLink assistant. How can I help you today?` }
      ]);
    }
  }, [isOpen, messages.length, user]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const result = await chatbot({ query: text, history: messages });
      const aiMessage: Message = { role: 'model', content: result.response };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chatbot failed:', error);
      const errorMessage: Message = { role: 'model', content: "Sorry, something went wrong. Please try again." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };
  
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const userInitials = user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U';

  return (
    <>
      <Button
        ref={buttonRef}
        className={cn(
          'fixed h-16 w-16 rounded-full shadow-2xl transition-opacity duration-300 ease-in-out hover:scale-110 z-50',
          isOpen ? 'scale-0 opacity-0' : 'cursor-grab'
        )}
        style={{
            top: `${position.y}px`,
            left: `${position.x}px`,
            transform: 'translate(-50%, -50%)',
        }}
        size="icon"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onMouseUp={handlePointerUp}
        onTouchEnd={handlePointerUp}
        aria-label="Open Chatbot"
      >
        <MessageSquare className="h-8 w-8" />
      </Button>

      <Card
        className={cn(
          'fixed bottom-6 right-6 w-[calc(100%-3rem)] max-w-sm rounded-xl shadow-2xl transition-all duration-300 ease-in-out origin-bottom-right z-50',
          'transform scale-0 opacity-0',
          isOpen && 'scale-100 opacity-100'
        )}
      >
        <CardHeader className="flex-row items-center justify-between border-b">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            CuraLink Assistant
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-80 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-end gap-2',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'model' && (
                    <Avatar className="h-8 w-8">
                       <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-5 w-5"/></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-[75%] rounded-lg px-3 py-2 text-sm',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {message.content}
                  </div>
                   {message.role === 'user' && (
                    <Avatar className="h-8 w-8">
                       <AvatarImage src={user?.avatarUrl} />
                       <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-end gap-2 justify-start">
                    <Avatar className="h-8 w-8">
                       <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-5 w-5"/></AvatarFallback>
                    </Avatar>
                    <div className="max-w-[75%] rounded-lg px-3 py-2 text-sm bg-muted flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="border-t p-4">
            <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isListening ? 'Listening...' : 'Ask a question...'}
                disabled={isLoading || isListening}
              />
               {recognitionRef.current && (
                 <Button type="button" size="icon" onClick={toggleListening} disabled={isLoading} variant={isListening ? 'destructive' : 'outline'}>
                    <Mic className="h-4 w-4" />
                 </Button>
               )}
              <Button type="submit" size="icon" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
