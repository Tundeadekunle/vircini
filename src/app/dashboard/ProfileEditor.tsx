"use client";
import { useState, useRef } from "react";
import { useUser } from "./user-context";

export default function ProfileEditor({ onUpdate }: { onUpdate?: () => void }) {
  const user = useUser();
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatar(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user?.id,
          username,
          email,
          bio,
          avatar,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      if (onUpdate) onUpdate();
      alert("Profile updated!");
    } catch (err: any) {
      setError(err.message || "Update failed");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4 items-center w-full max-w-xs mb-8">
      <div className="flex flex-col items-center">
        <div className="relative mb-2">
          <img
            src={avatar || "/file.svg"}
            alt="Avatar"
            className="rounded-full border w-20 h-20 object-cover"
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 text-xs"
          >
            Edit
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInput}
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="border rounded px-3 py-2 mb-2 w-full"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="border rounded px-3 py-2 mb-2 w-full"
        />
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Short bio (optional)"
          className="border rounded px-3 py-2 w-full"
        />
      </div>
      <button type="submit" disabled={loading} className="bg-blue-600 text-white rounded px-4 py-2 font-semibold w-full">
        {loading ? "Saving..." : "Save Profile"}
      </button>
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </form>
  );
}
