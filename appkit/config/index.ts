import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base, baseSepolia, solana, solanaDevnet } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { http } from 'wagmi'

export const projectId = process.env.NEXT_PUBLIC_APPKIT_PROJECT_ID as string
if (!projectId) throw new Error('Project ID is not defined');

const isDev = process.env.NODE_ENV === "development";
export const baseNetworks = [isDev ? baseSepolia : base] as [AppKitNetwork, ...AppKitNetwork[]]
export const solanaNetworks = [isDev ? solanaDevnet : solana] as [AppKitNetwork, ...AppKitNetwork[]]

export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks: baseNetworks,
  transports: {
    [baseSepolia.id]: http("https://sepolia.base.org"),
    [base.id]: http("https://mainnet.base.org")
  }
})

export const solanaWeb3JsAdapter = new SolanaAdapter()