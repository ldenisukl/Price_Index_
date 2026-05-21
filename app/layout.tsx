import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Price Index Moldova AI',
  description: 'Dashboard AI pentru prețuri servicii, carburant, valută și produse în Moldova.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
