// Sessions API route placeholder
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: List sessions for a user
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  // Sessions where user is host or participant
  // const sessions = await prisma.watchSession.findMany({
  //   where: {
  //     OR: [
  //       { hostUserId: userId },
  //       { participants: { some: { id: userId } } },
  //     ],
  //   },
  //   include: {
  //     movie: true,
  //     hostUser: { select: { id: true, username: true } },
  //     participants: { select: { id: true, username: true } },
  //   },
  //   orderBy: { scheduledTime: 'asc' },
  // });


  // ...existing code...
  // fetch sessions where the user is host or a participant
  const sessions = await prisma.watchSession.findMany({
    where: {
      OR: [
        { hostUserId: userId },
        { participants: { some: { id: userId } } },
      ],
    },
    include: {
      movie: true,
      hostUser: { select: { id: true } },
      participants: { select: { id: true } },
    },
    orderBy: { scheduledTime: 'asc' },
  });
  // ...existing code...
  return NextResponse.json(sessions);
}

// POST: Create a new group watch session
export async function POST(req: NextRequest) {
  const { movieId, hostUserId, participantUserIds, scheduledTime, platform } = await req.json();
  if (!movieId || !hostUserId || !scheduledTime) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const session = await prisma.watchSession.create({
    data: {
      movie: { connect: { id: movieId } },
      videoId: "internal",
      hostUser: { connect: { id: hostUserId } },
      scheduledTime: new Date(scheduledTime),
      platform: platform ?? 'web',
      participants: participantUserIds && participantUserIds.length > 0
        ? { connect: participantUserIds.map((id: string) => ({ id })) }
        : undefined,
    },
    include: {
      movie: true,
      hostUser: { select: { id: true, username: true } },
      participants: { select: { id: true } },
    },
  });
  return NextResponse.json(session);
}

// PATCH: Join a session
export async function PATCH(req: NextRequest) {
  const { sessionId, userId } = await req.json();
  if (!sessionId || !userId) return NextResponse.json({ error: 'Missing sessionId or userId' }, { status: 400 });
  const session = await prisma.watchSession.update({
    where: { id: sessionId },
    data: { participants: { connect: { id: userId } } },
    include: {
      movie: true,
      hostUser: { select: { id: true, username: true } },
      participants: { select: { id: true } },
    },
  });
  return NextResponse.json(session);
}
