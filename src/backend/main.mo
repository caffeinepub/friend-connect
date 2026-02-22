import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    username : Text;
    onlineStatus : Bool;
  };

  public type ChatMessage = {
    sender : Principal;
    recipient : Principal;
    timestamp : Time.Time;
    content : Text;
  };

  public type CallSession = {
    caller : Principal;
    callee : Principal;
    isActive : Bool;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let friendsMap = Map.empty<Principal, Set.Set<Principal>>();
  let chatMessages = List.empty<ChatMessage>();
  let callSessions = Map.empty<Principal, CallSession>();

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func addFriend(friend : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add friends");
    };
    if (caller == friend) {
      Runtime.trap("Cannot add yourself as a friend");
    };
    switch (userProfiles.get(friend)) {
      case (null) { Runtime.trap("User does not exist") };
      case (_) {
        let currentFriends = switch (friendsMap.get(caller)) {
          case (null) { Set.empty<Principal>() };
          case (?friends) { friends };
        };
        currentFriends.add(friend);
        friendsMap.add(caller, currentFriends);
      };
    };
  };

  public query ({ caller }) func getFriendsList() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view friends list");
    };
    switch (friendsMap.get(caller)) {
      case (null) { [] };
      case (?friends) { friends.toArray() };
    };
  };

  public query ({ caller }) func isFriend(user : Principal) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check friend status");
    };
    switch (friendsMap.get(caller)) {
      case (null) { false };
      case (?friends) { friends.contains(user) };
    };
  };

  public shared ({ caller }) func sendMessage(recipient : Principal, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    if (caller == recipient) {
      Runtime.trap("Cannot send message to yourself");
    };
    switch (userProfiles.get(recipient)) {
      case (null) { Runtime.trap("Recipient does not exist") };
      case (_) {
        let message : ChatMessage = {
          sender = caller;
          recipient;
          timestamp = Time.now();
          content;
        };
        chatMessages.add(message);
      };
    };
  };

  public query ({ caller }) func getChatHistory(withUser : Principal) : async [ChatMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view chat history");
    };
    chatMessages.toArray().filter(
      func(msg : ChatMessage) : Bool {
        (msg.sender == caller and msg.recipient == withUser) or
        (msg.sender == withUser and msg.recipient == caller)
      }
    )
  };

  public shared ({ caller }) func startCall(callee : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start calls");
    };
    if (caller == callee) {
      Runtime.trap("Cannot call yourself");
    };
    switch (userProfiles.get(callee)) {
      case (null) { Runtime.trap("Callee does not exist") };
      case (_) {
        let session : CallSession = {
          caller = caller;
          callee;
          isActive = true;
        };
        callSessions.add(caller, session);
      };
    };
  };

  public shared ({ caller }) func endCall() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can end calls");
    };
    callSessions.remove(caller);
  };

  public query ({ caller }) func getUserStatus(user : Principal) : async ?Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view user status");
    };
    switch (userProfiles.get(user)) {
      case (null) { null };
      case (?profile) { ?profile.onlineStatus };
    };
  };
}
