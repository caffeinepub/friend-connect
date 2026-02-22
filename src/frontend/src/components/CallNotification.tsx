import { useEffect, useState } from 'react';
import { Principal } from '@dfinity/principal';
import { useGetUserProfile } from '../hooks/useQueries';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, PhoneOff } from 'lucide-react';

interface CallNotificationProps {
  onAcceptCall: (callerPrincipal: Principal) => void;
}

export default function CallNotification({ onAcceptCall }: CallNotificationProps) {
  const [incomingCall, setIncomingCall] = useState<Principal | null>(null);
  const { data: callerProfile } = useGetUserProfile(incomingCall || Principal.anonymous());

  const callerName = callerProfile?.username || 'Someone';
  const initials = callerProfile?.username ? callerProfile.username.slice(0, 2).toUpperCase() : '??';

  const handleAccept = () => {
    if (incomingCall) {
      onAcceptCall(incomingCall);
      setIncomingCall(null);
    }
  };

  const handleDecline = () => {
    setIncomingCall(null);
  };

  if (!incomingCall) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-5">
      <Card className="p-6 shadow-2xl border-2 border-primary w-80">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="bg-gradient-to-br from-coral to-mint text-white text-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="font-semibold text-lg">{callerName}</p>
            <p className="text-sm text-muted-foreground">Incoming video call...</p>
          </div>
          <div className="flex gap-3 w-full">
            <Button
              variant="destructive"
              onClick={handleDecline}
              className="flex-1 gap-2"
            >
              <PhoneOff className="w-4 h-4" />
              Decline
            </Button>
            <Button
              variant="default"
              onClick={handleAccept}
              className="flex-1 gap-2"
            >
              <Phone className="w-4 h-4" />
              Accept
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
