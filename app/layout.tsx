import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {ClerkProvider} from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Translate AI",
  description: "Translate AI is a web app that uses AI to translate text.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={'min-h-screen h-screen overflow-hidden flex flex-col'}>
          {children}
        </body>
    </html>
    </ClerkProvider>
  );
}
