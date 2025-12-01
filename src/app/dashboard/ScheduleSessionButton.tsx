"use client";

import { useState } from "react";
import ScheduleSessionModal from "./ScheduleSessionModal";

interface Friend {
    id: string;
    friend: {
        id: string;
        username: string;
        image: string | null;
    };
}

export default function ScheduleSessionButton({ userId, friends }: { userId: string; friends: Friend[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
                Schedule Watch Party
            </button>
            <ScheduleSessionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                userId={userId}
                friends={friends}
            />
        </>
    );
}
