import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ChatMessage {
    content: string;
    recipient: Principal;
    sender: Principal;
    timestamp: Time;
}
export type Time = bigint;
export interface UserProfile {
    username: string;
    onlineStatus: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addFriend(friend: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    endCall(): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChatHistory(withUser: Principal): Promise<Array<ChatMessage>>;
    getFriendsList(): Promise<Array<Principal>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserStatus(user: Principal): Promise<boolean | null>;
    isCallerAdmin(): Promise<boolean>;
    isFriend(user: Principal): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(recipient: Principal, content: string): Promise<void>;
    startCall(callee: Principal): Promise<void>;
}
