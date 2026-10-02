"use server"

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function processFundsTransfer(prevState: unknown, formData: FormData) {
  const username = formData.get("username")
  const amount = Number(formData.get("amount"))

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/");
  }

  try {
    const response = await fetch(`${process.env.BACKEND_API_URL}/user/wallet/transfer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username, amount }),
    });

    const data = await response.json();

    if (response.status === 401) {
      cookieStore.delete("token");
      redirect("/");
    }

    if (!response.ok) {
      const errorMsg = typeof data.message === "string"
        ? data.message
        : data.message[0].charAt(0).toUpperCase() + data.message[0].slice(1);

      return { error: errorMsg };
    }

    revalidatePath("/home")

    return { message: data.message }
  } catch (error) {
    console.error("Funds transfer error:", error)
  }
}