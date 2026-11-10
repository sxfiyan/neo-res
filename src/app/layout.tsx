import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEO-RES // Student Results & Record Manager",
  description: "Neobrutalist university results viewer (GET) and record updater (POST)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen flex flex-col font-sans selection:bg-black selection:text-[#fde047]">
        {children}
      </body>
    </html>
  );
}
