// app/layout.tsx
"use client";
import { ReactNode } from "react";
import { AuthProvider } from "@/lib/authContext";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
