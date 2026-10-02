import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base, baseSepolia, solana, solanaDevnet } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { http } from 'wagmi'
import { env, isTestnet } from '@/lib/env'

export const projectId = env.appkitProjectId
export const baseNetworks = [isTestnet ? baseSepolia : base] as [AppKitNetwork, ...AppKitNetwork[]]
export const solanaNetworks = [isTestnet ? solanaDevnet : solana] as [AppKitNetwork, ...AppKitNetwork[]]

export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks: baseNetworks,
  transports: {
    [isTestnet ? baseSepolia.id : base.id]: http(env.baseRpcUrl),
  }
})

export const solanaWeb3JsAdapter = new SolanaAdapter()