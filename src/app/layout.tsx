import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zivan.health"),
  title: {
    default: "ZIVAN | Your Health. Your Journey.",
    template: "%s | ZIVAN",
  },
  description:
    "ZIVAN is an all-in-one health and wellbeing companion for tracking health, building better habits, improving wellbeing and accessing emergency assistance.",
  keywords: [
    "ZIVAN",
    "health tracking",
    "wellbeing",
    "emergency SOS",
    "fitness",
    "mental health",
    "health analytics",
  ],
  openGraph: {
    title: "ZIVAN | Your Health. Your Journey.",
    description:
      "Track → Analyze → Improve → Challenge → Reward. An all-in-one health and wellbeing ecosystem with emergency readiness.",
    type: "website",
    siteName: "ZIVAN",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZIVAN | Your Health. Your Journey.",
    description:
      "ZIVAN is an all-in-one health and wellbeing companion with emergency assistance.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans text-foreground">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
