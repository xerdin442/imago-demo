"use server"

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache"

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

export async function getWagers(): Promise<Wager[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/");
  }

  try {
    const response = await fetch(`${process.env.BACKEND_API_URL}/user/wagers`, {
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

    return data.wagers as Wager[]
  } catch (error) {
    console.error("Wagers fetch error:", error);
    redirect("/");
  }
}

export async function handleWagerClaim(wagerId: number, action?: 'accept' | 'contest'): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/");
  }

  try {
    const response = await fetch(`${process.env.BACKEND_API_URL}/wagers/${wagerId}/claim/${action || ""}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      cookieStore.delete("token");
      redirect("/");
    }

    if (!response.ok) redirect("/");

    revalidatePath("/home");

    return;
  } catch (error) {
    console.error("Wager prize claim error:", error);
    redirect("/");
  }
}
