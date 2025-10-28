export interface WatchSession {
  id: string;
  movieId: string;
  hostUserId: string;
  participantUserIds: string[];
  scheduledTime: Date;
  chatId: string;
}
