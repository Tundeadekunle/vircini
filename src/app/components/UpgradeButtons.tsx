"use client";

import { useState } from "react";

async function go(priceId: string) {
  const res = await fetch("/api/stripe/create-checkout-session", {
    method: "POST",
    body: JSON.stringify({ priceId }),
    headers: { "Content-Type": "application/json" },
  });
  const { url } = await res.json();
  if (url) window.location.href = url;
}

export function UpgradeButtonPremium() {
  const [loading, setLoading] = useState(false);
  return (
    <button
      className="rounded bg-black text-white px-4 py-2"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await go(process.env.NEXT_PUBLIC_PRICE_PREMIUM ?? "");
        setLoading(false);
      }}
    >
      Upgrade to Premium
    </button>
  );
}

export function UpgradeButtonVIP() {
  const [loading, setLoading] = useState(false);
  return (
    <button
      className="rounded bg-purple-600 text-white px-4 py-2"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await go(process.env.NEXT_PUBLIC_PRICE_VIP ?? "");
        setLoading(false);
      }}
    >
      Upgrade to VIP
    </button>
  );
}
// export function UpgradeButtons() {
//   return (
//     <div className="flex gap-4">
//       <UpgradeButtonPremium />
//       <UpgradeButtonVIP />
//     </div>
//   );
// }