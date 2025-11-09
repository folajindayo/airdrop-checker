'use client';

import * as React from 'react';
import { Send, Paperclip, Smile, MoreVertical, Search } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  isOwn?: boolean;
  type?: 'text' | 'image' | 'file';
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface ChatProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  currentUser?: {
    id: string;
    name: string;
    avatar?: string;
  };
  placeholder?: string;
  className?: string;
}

export function Chat({
  messages,
  onSendMessage,
  currentUser,
  placeholder = 'Type a message...',
  className,
}: ChatProps) {
  const [newMessage, setNewMessage] = React.useState('');
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardContent className="flex-1 p-0 flex flex-col">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-2',
                  message.isOwn && 'flex-row-reverse'
                )}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  {message.sender.avatar ? (
                    <img src={message.sender.avatar} alt={message.sender.name} />
                  ) : (
                    <div className="bg-primary text-primary-foreground flex items-center justify-center">
                      {message.sender.name[0]}
                    </div>
                  )}
                </Avatar>
                <div
                  className={cn(
                    'flex flex-col gap-1 max-w-[70%]',
                    message.isOwn && 'items-end'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">
                      {message.sender.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <div
                    className={cn(
                      'rounded-lg px-3 py-2',
                      message.isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  {message.status && message.isOwn && (
                    <span className="text-xs text-muted-foreground">
                      {message.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="icon">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1"
            />
            <Button type="button" variant="ghost" size="icon">
              <Smile className="h-4 w-4" />
            </Button>
            <Button onClick={handleSend} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Chat with conversation list
export interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  timestamp?: Date;
  unreadCount?: number;
  isOnline?: boolean;
}

export function ChatWithSidebar({
  conversations,
  activeConversation,
  messages,
  onConversationSelect,
  onSendMessage,
  className,
}: {
  conversations: Conversation[];
  activeConversation?: string;
  messages: Message[];
  onConversationSelect: (conversationId: string) => void;
  onSendMessage: (content: string) => void;
  className?: string;
}) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cn('flex h-[600px] border rounded-lg overflow-hidden', className)}>
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="pl-9"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onConversationSelect(conversation.id)}
                className={cn(
                  'w-full flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors',
                  activeConversation === conversation.id && 'bg-accent'
                )}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    {conversation.avatar ? (
                      <img src={conversation.avatar} alt={conversation.name} />
                    ) : (
                      <div className="bg-primary text-primary-foreground flex items-center justify-center">
                        {conversation.name[0]}
                      </div>
                    )}
                  </Avatar>
                  {conversation.isOnline && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{conversation.name}</p>
                    {conversation.timestamp && (
                      <span className="text-xs text-muted-foreground">
                        {conversation.timestamp.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                  {conversation.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage}
                    </p>
                  )}
                </div>
                {conversation.unreadCount && conversation.unreadCount > 0 && (
                  <Badge variant="default" className="rounded-full">
                    {conversation.unreadCount}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div className="flex-1">
        {activeConversation ? (
          <Chat
            messages={messages}
            onSendMessage={onSendMessage}
            className="h-full border-0 rounded-none"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}

// Simple support chat widget
export function SupportChat({
  isOpen,
  onClose,
  className,
}: {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}) {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: '1',
      content: 'Hi! How can I help you today?',
      sender: { id: 'support', name: 'Support' },
      timestamp: new Date(),
      isOwn: false,
    },
  ]);

  const handleSend = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: { id: 'user', name: 'You' },
      timestamp: new Date(),
      isOwn: true,
    };
    setMessages([...messages, newMessage]);

    // Simulate response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Thanks for your message! A support agent will respond shortly.',
        sender: { id: 'support', name: 'Support' },
        timestamp: new Date(),
        isOwn: false,
      };
      setMessages((prev) => [...prev, response]);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 w-96 shadow-2xl z-50',
        className
      )}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">Support Chat</h3>
            <p className="text-xs text-muted-foreground">We typically reply in a few minutes</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </CardHeader>
        <Chat
          messages={messages}
          onSendMessage={handleSend}
          className="h-96 border-0 rounded-none"
        />
      </Card>
    </div>
  );
}

