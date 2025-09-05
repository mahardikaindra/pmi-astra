import type { Metadata } from "next";
import { ThemeProvider } from "./theme-provider";
import "../styles/globals.css";
import { Roboto } from "next/font/google";
import TabBar from "@/components/TabBar";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"], // pilih variasi
});

export const metadata: Metadata = {
  title: "SIKR Astra",
  description: "Sistem Informasi Kerja Rutin Astra",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.className} antialiased`}>
        <ThemeProvider>
          {children}
          <TabBar />
        </ThemeProvider>
      </body>
    </html>
  );
}
