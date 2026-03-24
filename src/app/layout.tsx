import type { Metadata } from "next";
import { Geist } from "next/font/google";
import ThemeRegistry from "@/lib/ThemeRegistry";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Me Leva! - Adoção de Animais",
    template: "%s | Me Leva!",
  },
  description:
    "Plataforma de adoção de animais resgatados em Fortaleza. Encontre seu novo companheiro!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
