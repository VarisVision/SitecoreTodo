import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "@/styles/styles.scss";

export const metadata: Metadata = {
  title: "Sitecore XM Cloud - Google Analytics module",
  description: "A Sitecore XM Cloud module that allows you to connect to Google Analytics and display the data in a custom component.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
