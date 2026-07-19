import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { UserSwitcher } from "@/components/layout/UserSwitcher";
import { authService } from "@/lib/auth";
import { MOCK_USERS } from "@/types/user";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Operations Console",
  description: "Internal operations console prototype",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Set default user if not set
  if (!authService.getCurrentUser()) {
    authService.setCurrentUser(MOCK_USERS[0]);
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-end mb-6">
            <UserSwitcher />
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
