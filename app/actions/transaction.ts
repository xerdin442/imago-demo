"use server"

import { TransactionInfo, Transaction } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

export async function processTransaction(data: TransactionInfo, action: "deposit" | "withdraw") {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/");
  }

  try {
    const response = await fetch(`${process.env.BACKEND_API_URL}/wallet/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data)
    });

    if (response.status === 401) {
      cookieStore.delete("token");
      redirect("/");
    }

    revalidatePath("/home");

    return;
  } catch (error) {
    console.error("Deposit processing error:", error);
    redirect("/");
  }
}