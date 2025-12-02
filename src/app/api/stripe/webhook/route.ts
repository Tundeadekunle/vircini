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
  const sig = (await headers()).get("stripe-signature") as string;

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
      const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);

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
