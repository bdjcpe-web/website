import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

export const metadata: Metadata = {
  title: "BDJ CPE Lyon - Le Bureau des Jeux",
  description: "Association étudiante de CPE Lyon dédiée au Gaming, à l'Esport et aux Jeux de Société. Réservez le local et rejoignez nos tournois !",
  icons: {
    icon: "/bdj_logo.png",
    apple: "/bdj_logo.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" style={{ scrollBehavior: 'smooth' }}>
      <head>
        <link rel="icon" type="image/png" href="/bdj_logo.png?v=2" />
        <link rel="shortcut icon" type="image/png" href="/bdj_logo.png?v=2" />
        <link rel="apple-touch-icon" href="/bdj_logo.png?v=2" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <script src="https://unpkg.com/@phosphor-icons/web" async></script>
      </head>
      <body className="antialiased">
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
