import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Inter, Roboto_Flex } from 'next/font/google'
import './globals.css'

/* The three families named in the Figma UI Kit "Font Families" frame (node 1:5325). */
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const robotoFlex = Roboto_Flex({
  variable: '--font-roboto-flex',
  subsets: ['latin'],
  display: 'swap',
})

const bricolage = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Jackpot',
  description: 'Casino platform demo built from the Jackpot Figma file.',
  /*
   * The review build is hosted publicly so a link can be handed to the client, but it is an
   * unreleased design and carries third-party brand marks exported from Figma. robots.txt asks
   * crawlers not to fetch it; this header asks them not to index it if they do anyway. Neither
   * makes the URL secret — anyone holding it can open the page.
   */
  robots: { index: false, follow: false },
}

/*
 * The mobile tab bar (node 1:8235) is fixed to the bottom edge and pads itself with
 * `env(safe-area-inset-bottom)`; MobileShell reserves the same amount at the end of the document.
 * Those insets resolve to zero unless the viewport opts into the full screen, which is the one
 * piece of the mobile chrome that can only be declared here. Everything else — width, initial
 * scale — is Next's default and is left alone.
 */
export const viewport: Viewport = {
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${robotoFlex.variable} ${bricolage.variable}`}>
        {children}
      </body>
    </html>
  )
}
