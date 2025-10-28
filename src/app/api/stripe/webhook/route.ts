// import { headers } from "next/headers";
// import { NextResponse } from "next/server";
// import { stripe, PRICE_TO_PLAN } from "../../../../lib/stripe"; // Adjust the import path as needed
// // Ensure you have the correct import path for your stripe configuration
// import { db } from "@/lib/db";

// export async function POST(req: Request) {
//   const sig = (await headers()).get("stripe-signature");
//   const body = await req.text();

//   let event;
//   try {
//     event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
//   } catch (err) {
//     return new NextResponse(`Webhook Error: ${(err as any).message}`, { status: 400 });
//   }

//   try {
//     switch (event.type) {
//       case "checkout.session.completed": {
//         const s = event.data.object as any;
//         const subscriptionId = s.subscription as string | undefined;
//         const custId = s.customer as string | undefined;
//         const userId = s.metadata?.userId as string | undefined;

//         if (userId && subscriptionId) {
//           // fetch subscription to map plan
//           const sub = await stripe.subscriptions.retrieve(subscriptionId);
//           const priceId = sub.items.data[0]?.price.id;
//           const plan = PRICE_TO_PLAN[priceId!];
//           await db.user.update({
//             where: { id: userId },
//             data: {
//               plan: plan ?? "PREMIUM",
//               stripeSubscriptionId: subscriptionId,
//               stripeCustomerId: custId,
//               currentPeriodEnd: new Date(sub.current_period_end * 1000),
//             },
//           });
//         }
//         break;
//       }
//       case "customer.subscription.updated":
//       case "customer.subscription.created": {
//         const sub = event.data.object as any;
//         const customerId = sub.customer as string;
//         const priceId = sub.items.data[0]?.price.id as string | undefined;
//         const plan = priceId ? PRICE_TO_PLAN[priceId] : undefined;
//         const user = await db.user.findFirst({ where: { stripeCustomerId: customerId } });
//         if (user) {
//           await db.user.update({
//             where: { id: user.id },
//             data: {
//               plan: plan ?? user.plan,
//               currentPeriodEnd: new Date(sub.current_period_end * 1000),
//               stripeSubscriptionId: sub.id,
//             },
//           });
//         }
//         break;
//       }
//       case "customer.subscription.deleted": {
//         const sub = event.data.object as any;
//         const customerId = sub.customer as string;
//         const user = await db.user.findFirst({ where: { stripeCustomerId: customerId } });
//         if (user) {
//           await db.user.update({
//             where: { id: user.id },
//             data: { plan: "FREE", stripeSubscriptionId: null, currentPeriodEnd: null },
//           });
//         }
//         break;
//       }
//     }
//   } catch (e) {
//     return new NextResponse("Webhook handler failed", { status: 500 });
//   }

//   return NextResponse.json({ received: true });
// }

// export const config = { api: { bodyParser: false } }; // App Router ignores, but kept for clarity
// // import { Plan } from "@prisma/client";
// // export type Plan = "FREE" | "PREMIUM" | "VIP";







// import { NextResponse } from "next/server";
// import Stripe from "stripe";
// import { db } from "@/lib/db";
// import { Plan } from "@prisma/client";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2025-07-30.basil", // Use the latest API version
// });

// // Map Stripe price IDs to Prisma Plan enum values
// const PRICE_TO_PLAN: Record<string, Plan> = {
//   "price_free_123": Plan.FREE,
//   "price_premium_123": Plan.PREMIUM,
//   "price_vip_123": Plan.VIP,
// };

// export async function POST(req: Request) {
//   const sig = req.headers.get("stripe-signature");

//   let event: Stripe.Event;

//   try {
//     const rawBody = await req.text();
//     event = stripe.webhooks.constructEvent(rawBody, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
//   } catch (err: any) {
//     console.error("❌ Webhook signature verification failed:", err.message);
//     return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
//   }

//   // ✅ Handle subscription update events
//   if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
//     const subscription = event.data.object as Stripe.Subscription;

//     const customerId = subscription.customer as string;
//     const priceId = subscription.items.data[0].price.id;
//     const plan = PRICE_TO_PLAN[priceId];

//     // Convert Unix timestamp to JS Date
//     const periodEnd = new Date(subscription.current_period_end * 1000);

//     try {
//       await db.user.update({
//         where: { stripeCustomerId: customerId },
//         data: {
//           plan,
//           currentPeriodEnd: periodEnd,
//         },
//       });

//       console.log(`✅ Updated user plan to ${plan}, period ends on ${periodEnd.toISOString()}`);
//     } catch (err) {
//       console.error("❌ Failed to update user:", err);
//     }
//   }

//   return new NextResponse("Event received", { status: 200 });
// }





import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { db } from "@/lib/db"; // your Prisma client

// 1️⃣ Stripe setup
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 2️⃣ Handle events
  switch (event.type) {
    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const subscription = event.data.object as Stripe.Subscription;

      const customerId = subscription.customer as string;

      // Convert Unix timestamp to Date
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

      // Make sure stripeCustomerId is unique in Prisma schema
      await db.user.update({
        where: { stripeCustomerId: customerId },
        data: {
          plan: subscription.items.data[0].price.nickname?.toUpperCase() as "FREE" | "PREMIUM" | "VIP",
          subscriptionEnd: currentPeriodEnd, // optional date field
        },
      });

      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await db.user.update({
        where: { stripeCustomerId: customerId },
        data: { plan: "FREE" },
      });

      break;
    }
  }

  return NextResponse.json({ received: true });
}
