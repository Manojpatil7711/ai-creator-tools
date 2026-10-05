import type { Metadata } from "next";
import "./globals.css";
import TelegramBridge from "./telegram";
import MonetagAds from "./monetag";

export const metadata: Metadata = {
  title: "AI Creator Tools",
  description: "Telegram-first AI workflows for creators and businesses.",
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body><TelegramBridge /><MonetagAds />{children}</body></html>;
}
