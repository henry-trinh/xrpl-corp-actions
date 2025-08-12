import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import CssBaseline from "@mui/material/CssBaseline"
import { QueryProvider } from "@/components/providers/query-provider"
import { ThemeContextProvider } from "@/components/providers/theme-provider"
import { ToastProvider } from "@/components/providers/toast-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "XRPL Corporate Actions Tracker",
  description: "Track corporate actions and payouts on XRPL testnet",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <ThemeContextProvider>
            <CssBaseline />
            <QueryProvider>
              <ToastProvider>{children}</ToastProvider>
            </QueryProvider>
          </ThemeContextProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
