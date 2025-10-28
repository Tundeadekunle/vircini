// Movies API route placeholder
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Search movies or get recommendations for a user
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const query = searchParams.get('q');
  if (query) {
    // Search movies by title
    const movies = await prisma.movie.findMany({
      where: { title: { contains: query } },
      take: 20,
    });
    return NextResponse.json(movies);
  }
  if (userId) {
    // Get movies recommended to this user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { recommended: true },
    });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(user.recommended);
  }
  // List all movies
  const movies = await prisma.movie.findMany({ take: 20 });
  return NextResponse.json(movies);
}

// POST: Recommend a movie to a friend
export async function POST(req: NextRequest) {
  const { fromUserId, toUserId, movieId } = await req.json();
  if (!fromUserId || !toUserId || !movieId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  // Add movie to friend's recommendations
  await prisma.user.update({
    where: { id: toUserId },
    data: { recommended: { connect: { id: movieId } } },
  });
  // Optionally, track who recommended it
  await prisma.movie.update({
    where: { id: movieId },
    data: { recommendedBy: { connect: { id: fromUserId } } },
  });
  return NextResponse.json({ status: 'recommended' });
}
