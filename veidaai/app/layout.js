import { Inter } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  ClerkLoaded,
  ClerkLoading,
} from '@clerk/nextjs';
import Navbar from '../components/navbar';
import { dark } from "@clerk/themes";
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Veida AI",
  description: "Veida AI - Transform Lectures into Personalized Learning Experiences",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en">
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet"></link>
          {/* Google Analytics */}
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `,
            }}
          />
        </head>
        <body className={inter.className}>
          <ClerkLoading>
            <div className="loading">Loading...</div>
          </ClerkLoading>
          <ClerkLoaded>
            <div className="container">
              <div className="c2">
                <Navbar />
                {children}
              </div>
            </div>
          </ClerkLoaded>
        </body>
      </html>
    </ClerkProvider>
  );
}