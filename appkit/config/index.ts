import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base, baseSepolia, solana, solanaDevnet } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'

export const projectId = process.env.NEXT_PUBLIC_APPKIT_PROJECT_ID as string
if (!projectId) throw new Error('Project ID is not defined')

export const baseNetworks = [base, baseSepolia] as [AppKitNetwork, ...AppKitNetwork[]]
export const solanaNetworks = [solana, solanaDevnet] as [AppKitNetwork, ...AppKitNetwork[]]

export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks: baseNetworks
})

export const solanaWeb3JsAdapter = new SolanaAdapter()