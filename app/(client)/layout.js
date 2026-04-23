import { Suspense } from "react";
import AIChatbot from "@/components/AIChatbot";
import AuthProvider from "@/components/Providers";

export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      <main className="min-h-screen overflow-x-hidden max-w-[100vw]">
        {children}
      </main>
      <Suspense fallback={null}>
        <AIChatbot />
      </Suspense>
    </AuthProvider>
  );
}
