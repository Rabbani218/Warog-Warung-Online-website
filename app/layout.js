import "./globals.css";
import PwaBootstrap from "@/components/PwaBootstrap";

export const metadata = {
  title: "Wareb Platform",
  description: "Wareb multi-portal ecommerce POS",
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <PwaBootstrap />
        {children}
      </body>
    </html>
  );
}
