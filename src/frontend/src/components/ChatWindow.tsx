import { useState, useEffect, useRef } from 'react';
import { Principal } from '@dfinity/principal';
import { useGetChatHistory, useSendMessage, useGetUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Video, Loader2 } from 'lucide-react';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  friendPrincipal: Principal;
  onStartCall: (friendPrincipal: Principal) => void;
}

export default function ChatWindow({ friendPrincipal, onStartCall }: ChatWindowProps) {
  const [message, setMessage] = useState('');
  const { data: chatHistory, isLoading } = useGetChatHistory(friendPrincipal);
  const { data: friendProfile } = useGetUserProfile(friendPrincipal);
  const { mutate: sendMessage, isPending } = useSendMessage();
  const scrollRef = useRef<HTMLDivElement>(null);

  const friendName = friendProfile?.username || 'Friend';
  const initials = friendProfile?.username ? friendProfile.username.slice(0, 2).toUpperCase() : '??';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isPending) {
      sendMessage(
        { recipient: friendPrincipal, content: message.trim() },
        {
          onSuccess: () => {
            setMessage('');
          }
        }
      );
    }
  };

  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-to-br from-coral to-mint text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <CardTitle>{friendName}</CardTitle>
          </div>
          <Button
            size="sm"
            variant="default"
            className="gap-2"
            onClick={() => onStartCall(friendPrincipal)}
          >
            <Video className="w-4 h-4" />
            Video Call
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : chatHistory && chatHistory.length > 0 ? (
            <div className="space-y-4">
              {chatHistory.map((msg, index) => (
                <MessageBubble key={index} message={msg} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          )}
        </ScrollArea>
        <div className="border-t p-4">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isPending}
              className="flex-1"
            />
            <Button type="submit" disabled={!message.trim() || isPending} size="icon">
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
