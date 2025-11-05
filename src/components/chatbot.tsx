'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { MessageSquare, Bot, X, Send, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Input } from './ui/input';
import { askCuraLinkAssistant } from '@/ai/flows/ai-chatbot';
import { ScrollArea } from './ui/scroll-area';

interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            const result = await askCuraLinkAssistant({ question: input, history });
            const assistantMessage: ChatMessage = { role: 'model', content: result.answer };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I'm having trouble connecting. Please try again later." };
            setMessages(prev => [...prev, errorMessage]);
            console.error("Chatbot error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="default"
                    size="icon"
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl z-50"
                    aria-label="Open Chatbot"
                >
                    <MessageSquare className="h-7 w-7" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                side="top"
                align="end"
                className="w-80 h-[28rem] p-0 flex flex-col"
                sideOffset={10}
            >
                <div className="flex items-center justify-between p-3 border-b">
                    <div className="flex items-center gap-2">
                        <Bot className="h-6 w-6 text-primary" />
                        <h3 className="font-semibold">CuraLink Assistant</h3>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <div className="bg-secondary text-secondary-foreground p-2 rounded-lg text-sm">
                                Hello! How can I help you learn about CuraLink today?
                            </div>
                        </div>
                        {messages.map((message, index) => (
                            <div key={index} className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : ''}`}>
                                <div className={`p-2 rounded-lg text-sm ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                                    {message.content}
                                </div>
                            </div>
                        ))}
                         {loading && (
                            <div className="flex gap-2">
                                <div className="bg-secondary text-secondary-foreground p-2 rounded-lg text-sm">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <div className="p-3 border-t">
                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
                        <Input
                            placeholder="Ask a question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                        />
                        <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </PopoverContent>
        </Popover>
    );
}
