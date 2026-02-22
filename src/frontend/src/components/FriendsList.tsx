import { Principal } from '@dfinity/principal';
import { useGetFriendsList, useGetUserProfile, useGetUserStatus } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Users } from 'lucide-react';
import AddFriendDialog from './AddFriendDialog';

interface FriendsListProps {
  selectedFriend: Principal | null;
  onSelectFriend: (friend: Principal) => void;
}

function FriendItem({ 
  friendPrincipal, 
  isSelected, 
  onSelect 
}: { 
  friendPrincipal: Principal; 
  isSelected: boolean; 
  onSelect: () => void;
}) {
  const { data: profile } = useGetUserProfile(friendPrincipal);
  const { data: isOnline } = useGetUserStatus(friendPrincipal);

  const username = profile?.username || friendPrincipal.toString().slice(0, 8) + '...';
  const initials = profile?.username ? profile.username.slice(0, 2).toUpperCase() : '??';

  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
        isSelected 
          ? 'bg-primary text-primary-foreground shadow-md' 
          : 'hover:bg-accent hover:shadow-sm'
      }`}
    >
      <div className="relative">
        <Avatar className="w-12 h-12">
          <AvatarFallback className={isSelected ? 'bg-primary-foreground text-primary' : 'bg-gradient-to-br from-coral to-mint text-white'}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${
          isSelected ? 'border-primary' : 'border-card'
        } ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{username}</p>
        <p className={`text-sm ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </p>
      </div>
    </div>
  );
}

export default function FriendsList({ selectedFriend, onSelectFriend }: FriendsListProps) {
  const { data: friends, isLoading } = useGetFriendsList();

  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Friends
            {friends && friends.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {friends.length}
              </Badge>
            )}
          </CardTitle>
          <AddFriendDialog />
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : friends && friends.length > 0 ? (
          <ScrollArea className="h-full pr-4">
            <div className="space-y-2">
              {friends.map((friend) => (
                <FriendItem
                  key={friend.toString()}
                  friendPrincipal={friend}
                  isSelected={selectedFriend?.toString() === friend.toString()}
                  onSelect={() => onSelectFriend(friend)}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Users className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-2">No friends yet</p>
            <p className="text-sm text-muted-foreground/80">
              Add friends to start chatting
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
