import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flat Expense Manager - Building Management System",
  description:
    "Complete apartment building management system for residents, admins, and super admins. Manage bills, complaints, and building operations efficiently.",
  generator: "Next.js",
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
