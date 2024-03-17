
import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const metadata: Metadata = {
  title: "ChatApp-with-ChatGPT",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="jp">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}