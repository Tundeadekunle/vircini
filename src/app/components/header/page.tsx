// 'use client'

// import { useSession, signIn, signOut } from 'next-auth/react'

// export default function Header() {
//   const { data: session } = useSession()

//   return (
//     <header className="bg-white shadow p-4 mb-6">
//       <div className="container mx-auto flex justify-between items-center">
//         {session ? (
//           <>
//             <span>Signed in as {session.user?.email}</span>
//             <button onClick={() => signOut()}>Sign out</button>
//           </>
//         ) : (
//           <button onClick={() => signIn()}>Sign in</button>
//         )}
//       </div>
//     </header>
//   )
// }






// src/components/Header.tsx
"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex items-center justify-between p-4 bg-gray-100 shadow">
      {/* Logo / Home link */}
      <Link href="/" className="text-xl font-bold">
        MyApp
      </Link>

      {/* Navigation */}
      <nav className="flex items-center gap-4">
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>

        {/* Sign in / Sign out */}
        {session ? (
          <>
            <span className="text-sm">Hi, {session.user?.name}</span>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Sign out
            </button>
          </>
        ) : (
          <button
  onClick={() => signIn("google")}
  className="px-4 py-2 bg-blue-500 text-white rounded"
>
  Sign up with Google
</button>

        )}
      </nav>
    </header>
  );
}
