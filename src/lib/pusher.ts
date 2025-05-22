import Pusher from "pusher";
import PusherClient from "pusher-js";
import { env } from "../env";

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: env.PUSHER_APP_ID,
  key: env.PUSHER_KEY,
  secret: env.PUSHER_SECRET,
  cluster: env.PUSHER_CLUSTER,
  useTLS: true,
});

// Client-side Pusher instance
export const pusherClient = new PusherClient(
  env.NEXT_PUBLIC_PUSHER_KEY,
  {
    cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
  }
);

// Channel naming helpers
export const getCommentChannelName = (linkId: string) => `link-${linkId}`;
export const getUserChannelName = (userId: string) => `user-${userId}`; 