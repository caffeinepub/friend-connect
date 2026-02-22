import { useInternetIdentity } from '../hooks/useInternetIdentity';
import type { ChatMessage } from '../backend';

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { identity } = useInternetIdentity();
  const isOwnMessage = identity?.getPrincipal().toString() === message.sender.toString();

  const timestamp = new Date(Number(message.timestamp) / 1000000);
  const timeString = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isOwnMessage
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted text-foreground rounded-bl-sm'
        }`}
      >
        <p className="break-words">{message.content}</p>
        <p className={`text-xs mt-1 ${isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {timeString}
        </p>
      </div>
    </div>
  );
}
