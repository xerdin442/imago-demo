"use server"

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface Transaction {
  id: number;
  amount: number;
  txIdentifier?: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  type: "DEPOSIT" | "WITHDRAWAL";
  chain: string;
  createdAt: string;
}

export async function getTransactions(): Promise<Transaction[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/");
  }

  try {
    const response = await fetch(`${process.env.BACKEND_API_URL}/user/transactions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.status === 401) {
      cookieStore.delete("token");
      redirect("/");
    }

    return data.transactions as Transaction[]
  } catch (error) {
    console.error("Transactions fetch error:", error);
    redirect("/");
  }
}