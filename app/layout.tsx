import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "মাল্টি-টেন্যান্ট সিস্টেম",
  description: "সিঙ্গেল প্রোডাক্ট ল্যান্ডিং পেজ বিল্ডার",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <CartProvider>
                {children}
                <Toaster position="top-right" />
              </CartProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
