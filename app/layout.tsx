import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers/Providers';
import { Toaster } from 'react-hot-toast';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Org Portfolio';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - 3D Portfolio with Admin CMS`,
    template: `%s | ${siteName}`,
  },
  description: 'Creating immersive 3D digital experiences that elevate your brand and engage your audience.',
  keywords: ['3D portfolio', 'Three.js', 'Next.js', 'WebGL', 'React', 'creative agency'],
  authors: [{ name: 'Org Portfolio' }],
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: `${siteName} - 3D Portfolio with Admin CMS`,
    description: 'Creating immersive 3D digital experiences that elevate your brand and engage your audience.',
    siteName,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: 'Creating immersive 3D digital experiences that elevate your brand and engage your audience.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <Providers>{children}</Providers>
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'dark:!bg-dark-800 dark:!text-white',
            duration: 3500,
          }}
        />
      </body>
    </html>
  );
}