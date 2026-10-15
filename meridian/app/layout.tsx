import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Meridian | Global Air Cargo Tracking",
  description: "Track any air cargo shipment from any airline with a single AWB number.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
