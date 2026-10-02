"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function redirectToGoogle() {
  const backendUrl = process.env.BACKEND_API_URL;
  const redirectUrl = process.env.GOOGLE_AUTH_REDIRECT_URL;

  if (!backendUrl || !redirectUrl) {
    throw new Error("Missing Auth Environment Variables");
  }

  // Redirect user to Google auth screen
  const targetUrl = `${backendUrl}/auth/google?redirectUrl=${encodeURIComponent(redirectUrl)}`;
  redirect(targetUrl);
}

export async function handleCustomAuth(prevState: unknown, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const response = await fetch(`${process.env.BACKEND_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = typeof data.message === "string"
        ? data.message
        : data.message[0].charAt(0).toUpperCase() + data.message[0].slice(1);

      return { error: errorMsg };
    }

    const cookieStore = await cookies();
    cookieStore.set("token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

  } catch (err) {
    console.error(err)
    return { error: "An unknown error occurred. Please try again." };
  }

  redirect("/home");
}