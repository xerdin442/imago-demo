import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base, baseSepolia, solana, solanaDevnet } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { http } from 'wagmi'

export const projectId = process.env.NEXT_PUBLIC_APPKIT_PROJECT_ID as string
if (!projectId) throw new Error('Project ID is not defined');

const isTestnet = process.env.WALLET_CONNECTION_MODE === "testnet";
export const baseNetworks = [isTestnet ? baseSepolia : base] as [AppKitNetwork, ...AppKitNetwork[]]
export const solanaNetworks = [isTestnet ? solanaDevnet : solana] as [AppKitNetwork, ...AppKitNetwork[]]

export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks: baseNetworks,
  transports: {
    [isTestnet ? baseSepolia.id : base.id]: http(
      isTestnet ? "https://sepolia.base.org" : "https://mainnet.base.org"
    ),
  }
})

export const solanaWeb3JsAdapter = new SolanaAdapter()