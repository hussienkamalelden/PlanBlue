import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlanBlue — Toy Store",
  description: "Online toy store powered by PlanBlue",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
