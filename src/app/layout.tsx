import type { Metadata } from 'next'
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
