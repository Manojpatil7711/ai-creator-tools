"use client";
import Script from "next/script";
import { useEffect } from "react";

export default function TelegramBridge() {
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) { tg.ready(); tg.expand(); }
  }, []);
  return <Script src="https://telegram.org/js/telegram-web-app.js" strategy="afterInteractive" />;
}
