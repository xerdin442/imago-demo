"use server";

import { Wager, WagerAction } from "@/lib/types";
import { apiAction, apiFetchOrRedirect, isApiError } from "@/lib/api";

export async function getWagers(): Promise<Wager[]> {
  const { wagers } = await apiFetchOrRedirect<{ wagers: Wager[] }>(
    "/user/wagers",
  );

  return wagers;
}

export async function createWager(prevState: unknown, formData: FormData) {
  const result = await apiAction("/wagers/create", {
    method: "POST",
    body: {
      title: formData.get("title"),
      stake: Number(formData.get("stake")),
      category: formData.get("category"),
      conditions: formData.get("conditions"),
    },
  });

  if (isApiError(result)) return result;

  return { message: "Wager created successfully!" };
}

export async function handleWagerClaim(
  wagerId: number,
  action?: WagerAction,
): Promise<void> {
  await apiFetchOrRedirect(`/wagers/${wagerId}/claim/${action || ""}`, {
    method: "POST",
  });
}

export async function exploreWagers(
  inviteCode: string,
): Promise<Wager | { error: string }> {
  const result = await apiAction<{ wager: Wager }>("/wagers/invite", {
    method: "POST",
    body: { inviteCode },
  });

  if (isApiError(result)) return result;

  return result.wager;
}

export async function handleJoinWager(
  wagerId: number,
): Promise<{ error?: string; message?: string }> {
  return apiAction<{ message: string }>(`/wagers/${wagerId}/join`, {
    method: "POST",
  });
}
