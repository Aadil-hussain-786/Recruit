import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import SmoothScroll from "@/components/providers/SmoothScroll";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Recruit AI | Transform Your Hiring Process",
  description: "The modern recruitment platform powered by AI to help you find the best talent effortlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} ${outfit.variable} font-sans antialiased bg-white text-zinc-900 dark:bg-black dark:text-zinc-50`}>
        <SmoothScroll>
          <AuthProvider>
            <Navbar />
            <main className="min-h-screen pt-16">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
