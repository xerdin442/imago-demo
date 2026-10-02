"use client";

import { createAppKit, ThemeMode } from "@reown/appkit/react";
import { useEffect, type ReactNode } from "react";
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

const queryClient = new QueryClient();

const appDomain = process.env.NEXT_PUBLIC_APPKIT_DOMAIN;
if (!appDomain) throw new Error("Appkit Domain is not defined");

const metadata = {
  name: "Imago",
  description: "Wagering application for anyone, anywhere.",
  url: appDomain,
  icons: [
    "https://res.cloudinary.com/ddloc28y9/image/upload/v1756179790/imago-logo_s4lurp.png",
  ],
};

// Create the modal
export const modal = createAppKit({
  adapters: [solanaWeb3JsAdapter, wagmiAdapter],
  projectId,
  networks: [...baseNetworks, ...solanaNetworks],
  metadata,
  themeMode: "light",
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

  useEffect(() => {
    modal.setThemeMode(resolvedTheme as ThemeMode);
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
