// "use client";

// import { getProviders, signIn } from "next-auth/react";
// import { useEffect, useState } from "react";

// export default function SignInPage() {
//   const [providers, setProviders] = useState<any>(null);

//   useEffect(() => {
//     getProviders().then(setProviders);
//   }, []);

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
//       <h1 className="text-2xl font-bold mb-6">Sign in to Your Account</h1>
//       {providers &&
//         Object.values(providers).map((provider: any) => (
//           <button
//             key={provider.name}
//             onClick={() => signIn(provider.id)}
//             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//           >
//             Sign in with {provider.name}
//           </button>
//         ))}
//     </div>
//   );
// }






'use client'

import { getProviders, signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function SignInPage() {
  const [providers, setProviders] = useState<any>(null)

  useEffect(() => {
    getProviders().then(setProviders)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 dark:from-gray-900 dark:to-gray-800 gap-2">
      <h1 className="mb-4 text-2xl text-white">Sign In</h1>
      {providers &&
        Object.values(providers).map((provider: any) => (
          <button
            key={provider.name}
            onClick={() => signIn(provider.id)}
            className="border px-4 py-2 text-white rounded mb-2 hover:bg-blue-700 flex flex-row"
          >
            Sign in with {provider.name}
          </button>
        ))}
    </div>
  )
}
