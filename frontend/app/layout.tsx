"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PT_Sans } from "next/font/google";
import { usePathname } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useState } from "react";
import "./globals.css";
import NavBar from "./NavBar";

const ptSans = PT_Sans({
    weight: ["400", "700"],
    subsets: ["latin"],
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 1 minute
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    const hideNavbar =
        pathname.includes("/login") || pathname.includes("/signup") || pathname.includes("claims/declare");

    return (
        <html lang="en">
            <body className={`${ptSans.className} ${ptSans.className} antialiased`}>
                <div>
                    {!hideNavbar && <NavBar />}
                    <main className={!hideNavbar ? "ml-[300px]" : ""}>
                        <NuqsAdapter>
                            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                            <div id="portal-root" />
                        </NuqsAdapter>
                    </main>
                </div>
            </body>
        </html>
    );
}
