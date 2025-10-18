// app/layout.tsx
"use client";
import { ReactNode } from "react";
import { AuthProvider } from "@/lib/authContext";
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
