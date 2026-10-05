"use client";

import { useState } from "react";

export default function RewardedAdButton({ onReward }: { onReward: () => void }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function watch() {
    const show = window.show_11962391;
    if (!show || busy) return;
    setBusy(true); setMessage("");
    try {
      await show();
      onReward();
      setMessage("Ad complete — 1 extra AI generation unlocked.");
    } catch {
      setMessage("Ad could not be completed. Please try again.");
    } finally { setBusy(false); }
  }

  return <div>
    <button className="generate" type="button" onClick={watch} disabled={busy}>
      {busy ? "Watching ad…" : "▶ Watch a short ad → Unlock 1 more generation"}
    </button>
    {message && <div className="notice"><span>{message}</span></div>}
  </div>;
}
