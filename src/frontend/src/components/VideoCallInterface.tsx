import { useEffect, useRef, useState } from 'react';
import { Principal } from '@dfinity/principal';
import { useWebRTC } from '../hooks/useWebRTC';
import { useGetUserProfile } from '../hooks/useQueries';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface VideoCallInterfaceProps {
  remotePrincipal: Principal;
  onEndCall: () => void;
}

export default function VideoCallInterface({ remotePrincipal, onEndCall }: VideoCallInterfaceProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const { data: remoteProfile } = useGetUserProfile(remotePrincipal);
  const {
    localStream,
    remoteStream,
    isConnecting,
    error,
    endCall: endWebRTCCall
  } = useWebRTC(remotePrincipal);

  const remoteName = remoteProfile?.username || 'Friend';
  const initials = remoteProfile?.username ? remoteProfile.username.slice(0, 2).toUpperCase() : '??';

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleToggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const handleToggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleEndCall = async () => {
    await endWebRTCCall();
    onEndCall();
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex-1 relative bg-black">
        {/* Remote video (main) */}
        <div className="absolute inset-0 flex items-center justify-center">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-32 h-32">
                <AvatarFallback className="bg-gradient-to-br from-coral to-mint text-white text-4xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <p className="text-white text-xl">{remoteName}</p>
              {isConnecting && (
                <div className="flex items-center gap-2 text-white/80">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connecting...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Local video (picture-in-picture) */}
        <Card className="absolute top-4 right-4 w-48 h-36 overflow-hidden shadow-2xl">
          {isVideoOff ? (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-muted-foreground" />
            </div>
          ) : (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
            />
          )}
        </Card>

        {/* Error message */}
        {error && (
          <div className="absolute top-4 left-4 right-4 bg-destructive text-destructive-foreground p-4 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-card border-t p-6">
        <div className="container mx-auto flex items-center justify-center gap-4">
          <Button
            size="lg"
            variant={isMuted ? 'destructive' : 'secondary'}
            onClick={handleToggleMute}
            className="rounded-full w-14 h-14"
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>
          <Button
            size="lg"
            variant={isVideoOff ? 'destructive' : 'secondary'}
            onClick={handleToggleVideo}
            className="rounded-full w-14 h-14"
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </Button>
          <Button
            size="lg"
            variant="destructive"
            onClick={handleEndCall}
            className="rounded-full w-14 h-14"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
