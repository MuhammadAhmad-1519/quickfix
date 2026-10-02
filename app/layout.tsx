import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'QuickFix — Verified Home Services Marketplace | Lahore',
  description:
    'Lahore’s premier verified home services platform. Find and choose certified plumbers, electricians, and AC technicians in minutes. Transparent prices, customer choice.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen antialiased selection:bg-teal-500 selection:text-white">
        <Navbar />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <MobileBottomNav />
        <Footer />
      </body>
    </html>
  );
}
