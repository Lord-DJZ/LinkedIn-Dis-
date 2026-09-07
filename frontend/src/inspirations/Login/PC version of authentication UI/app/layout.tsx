import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Authentication UI',
  description: 'A clean modern authentication card replica with expand transition, sign-in, and sign-up workflows.',
  openGraph: {
    title: 'Authentication UI',
    description: 'A clean modern authentication card replica with expand transition, sign-in, and sign-up workflows.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Authentication UI',
    description: 'A clean modern authentication card replica with expand transition, sign-in, and sign-up workflows.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var _origFetch = window.fetch;
                Object.defineProperty(window, 'fetch', {
                  get: function() { return _origFetch; },
                  set: function(fn) { _origFetch = fn; },
                  configurable: true,
                  enumerable: true
                });
              } catch (e) {}
            `,
          }}
        />
        <link rel="preload" href="/media-loop.mp4" as="video" type="video/mp4" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
