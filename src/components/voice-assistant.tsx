
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Mic, MicOff, Bot, Loader2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';
import { voiceAssistant } from '@/ai/flows/voice-assistant';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useAuth } from '@/context/auth-provider';

// Declare the SpeechRecognition object for browser compatibility
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

export function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const isClick = useRef(true);

  const recognitionRef = useRef<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const userInitials = user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U';
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setPosition({ x: window.innerWidth - 90, y: window.innerHeight - 170 });
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const spokenText = event.results[0][0].transcript;
        if (spokenText) {
            setMessages(prev => [...prev, { role: 'user', content: spokenText }]);
            processRequest(spokenText);
        }
      };

      recognitionRef.current.onend = () => setIsListening(false);
    }
    
    return () => window.speechSynthesis.cancel();
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
    setIsDragging(false);
  }, []);

  const handlePointerUp = () => {
    if(isClick.current) {
        setIsOpen(true);
    }
    setIsDragging(false);
    isClick.current = true;
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
        { role: 'model', content: 'Hi there! Press the mic and ask me a question.' }
      ]);
    }
  }, [isOpen, messages.length]);


  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };

  const speak = (text: string) => {
    if (!text) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const processRequest = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    try {
      const result = await voiceAssistant({ query: text });
      setMessages(prev => [...prev, { role: 'model', content: result.response }]);
      speak(result.response);
    } catch (error) {
      console.error('AI voice assistant failed:', error);
      const errorMessage = "Sorry, I encountered an error. Please try again.";
      setMessages(prev => [...prev, { role: 'model', content: errorMessage }]);
      speak(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const closeAssistant = () => {
    window.speechSynthesis.cancel();
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    setIsOpen(false);
    setIsListening(false);
    setIsProcessing(false);
    setIsSpeaking(false);
  };

  if (!recognitionRef.current) {
    return null;
  }
  
  const assistantState = isListening ? 'listening' : isProcessing ? 'processing' : isSpeaking ? 'speaking' : 'idle';


  return (
    <>
      <Button
        ref={buttonRef}
        className={cn(
          'fixed h-16 w-16 rounded-full shadow-2xl transition-opacity duration-300 ease-in-out hover:scale-110 z-40',
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
        aria-label="Open Voice Assistant"
      >
        <Bot className="h-8 w-8" />
      </Button>

      <Card
        className={cn(
          'fixed bottom-6 right-6 w-[calc(100%-3rem)] max-w-[280px] rounded-xl shadow-2xl transition-all duration-300 ease-in-out origin-bottom-right z-50',
          'transform scale-0 opacity-0',
          isOpen && 'scale-100 opacity-100'
        )}
      >
        <CardHeader className='flex-row items-center justify-between'>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-5 w-5" />
            AI Assistant
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={closeAssistant}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
           <ScrollArea className="h-48 p-3 border rounded-lg bg-muted/50" ref={scrollAreaRef}>
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
                        : 'bg-background'
                    )}
                  >
                    {message.content}
                  </div>
                   {message.role === 'user' && (
                    <Avatar className="h-8 w-8">
                       <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
               {isProcessing && (
                 <div className="flex items-end gap-2 justify-start">
                    <Avatar className="h-8 w-8">
                       <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-5 w-5"/></AvatarFallback>
                    </Avatar>
                    <div className="max-w-[75%] rounded-lg px-3 py-2 text-sm bg-background flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>
           <div className="flex justify-center">
                <Button
                    size="icon"
                    onClick={toggleListening}
                    className="h-12 w-12 rounded-full shadow-lg"
                    disabled={isProcessing || isSpeaking}
                >
                    {assistantState === 'listening' && <Mic className="h-5 w-5" />}
                    {assistantState === 'idle' && <MicOff className="h-5 w-5" />}
                    {(assistantState === 'processing' || assistantState === 'speaking') && <Loader2 className="h-5 w-5 animate-spin" />}
                </Button>
           </div>
           <p className="text-xs text-center text-muted-foreground capitalize">{assistantState}</p>
        </CardContent>
      </Card>
    </>
  );
}
