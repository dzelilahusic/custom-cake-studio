import { ReactNode } from "react";

export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: "url('/pattern.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "1000px",
      }}
    >
      <div className="max-w-6xl mx-auto p-6">
        {children}
      </div>
    </div>
  );
}
