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
  chain: string;
  createdAt: string;
}

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