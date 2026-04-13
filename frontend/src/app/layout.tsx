import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { UserProvider } from '@/context/UserContext';

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-stone-900`}>
        <ThemeProvider>
          <UserProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
