import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Investokey CRM',
  description: 'Real Estate CRM for Sales Teams',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full w-full">
      <body className="h-full w-full m-0 p-0">
        {children}
      </body>
    </html>
  );
}