import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "RescueNet - Unified Response System | Kerala Floods '26",
  description: "Neo-Brutalist Disaster Response & AI Triage Platform for Kerala Emergency Command",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#f5f0e8] text-[#1a1a1a] font-body antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
