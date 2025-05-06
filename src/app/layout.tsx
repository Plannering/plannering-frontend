import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plannering",
  description: "Planejamento e Gestão de estudos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="flex flex-row w-full">{children}</body>
    </html>
  );
}
