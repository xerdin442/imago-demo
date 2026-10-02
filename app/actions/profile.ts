"use server";

import { User } from "@/lib/types";
import { cookies } from "next/headers";
import { apiFetchOrRedirect } from "@/lib/api";

export async function getProfile(id?: number): Promise<User> {
  const { user } = await apiFetchOrRedirect<{ user: User }>(
    `/user/${id ? id : "profile"}`,
  );

  return user;
}

export async function handleSocialAuth(socialAuth: string): Promise<User> {
  const { details } = await apiFetchOrRedirect<{ details: { token: string } }>(
    `/auth/social/details?socialAuth=${socialAuth}`,
    { auth: false },
  );

  const cookieStore = await cookies();
  cookieStore.set("token", details.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  return getProfile();
}
