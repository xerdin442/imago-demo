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