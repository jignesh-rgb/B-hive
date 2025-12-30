import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { getServerSession } from "next-auth/next";
import 'svgmap/dist/svgMap.min.css';
import SessionProvider from "@/utils/SessionProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/Providers";
import SessionTimeoutWrapper from "@/components/SessionTimeoutWrapper";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: "B-hive - Natural Health & Wellness Products",
  description: "Discover natural health products designed for your well-being. From organic supplements to eco-friendly essentials, find everything you need for a healthier lifestyle.",
  keywords: "health, wellness, natural products, organic supplements, eco-friendly, healthy lifestyle",
  authors: [{ name: "B-hive Team" }],
  openGraph: {
    title: "B-hive - Natural Health & Wellness Products",
    description: "Discover natural health products designed for your well-being.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      </head>
      <body className="font-sans antialiased">
        <SessionProvider session={session}>
          <SessionTimeoutWrapper />
          <Header />
          <Providers>
            {children}
          </Providers>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
