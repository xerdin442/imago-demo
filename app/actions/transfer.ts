"use server";

import { apiAction } from "@/lib/api";

export async function processFundsTransfer(
  prevState: unknown,
  formData: FormData,
) {
  const username = formData.get("username");
  const amount = Number(formData.get("amount"));

  const result = await apiAction<{ message: string }>("/user/wallet/transfer", {
    method: "POST",
    body: { username, amount },
  });

  return result;
}
