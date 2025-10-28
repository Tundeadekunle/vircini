import { stripe } from "@/lib/stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {db} from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Not logged in" }), { status: 401 });
  }

  const { priceId } = await req.json();
  if (!priceId) {
    return new Response(JSON.stringify({ error: "Missing priceId" }), { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  let customerId = user?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      name: user?.username ?? undefined,
    });

    await db.user.update({
      where: { email: session.user.email },
      data: { stripeCustomerId: customer.id },
    });

    customerId = customer.id;
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=cancelled`,
  });

  return new Response(JSON.stringify({ url: checkoutSession.url }), { status: 200 });
}
