export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  friends: string[];
  friendOf: string[];
  friendRequestsSent: string[];
  friendRequestsReceived: string[];
  recommended: string[];
  recommendedBy: string[];
  hostedSessions: string[];
  participantSessions: string[];
  sessionParticipants: string[];
  chatMessages: string[];
}
