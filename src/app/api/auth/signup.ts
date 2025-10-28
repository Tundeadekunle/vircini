// import type { NextApiRequest, NextApiResponse } from "next";
// import {db} from "@/lib/prisma";
// import { hash } from "bcryptjs";

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ message: "Method not allowed" });
//   }

//   const { username, email, password } = req.body;

//   // 1. Validate input
//   if (!username || !email || !password) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   try {
//     // 2. Check if username/email already exists
//     const existingUser = await db.user.findFirst({
//       where: {
//         OR: [{ username }, { email }],
//       },
//     });

//     if (existingUser) {
//       return res.status(400).json({ message: "Username or email already taken" });
//     }

//     // 3. Hash password
//     const passwordHash = await hash(password, 10);

//     // 4. Create user
//     const newUser = await db.user.create({
//       data: {
//         username,
//         email,
//         passwordHash,
//         imageUrl: null, // can be set later
//         role: "USER",   // default role
//       },
//     });

//     // 5. Return success
//     return res.status(201).json({
//       message: "User created successfully",
//       user: {
//         id: newUser.id,
//         username: newUser.username,
//         email: newUser.email,
//       },
//     });
//   } catch (error) {
//     console.error("Signup error:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// }
