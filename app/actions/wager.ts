"use server"

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache"
import { Wager, WagerAction } from "@/lib/types";

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

export async function handleWagerClaim(wagerId: number, action?: WagerAction): Promise<void> {
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

export async function exploreWagers(inviteCode: string): Promise<Wager | { error: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/");
  }

  try {
    const response = await fetch(`${process.env.BACKEND_API_URL}/wagers/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ inviteCode })
    });

    const data = await response.json();

    if (response.status === 401) {
      cookieStore.delete("token");
      redirect("/");
    }

    if (!response.ok) {
      return { error: data.message };
    };

    return data.wager;
  } catch (error) {
    console.error("Wager search error:", error);
    redirect("/");
  }
}

export async function handleJoinWager(wagerId: number): Promise<{ error?: string; message?: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/");
  }

  try {
    const response = await fetch(`${process.env.BACKEND_API_URL}/wagers/${wagerId}/join`, {
      method: "POST",
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

    if (!response.ok) {
      return { error: data.message };
    };

    revalidatePath("/home");

    return { message: data.message };
  } catch (error) {
    console.error("Join wager error:", error);
    redirect("/");
  }
}