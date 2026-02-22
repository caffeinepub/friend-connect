import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Principal } from '@dfinity/principal';
import Layout from './components/Layout';
import ProfileSetup from './components/ProfileSetup';
import FriendsList from './components/FriendsList';
import ChatWindow from './components/ChatWindow';
import VideoCallInterface from './components/VideoCallInterface';
import CallNotification from './components/CallNotification';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  
  const [selectedFriend, setSelectedFriend] = useState<Principal | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [callWith, setCallWith] = useState<Principal | null>(null);

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    setSelectedFriend(null);
    setIsInCall(false);
    setCallWith(null);
  };

  const handleStartCall = (friendPrincipal: Principal) => {
    setCallWith(friendPrincipal);
    setIsInCall(true);
  };

  const handleEndCall = () => {
    setIsInCall(false);
    setCallWith(null);
  };

  const handleAcceptCall = (callerPrincipal: Principal) => {
    setCallWith(callerPrincipal);
    setIsInCall(true);
  };

  if (profileLoading && isAuthenticated) {
    return (
      <Layout onLogout={handleLogout}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={handleLogout}>
      {showProfileSetup && <ProfileSetup />}
      
      {!isAuthenticated ? (
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold mb-4">Welcome to Friend Connect</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Connect with friends through chat and video calls
          </p>
          <img 
            src="/assets/generated/hero-chat.dim_1200x600.png" 
            alt="Chat illustration" 
            className="mx-auto max-w-3xl w-full rounded-2xl shadow-lg"
          />
        </div>
      ) : userProfile && !showProfileSetup ? (
        <>
          <CallNotification onAcceptCall={handleAcceptCall} />
          
          {isInCall && callWith ? (
            <VideoCallInterface 
              remotePrincipal={callWith} 
              onEndCall={handleEndCall}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
              <div className="lg:col-span-1">
                <FriendsList 
                  selectedFriend={selectedFriend}
                  onSelectFriend={setSelectedFriend}
                />
              </div>
              <div className="lg:col-span-2">
                {selectedFriend ? (
                  <ChatWindow 
                    friendPrincipal={selectedFriend}
                    onStartCall={handleStartCall}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-card rounded-2xl border-2 border-dashed border-border">
                    <p className="text-muted-foreground text-lg">
                      Select a friend to start chatting
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : null}
    </Layout>
  );
}
