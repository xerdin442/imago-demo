export interface PopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface User {
  id: number
  balance: number
  username: string
  profileImage: string
  firstName: string
  lastName: string
}

export interface Transaction {
  id: number;
  amount: number;
  txIdentifier?: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  type: "DEPOSIT" | "WITHDRAWAL";
  chain: Network;
  createdAt: string;
}

export type WagerAction = "accept" | "contest"

export interface Wager {
  id: number;
  title: string;
  category: string;
  amount: number;
  status: "PENDING" | "ACTIVE" | "DISPUTE" | "SETTLED";
  playerOne: number;
  playerTwo?: number;
  winner: number | null;
  inviteCode: string;
}

export type Network = "BASE" | "SOLANA"

export interface TransactionInfo {
  chain?: Network;
  amount?: number;
  depositor?: string;
  address?: string;
  txIdentifier?: string;
}

export interface ApiErrorResult {
  error: string;
}

export function isApiError(value: unknown): value is ApiErrorResult {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as Record<string, unknown>).error === "string"
  );
}