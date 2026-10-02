"use server";

import { TransactionInfo, Transaction } from "@/lib/types";
import { randomUUID } from "crypto";
import { apiAction, apiFetchOrRedirect } from "@/lib/api";

export async function getTransactions(): Promise<Transaction[]> {
  const { transactions } = await apiFetchOrRedirect<{
    transactions: Transaction[];
  }>("/user/transactions");

  return transactions;
}

export async function processTransaction(
  info: TransactionInfo,
  action: "deposit" | "withdraw",
) {
  return apiAction(`/wallet/${action}`, {
    method: "POST",
    body: info,
    ...(action === "withdraw" && {
      headers: { "Idempotency-Key": randomUUID() },
    }),
  });
}
