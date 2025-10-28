import { neon } from '@neondatabase/serverless';

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    const result = await sql`SELECT * FROM users`;
    return new Response(JSON.stringify(result));
  } catch (error) {
    return new Response('Database error', { status: 500 });
  }
}