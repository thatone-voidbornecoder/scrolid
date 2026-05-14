import type { Metadata } from 'next';
import SessionProvider from '@/components/ui/SessionProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Scrolid',
  description: 'your personal anime, manga & manhwa tracker',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}