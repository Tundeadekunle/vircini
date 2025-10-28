import Link from "next/link";
import Image from "next/image";
import Header from "./components/header/page";
// import { useSession } from "next-auth/react";
// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { getServerSession } from "next-auth";
// import { authOptions } from "./api/auth/[...nextauth]/route";
import Navbar from "./components/navbar/page";

export default function Home() {
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 dark:from-gray-900 dark:to-gray-800 p-8 max-w-full">
      <div className="flex justify-between gap-96 items-center mb-8 w-full">
        {/* <Navbar/> */}
        <Header/>
      </div>
      <header className="flex flex-col items-center mb-10">
        
        <h1 className="text-6xl font-bold mb-2 text-center bg-gradient-to-r from-pink-500 via-pink-500 to-purple-600 text-transparent bg-clip-text">Vircini</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-xl">
          Watch movies together, chat live, recommend films, and connect with friends—all in one place.
        </p>
      </header>
      <main className="w-full max-w-2xl flex flex-col gap-8 items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          <FeatureCard title="Group Watch" desc="Schedule and join movie sessions with friends." icon="/window.svg" />
          <FeatureCard title="Live Chat" desc="Chat in real time during group watch or about any movie." icon="/vercel.svg" />
          <FeatureCard title="Friend System" desc="Search, add, and manage your friends." icon="/file.svg" />
          <FeatureCard title="Movie Recommendations" desc="Recommend and discuss movies with your network." icon="/globe.svg" />
        </div>
        <nav className="flex flex-wrap gap-4 justify-center mt-8">
          <Link href="/login" className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">Login</Link>
          <Link href="/signup" className="px-6 py-2 rounded bg-orange-500 text-white font-semibold hover:bg-orange-600 transition">Sign Up</Link>
          <Link href="/dashboard" className="px-6 py-2 rounded bg-gray-200 dark:bg-gray-700 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition">Dashboard</Link>
          <Link href="/friends" className="px-6 py-2 rounded bg-green-500 text-white font-semibold hover:bg-green-600 transition">Friends</Link>
          <Link href="/movies" className="px-6 py-2 rounded bg-purple-500 text-white font-semibold hover:bg-purple-600 transition">Movies</Link>
          <Link href="/sessions" className="px-6 py-2 rounded bg-pink-500 text-white font-semibold hover:bg-pink-600 transition">Group Watch</Link>
        </nav>
      </main>
      <footer className="mt-16 text-gray-400 text-xs">&copy; {new Date().getFullYear()} Vircini Social Streaming</footer>
    </div>
  );
}

function FeatureCard({ title, desc, icon }: { title: string; desc: string; icon: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 flex flex-col items-center text-center border border-gray-100 dark:border-gray-800">
      <Image src={icon} alt={title} width={40} height={40} className="mb-2" />
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm">{desc}</p>
    </div>
  );
}
