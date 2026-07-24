import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Velora | Luxury Hotel & Resort",
  description: "An intimate coastal sanctuary offering timeless hospitality.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="bg-stone-50 font-sans text-neutral-900 antialiased selection:bg-amber-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}