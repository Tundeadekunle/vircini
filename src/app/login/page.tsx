// "use client";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     try {
//       const res = await fetch("/api/auth", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ action: "login", email, password }),
//       });
//       const data = await res.json();
//       if (res.ok) {
//         router.push("/dashboard");
//       } else {
//         setError(data.error || "Login failed");
//       }
//     } catch {
//       setError("Login failed");
//     }
//     setLoading(false);
//   };

//   return (
//     <main className="flex flex-col items-center justify-center min-h-screen p-4">
//       <h1 className="text-2xl font-bold mb-4">Login</h1>
//       <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-xs">
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//           className="border rounded px-3 py-2"
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//           className="border rounded px-3 py-2"
//         />
//         <button type="submit" disabled={loading} className="bg-blue-600 text-white rounded px-4 py-2 font-semibold">
//           {loading ? "Logging in..." : "Login"}
//         </button>
//         {error && <div className="text-red-500 text-sm">{error}</div>}
//       </form>
//       <div className="mt-4 text-sm">
//         Don't have an account? <Link href="/signup" className="text-blue-600 underline">Sign up</Link>
//       </div>
//     </main>
//   );
// }



















"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Login failed");
      } else {
        // cookie should be set by server; navigate to dashboard to use server-side cookie check
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-xs">
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="border rounded px-3 py-2" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="border rounded px-3 py-2" />
        <button type="submit" disabled={loading} className="bg-blue-600 text-white rounded px-4 py-2 font-semibold">
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <div className="text-red-500 text-sm">{error}</div>}
      </form>
      <div className="mt-4 text-sm">
        Don't have an account? <a href="/signup" className="text-blue-600 underline">Sign up</a>
      </div>
    </main>
  );
}