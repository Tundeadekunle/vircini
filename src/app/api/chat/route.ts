import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST: Send a chat message
export async function POST(req: NextRequest) {
  try {
    const { sessionId, message, userId } = await req.json();

    if (!sessionId || !message || !userId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const chatMessage = await db.chatMessage.create({
      data: {
        sessionId,
        userId,
        message,
        content: message, // Schema requires content, mirroring message for now
      },
      include: { user: { select: { id: true, username: true } } },
    });

    return NextResponse.json(chatMessage, { status: 201 });
  } catch (error) {
    console.error('Error creating chat message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}