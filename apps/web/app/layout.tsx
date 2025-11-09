import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { WalletProvider } from "@/components/providers/wallet-provider"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Airdrop Finder - Check Your Eligibility",
  description: "Discover airdrops you're eligible for based on your onchain activity. Check wallet eligibility for popular crypto airdrops.",
  keywords: ["airdrop", "crypto", "blockchain", "eligibility", "wallet"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          {children}
          <Toaster richColors />
        </WalletProvider>
      </body>
    </html>
  )
}
