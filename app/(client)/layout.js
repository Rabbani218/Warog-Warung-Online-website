import AIChatbot from "@/components/AIChatbot";

export default function ClientLayout({ children }) {
  return (
    <>
      {children}
      <AIChatbot />
    </>
  );
}
