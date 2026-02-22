import { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { useAddFriend } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AddFriendDialog() {
  const [open, setOpen] = useState(false);
  const [principalId, setPrincipalId] = useState('');
  const { mutate: addFriend, isPending } = useAddFriend();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const principal = Principal.fromText(principalId.trim());
      addFriend(principal, {
        onSuccess: () => {
          toast.success('Friend added successfully!');
          setPrincipalId('');
          setOpen(false);
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to add friend');
        }
      });
    } catch (error) {
      toast.error('Invalid Principal ID format');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add Friend
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a Friend</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="principal">Friend's Principal ID</Label>
            <Input
              id="principal"
              placeholder="Enter Principal ID"
              value={principalId}
              onChange={(e) => setPrincipalId(e.target.value)}
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Ask your friend for their Principal ID to connect
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!principalId.trim() || isPending}
              className="flex-1"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Friend'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
