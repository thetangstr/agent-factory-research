import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Agent Factory Research",
  description:
    "Enterprise agent factory competitive research and analysis platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" style={{ colorScheme: "light" }}>
      <body
        className="min-h-full flex flex-col"
        style={{ background: "var(--md-sys-color-background)", color: "var(--md-sys-color-on-surface)" }}
      >
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
