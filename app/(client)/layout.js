import { Suspense } from "react";
import AIChatbot from "@/components/AIChatbot";
import AuthProvider from "@/components/Providers";

export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      {children}
      <Suspense fallback={null}>
        <AIChatbot />
      </Suspense>
    </AuthProvider>
  );
}
