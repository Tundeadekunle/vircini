// Friends API route placeholder
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: List friends or search users
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const query = searchParams.get('q');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  if (query) {
    // Search users by username
    const users = await prisma.user.findMany({
      where: {
        username: { contains: query },
        NOT: { id: userId },
      },
      select: { id: true, username: true, email: true },
    });
    return NextResponse.json(users);
  }
  // List friends
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { friends: { select: { id: true, username: true, email: true } } },
  });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json(user.friends);
}

// POST: Send friend request
export async function POST(req: NextRequest) {
  const { fromUserId, toUserId } = await req.json();
  if (!fromUserId || !toUserId) return NextResponse.json({ error: 'Missing user IDs' }, { status: 400 });
  if (fromUserId === toUserId) return NextResponse.json({ error: 'Cannot friend yourself' }, { status: 400 });
  // Check if request already exists
  const existing = await prisma.friendRequest.findFirst({
    where: {
      fromUserId,
      toUserId,
      status: 'pending',
    },
  });
  if (existing) return NextResponse.json({ error: 'Request already sent' }, { status: 400 });
  const reqCreated = await prisma.friendRequest.create({
    data: { fromUserId, toUserId, status: 'pending' },
  });
  return NextResponse.json(reqCreated);
}

// PATCH: Accept/decline friend request
export async function PATCH(req: NextRequest) {
  const { requestId, action } = await req.json();
  if (!requestId || !['accept', 'decline'].includes(action)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const friendReq = await prisma.friendRequest.findUnique({ where: { id: requestId } });
  if (!friendReq || friendReq.status !== 'pending') {
    return NextResponse.json({ error: 'Request not found or already handled' }, { status: 404 });
  }
  if (action === 'accept') {
    // Add each user to the other's friends
    await prisma.user.update({
      where: { id: friendReq.fromUserId },
      data: { friends: { connect: { id: friendReq.toUserId } } },
    });
    await prisma.user.update({
      where: { id: friendReq.toUserId },
      data: { friends: { connect: { id: friendReq.fromUserId } } },
    });
    await prisma.friendRequest.update({ where: { id: requestId }, data: { status: 'accepted' } });
    return NextResponse.json({ status: 'accepted' });
  } else {
    await prisma.friendRequest.update({ where: { id: requestId }, data: { status: 'declined' } });
    return NextResponse.json({ status: 'declined' });
  }
}
