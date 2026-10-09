import type { Metadata } from "next";
import { Fraunces, Nunito } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartProvider } from "@/components/cart/cart-provider";
import { getCurrentUser, getCurrentCook } from "@/lib/auth";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "https://gigkitchens.com"),
  title: {
    default: "Gig Kitchens | Home-cooked meals from your neighbors",
    template: "%s | Gig Kitchens",
  },
  description:
    "Order real home-cooked dinners from trusted cooks in your neighborhood. Pick up, have it dropped at your door, or get it delivered. Rate recipes, meet your neighbors, skip the dishes.",
  openGraph: {
    title: "Gig Kitchens",
    description: "Home-cooked meals from your neighbors. Pick up, drop off, or delivery.",
    type: "website",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [user, cook] = await Promise.all([getCurrentUser(), getCurrentCook()]);
  return (
    <html lang="en" className={`${fraunces.variable} ${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-cream">
          Skip to content
        </a>
        <CartProvider>
          <SiteHeader
            user={user ? { name: user.name, neighborhood: user.neighborhood, avatarHue: user.avatarHue, isAdmin: user.role === "admin" } : null}
            isCook={Boolean(cook)}
          />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
