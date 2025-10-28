import Link from 'next/link';
import React from 'react';

const Navbar = () => (
  <nav className="flex items-start justify-between px-6 py-4 bg-white/80 backdrop-blur-md shadow-md">
    <div className="text-2xl font-bold items-start text-gray-800">Logo</div>
    {/* <div className="hidden md:flex gap-8">
      <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">Home</Link>
      <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium">About</Link>
      <Link href="/mission" className="text-gray-700 hover:text-blue-600 font-medium">Mission</Link>
      <Link href="/gallery" className="text-gray-700 hover:text-blue-600 font-medium">Gallery</Link>
      <a href="#testimonials" className="text-gray-700 hover:text-blue-600 font-medium">Testimonials</a>
      <a href="#staff" className="text-gray-700 hover:text-blue-600 font-medium">Staff</a>
    </div> */}
    {/* <Link href="/registration" className="hidden md:inline-block bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
      Register
    </Link> */}
  </nav>
);

export default Navbar;
