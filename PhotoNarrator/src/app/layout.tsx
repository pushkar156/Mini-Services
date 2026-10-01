import type {Metadata} from 'next';
import Script from 'next/script';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';

export const metadata: Metadata = {
  title: 'Photo Narrator — OVI Hub',
  description: 'AI-powered photo description & art historian',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Literata:opsz@7..72&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/shared/api-key-modal.css" />
        <link rel="stylesheet" href="/shared/navbar.css" />
      </head>
      <body className="font-body antialiased min-h-screen" suppressHydrationWarning>
        <ovi-navbar current="photonarrator"></ovi-navbar>
        {children}
        <Toaster />
        <Script src="/shared/api-key-manager.js" strategy="beforeInteractive" />
        <Script src="/shared/ollama-client.js" strategy="beforeInteractive" />
        <Script src="/shared/api-key-modal.js" strategy="afterInteractive" />
        <Script src="/shared/navbar.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
