// // ...existing code...
// import { NextRequest, NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcryptjs";

// const prisma = new PrismaClient();

// // Simple GET to show the route is active (you can remove or expand)
// export async function GET() {
//   return NextResponse.json({ ok: true, message: "Auth endpoint" });
// }

// // POST handles signup and login actions
// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const action = body?.action;

//     if (action === "signup") {
//       const { username, email, password } = body;
//       if (!username || !email || !password) {
//         return NextResponse.json({ error: "username, email and password required" }, { status: 400 });
//       }
//       const existing = await prisma.user.findUnique({ where: { email } });
//       if (existing) {
//         return NextResponse.json({ error: "Email already in use" }, { status: 409 });
//       }
//       const passwordHash = await bcrypt.hash(password, 10);
//       const user = await prisma.user.create({
//         data: { username, email, passwordHash },
//         select: { id: true, username: true, email: true },
//       });
//       return NextResponse.json({ user }, { status: 201 });
//     }

//     if (action === "login") {
//       const { email, password } = body;
//       if (!email || !password) {
//         return NextResponse.json({ error: "email and password required" }, { status: 400 });
//       }
//       const user = await prisma.user.findUnique({ where: { email } });
//       if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
//       // Ensure passwordHash is present before calling bcrypt.compare
//       if (!user.passwordHash) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
//       const match = await bcrypt.compare(password, user.passwordHash);
//       if (!match) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
//       // Return safe user object (no password)
//       const safe = { id: user.id, username: user.username, email: user.email };
//       return NextResponse.json({ user: safe }, { status: 200 });
//     }

//     return NextResponse.json({ error: "Unknown action" }, { status: 400 });
//   } catch (err) {
//     console.error("Auth route error:", err);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }











import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET() {
  return NextResponse.json({ ok: true, message: "Auth endpoint" });
}

function makeSessionResponse(body: any, status = 200, userId?: string) {
  const res = NextResponse.json(body, { status });
  if (userId) {
    res.cookies.set({
      name: "session",
      value: userId,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }
  return res;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body?.action;

    if (action === "signup") {
      const { username, email, password } = body;
      if (!username || !email || !password) {
        return NextResponse.json({ error: "username, email and password required" }, { status: 400 });
      }
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { username, email, passwordHash },
        select: { id: true, username: true, email: true },
      });
      // set session cookie and return user
      return makeSessionResponse({ user }, 201, user.id);
    }

    if (action === "login") {
      const { email, password } = body;
      if (!email || !password) {
        return NextResponse.json({ error: "email and password required" }, { status: 400 });
      }
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      if (!user.passwordHash) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      const safe = { id: user.id, username: user.username, email: user.email };
      // set session cookie and return safe user
      return makeSessionResponse({ user: safe }, 200, user.id);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Auth route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}