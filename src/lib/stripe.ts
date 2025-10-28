// import Stripe from "stripe";

// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2024-06-20",
// });

// export const PRICE_TO_PLAN: Record<string, "PREMIUM" | "VIP"> = {
//   [process.env.STRIPE_PRICE_PREMIUM!]: "PREMIUM",
//   [process.env.STRIPE_PRICE_VIP!]: "VIP",
// };






import Stripe from "stripe";
import { Plan } from "@prisma/client";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil", // ✅ matches Stripe's latest typings
});
// Map your Stripe price IDs to plan names

export const PRICE_TO_PLAN: Record<string, Plan> = {
  "price_1234567890_free": Plan.FREE,
  "price_1234567890_premium": Plan.PREMIUM,
  "price_1234567890_vip": Plan.VIP,
};
// export const PRICE_TO_PLAN: Record<string, "free" | "premium" | "vip"> = {
//   // Replace these with your actual Stripe Price IDs
//   "price_1234567890_free": Plan.FREE, // Example price ID for free plan
//   "price_1234567890_premium": Plan.PREMIUM, // Example price
//   "price_1234567890_vip": plan.VIP, // Example price ID for VIP plan
// };
// const PRICE_TO_PLAN: Record<string, "PREMIUM" | "VIP"> = {
//   [process.env.STRIPE_PRICE_PREMIUM!]: "PREMIUM",
//   [process.env.STRIPE_PRICE_VIP!]: "VIP",
// };