import "./globals.css";

export const metadata = {
  title: "FINANCE BRUTAL",
  description: "Aggressive Finance Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen border-8 border-brutal-black">
        <header className="border-b-8 border-brutal-black p-6 bg-brutal-red text-brutal-white font-black text-4xl uppercase underline decoration-8 underline-offset-8">
          ZO.RVYN // FINANCE CORE
        </header>
        <main className="p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
