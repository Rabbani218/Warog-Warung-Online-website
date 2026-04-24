import "./globals.css";

function resolveMetadataBase() {
  const envUrl = String(process.env.NEXTAUTH_URL || "").trim();

  try {
    if (envUrl) {
      return new URL(envUrl);
    }
  } catch (error) {
    console.warn("Invalid NEXTAUTH_URL detected, fallback to localhost:", envUrl);
  }

  return new URL("http://localhost:3000");
}

export const metadata = {
  metadataBase: resolveMetadataBase(),
  title: {
    default: "Wareb Platform",
    template: "%s | Wareb Platform"
  },
  description: "Wareb multi-portal ecommerce POS",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg"
  },
  applicationName: "Wareb Platform",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Wareb Platform",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

import Providers from "@/components/Providers";
import { Toaster } from "sonner";
import Footer from "@/components/Footer";

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body suppressHydrationWarning className="print:bg-white">
        <Providers>
          <div className="print:hidden">
            <Toaster position="top-center" richColors />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      {/* Hancurkan semua service worker yang terdaftar di browser user */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "if('serviceWorker' in navigator) { navigator.serviceWorker.getRegistrations().then(function(registrations) { for(let registration of registrations) { registration.unregister(); } }) }"
        }}
      />
      </body>
    </html>
  );
}

