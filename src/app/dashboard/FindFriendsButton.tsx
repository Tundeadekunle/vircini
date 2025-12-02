"use client";

import Link from "next/link";

export default function FindFriendsButton() {
    return (
        <Link
            href="/friends"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition inline-block"
        >
            Find Friends
        </Link>
    );
}
