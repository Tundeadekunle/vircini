// Chat API route placeholder
// import { NextRequest, NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// // GET: Retrieve chat messages for a session
// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const sessionId = searchParams.get('sessionId');
//   if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
//   const messages = await prisma.chatMessage.findMany({
//     where: { sessionId },
//     orderBy: { timestamp: 'asc' },
//     include: { user: { select: { id: true, username: true } } },
//   });
//   return NextResponse.json(messages);
// }

// // POST: Send a chat message
// export async function POST(req: NextRequest) {
//   const { sessionId, userId, message } = await req.json();
//   if (!sessionId || !userId || !message) {
//     return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
//   }
//   const chatMessage = await prisma.chatMessage.create({
//     data: {
//       sessionId,
//       userId,
//       message,
//     },
//     include: { user: { select: { id: true, username: true } } },
//   });
//   return NextResponse.json(chatMessage);
// }





import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { sessionId, message } = req.body
    const msg = await prisma.chatMessage.create({ data: { sessionId, message, userId: '00000000-0000-0000-0000-000000000000' } })
    return res.status(201).json(msg)
  }
  res.status(405).end()
}