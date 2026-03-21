//frontend/src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartPreview } from "@/components/cart/CartPreview";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Commerce Lab",
  description: "Mini e-commerce full stack con Spring Boot y Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-slate-950 text-slate-100 antialiased">
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen bg-slate-950 text-slate-100">
              <Navbar />
              <div className="pt-[73px]">
                {children}
              </div>
              <CartPreview />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
