// src/app/api/set-username/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { db } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { username } = await req.json();

  await db.user.update({
    where: { id: session.user.id },
    data: { username },
  });

  return new Response("Username saved", { status: 200 });
}
