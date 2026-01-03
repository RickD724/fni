import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "F&I Product Menu",
  description: "F&I Product Menu",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
