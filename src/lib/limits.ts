import { Plan } from "@prisma/client";

export const planLimits = {
  FREE: {
    maxHostedSessions: 3,
    maxChatMessagesVisible: 10,
    maxQuality: "720p" as const,
    allowedPlatform: "youtube" as const,
    minAgeDays: 365,
  },
  PREMIUM: {
    maxHostedSessions: 1000,
    maxChatMessagesVisible: 200,
    maxQuality: "1080p" as const,
    allowedPlatform: "any" as const,
    minAgeDays: 0,
  },
  VIP: {
    maxHostedSessions: 10000,
    maxChatMessagesVisible: 1000,
    maxQuality: "4k" as const,
    allowedPlatform: "any" as const,
    minAgeDays: 0,
  },
} satisfies Record<Plan, any>;
// export type PlanLimits = typeof planLimits[keyof typeof planLimits];