import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export const metadata = {
  title: "SE Browser Agent | Autonomous Multi-Agent SWE Canvas",
  description: "Autonomous Multi-Agent Software Engineering Pipeline built with Next.js, React, TypeScript, and LangGraph.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#07090D] text-[#F3F5F9] antialiased font-sans overflow-x-hidden min-h-screen">
        <Sidebar />
        <Header />
        <main className="ml-16 min-h-screen bg-[#07090D] canvas-grid relative">
          {children}
        </main>
      </body>
    </html>
  );
}
