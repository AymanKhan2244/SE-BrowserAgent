import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "SE BROWSER AGENT — Autonomous SWE Engine",
  description: "Autonomous Multi-Agent Software Engineering Pipeline built with Next.js, React, TypeScript, and LangGraph.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-on-surface antialiased font-body-md text-body-md overflow-x-hidden min-h-screen">
        <Sidebar />
        <Header />
        <main className="ml-60 pt-14 pb-12 min-h-screen bg-background">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
