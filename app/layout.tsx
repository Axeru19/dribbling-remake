import { Toaster } from "sonner";
import "./globals.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { QueryProviderWrapper } from "@/components/QueryProviderWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>
        <QueryProviderWrapper>{children}</QueryProviderWrapper>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
