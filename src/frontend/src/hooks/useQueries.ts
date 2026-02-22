import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import type { UserProfile } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetFriendsList() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['friendsList'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFriendsList();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000,
  });
}

export function useAddFriend() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (friend: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addFriend(friend);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendsList'] });
    },
  });
}

export function useGetUserProfile(user: Principal) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', user.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserProfile(user);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetUserStatus(user: Principal) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean | null>({
    queryKey: ['userStatus', user.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserStatus(user);
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 10000,
  });
}

export function useGetChatHistory(withUser: Principal) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['chatHistory', withUser.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChatHistory(withUser);
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 2000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recipient, content }: { recipient: Principal; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(recipient, content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatHistory', variables.recipient.toString()] });
    },
  });
}

export function useStartCall() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (callee: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.startCall(callee);
    },
  });
}

export function useEndCall() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.endCall();
    },
  });
}
