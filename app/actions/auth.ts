"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiAction, isApiError } from "@/lib/api";

export async function redirectToGoogle() {
  const backendUrl = process.env.BACKEND_API_URL;
  const redirectUrl = process.env.GOOGLE_AUTH_REDIRECT_URL;

  if (!backendUrl || !redirectUrl) {
    throw new Error("Missing Auth Environment Variables");
  }

  const targetUrl = `${backendUrl}/auth/google?redirectUrl=${encodeURIComponent(redirectUrl)}`;
  redirect(targetUrl);
}

export async function handleCustomAuth(prevState: unknown, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  const result = await apiAction<{ token: string }>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });

  if (isApiError(result)) return result;

  const cookieStore = await cookies();
  cookieStore.set("token", result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  redirect("/home");
}
