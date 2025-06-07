import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MicroLoanX - Decentralized Microloan Platform",
  description: "A decentralized microloan platform powered by XRP Ledger - Connecting unbanked borrowers with global lenders",
};

function FloatingParticles() {
  return (
    <div className="floating-particles">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 8 + 3}px`,
            height: `${Math.random() * 8 + 3}px`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${Math.random() * 6 + 6}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen`}>
        <FloatingParticles />
        <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-10"></div>
        <div className="relative z-10">
          {children}
        </div>
        {/* Enhanced background effects with new colors */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s'}}></div>
          <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-accent-500/8 rounded-full blur-3xl animate-pulse" style={{animationDelay: '6s'}}></div>
        </div>
        {/* Ambient glow */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950/50 via-transparent to-transparent"></div>
        </div>
      </body>
    </html>
  );
}
