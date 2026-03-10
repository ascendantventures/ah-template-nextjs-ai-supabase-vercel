import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SaaS Ticketing Platform",
  description: "B2B SaaS ticketing platform for venues and event organizers with interactive 2D seat maps and real-time availability",
  openGraph: {
    title: "SaaS Ticketing Platform",
    description: "Discover and book tickets to concerts, sports, and conferences",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased" style={{ fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: '#09090B', color: '#F4F4F5' }}>
        {children}
      </body>
    </html>
  );
}
