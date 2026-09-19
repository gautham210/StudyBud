import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta-sans" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
export const metadata: Metadata = { title: "StudyBud", description: "Your notes. Your way to learn." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${jakarta.variable} ${space.variable}`}>{children}</body></html>;
}
