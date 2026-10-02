function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const isTestnet =
  process.env.NEXT_PUBLIC_WALLET_CONNECTION_MODE === "testnet";

export const env = {
  appkitProjectId: requireEnv(
    "NEXT_PUBLIC_APPKIT_PROJECT_ID",
    process.env.NEXT_PUBLIC_APPKIT_PROJECT_ID
  ),
  appkitDomain: requireEnv(
    "NEXT_PUBLIC_APPKIT_DOMAIN",
    process.env.NEXT_PUBLIC_APPKIT_DOMAIN
  ),
  basePlatformWalletAddress: requireEnv(
    "NEXT_PUBLIC_BASE_PLATFORM_WALLET_ADDRESS",
    process.env.NEXT_PUBLIC_BASE_PLATFORM_WALLET_ADDRESS
  ),
  solanaPlatformWalletAddress: requireEnv(
    "NEXT_PUBLIC_SOLANA_PLATFORM_WALLET_ADDRESS",
    process.env.NEXT_PUBLIC_SOLANA_PLATFORM_WALLET_ADDRESS
  ),
  baseRpcUrl:
    process.env.NEXT_PUBLIC_BASE_RPC_URL ||
    (isTestnet ? "https://sepolia.base.org" : "https://mainnet.base.org"),
  solanaRpcUrl:
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
    (isTestnet
      ? "https://api.devnet.solana.com"
      : "https://api.mainnet-beta.solana.com"),
};
