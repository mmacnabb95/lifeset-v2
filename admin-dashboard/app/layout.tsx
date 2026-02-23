import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LifeSetOS Admin Dashboard",
  description: "Manage organisations, members, bookings, and memberships",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

