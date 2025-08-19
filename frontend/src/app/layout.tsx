// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SocketProvider } from '@/contexts/SocketContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Who's The Impostor?",
  description: 'A fun social deduction game',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SocketProvider>
          <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600">
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </SocketProvider>
      </body>
    </html>
  );
}