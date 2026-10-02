"use server"

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface User {
  balance: number
  username: string
  profileImage: string
  firstName: string
  lastName: string
}

export async function getProfile(): Promise<User> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/");
  }

  try {
    const response = await fetch(`${process.env.BACKEND_API_URL}/user/profile`, {
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

    if (!response.ok) {
      redirect("/");
    }

    return data.user as User;
  } catch (error) {
    console.error("Profile fetch error:", error);
    redirect("/");
  }
}

export async function handleSocialAuth(socialAuth: string): Promise<User> {
  const cookieStore = await cookies();

  try {
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/auth/social/details?socialAuth=${socialAuth}`
    );
    const data = await response.json();

    if (!response.ok) {
      redirect("/");
    }

    cookieStore.set("token", data.details.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return await getProfile();
  } catch (error) {
    console.error("Social auth error:", error);
    redirect("/");
  }
}