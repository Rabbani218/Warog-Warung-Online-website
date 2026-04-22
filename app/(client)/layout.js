import { Suspense } from "react";
import AIChatbot from "@/components/AIChatbot";

export default function ClientLayout({ children }) {
  return (
    <>
      {children}
      <Suspense fallback={null}>
        <AIChatbot />
      </Suspense>
    </>
  );
}
