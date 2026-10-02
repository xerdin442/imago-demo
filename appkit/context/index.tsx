"use client";

import { createAppKit, ThemeMode } from "@reown/appkit/react";
import { useEffect, useState, type ReactNode } from "react";
import {
  solanaWeb3JsAdapter,
  projectId,
  baseNetworks,
  solanaNetworks,
  wagmiAdapter,
} from "../config";
import { WagmiProvider, cookieToInitialState, type Config } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { env } from "@/lib/env";

const metadata = {
  name: "Imago",
  description: "Wagering application for anyone, anywhere.",
  url: env.appkitDomain,
  icons: [
    "https://res.cloudinary.com/ddloc28y9/image/upload/v1756179790/imago-logo_s4lurp.png",
  ],
};

function getInitialThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "light";

  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export const modal = createAppKit({
  adapters: [solanaWeb3JsAdapter, wagmiAdapter],
  projectId,
  networks: [...baseNetworks, ...solanaNetworks],
  metadata,
  themeMode: getInitialThemeMode(),
  enableReconnect: false,
  features: {
    analytics: true,
  },
  themeVariables: {
    "--apkt-border-radius-master": "5px",
    "--apkt-z-index": 9999,
  },
});

function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies?: string | null;
}) {
  const { resolvedTheme } = useTheme();
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  );

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: true,
            retry: 1,
          },
        },
      })
  );

  useEffect(() => {
    if (resolvedTheme) modal.setThemeMode(resolvedTheme as ThemeMode);
  }, [resolvedTheme]);

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProvider;
