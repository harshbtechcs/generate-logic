import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { CardSpotlight } from "@/components/motion/CardSpotlight";
import { site } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Learn Cloud & DevOps`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  icons: { icon: "/logo-mark.png", apple: "/logo-mark.png" },
  openGraph: {
    title: `${site.name} — Learn Cloud & DevOps`,
    description: site.description,
    url: site.url,
    siteName: site.name,
    images: [{ url: "/logo-full.png", width: 512, height: 512 }],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#060B19",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable} ${mono.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-teal focus:px-4 focus:py-2 focus:text-ink-900"
        >
          Skip to content
        </a>
        <Providers>
          <ScrollProgress />
          <CardSpotlight />
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
