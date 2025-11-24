import type { Metadata } from "next";
// We must use a standard font like Inter, as Geist causes installation issues
import { Inter } from "next/font/google"; 
import { AuthProvider } from "@/context/AuthContext"; // Import the provider
import "./globals.css";

// Initialize the standard Inter font
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Homie",
  description: "Household management app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // FIX: suppressHydrationWarning added to prevent browser extension errors (webcrx="")
    <html lang="en" suppressHydrationWarning>
      <body
        // FIX: Use the Inter font class instead of the missing Geist variables
        className={`antialiased ${inter.className}`}
      >
        {/* Wrap children with AuthProvider so useAuth() works everywhere */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}