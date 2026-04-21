import "./globals.css";
import PwaBootstrap from "@/components/PwaBootstrap";

export const metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
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

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <PwaBootstrap />
        {children}
      </body>
    </html>
  );
}
