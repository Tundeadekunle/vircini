// 'use client'

// import { signIn } from 'next-auth/react'

// export default function SignInPage() {
//   return (
//     <div className="max-w-md mx-auto">
//       <h2 className="text-xl font-semibold mb-4">Sign in</h2>
//       <button className="btn" onClick={() => signIn('google')}>Sign in with Google</button>
//       <div className="mt-4">
//         <form onSubmit={(e) => { e.preventDefault(); const form = e.target as HTMLFormElement; const email = (form.email as HTMLInputElement).value; signIn('email', { email }) }}>
//           <label className="block">Email</label>
//           <input name="email" type="email" className="border p-2 w-full" />
//           <button type="submit" className="mt-2 btn">Sign in with Email</button>
//         </form>
//       </div>
//     </div>
//   )
// }



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
  useEffect(() => { getProviders().then(setProviders) }, [])
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-6 max-w-md w-full border rounded">
        <h2 className="text-xl mb-4">Sign in</h2>
        {providers && Object.values(providers).map((p: any) => (
          <button key={p.name} onClick={() => signIn(p.id)} className="w-full mb-2 p-2 border rounded">
            Sign in with {p.name}
          </button>
        ))}
      </div>
    </div>
  )
}
