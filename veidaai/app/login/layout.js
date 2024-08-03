import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <ClerkProvider>
        <body>{children}</body>
      </ClerkProvider>
    </html>
  )
}