import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatAmount = (amount: number): string => {
  return `$${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
};

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

export const formatUsername = (name: string) => {
  return name.length > 10 ? `@${name.slice(0, 8)}...` : `@${name}`;
};

export const getUsdcAddress = (caipAddress: string): string => {
  const chainId = caipAddress.slice(0, 2);

  switch (chainId) {
    case "eip155:8453":
      return "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
    case "eip155:84532":
      return "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    case "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp":
      return "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
    default:
      return "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
  }
};

export const ERC20_ABI = [
  {
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  }
];