import "./globals.css";
import PwaBootstrap from "@/components/PwaBootstrap";

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
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico"
  },
  applicationName: "Wareb Platform",
  appleWebApp: {
    capable: true,
    title: "Wareb Platform",
    statusBarStyle: "default"
  },
  formatDetection: {
    telephone: false
  }
};

import AuthProvider from "@/components/AuthProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <PwaBootstrap />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
