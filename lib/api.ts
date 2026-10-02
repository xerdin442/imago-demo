import "server-only";

import { cookies } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import type { ApiErrorResult } from "./types";

export { isApiError } from "./types";

export interface ApiOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
}

function formatErrorMessage(message: unknown): string {
  if (typeof message === "string") return message;

  if (Array.isArray(message) && message.length > 0) {
    const first = String(message[0]);
    return first.charAt(0).toUpperCase() + first.slice(1);
  }

  return "An unknown error occurred. Please try again";
}

export async function apiFetch<T>(
  path: string,
  { method = "GET", body, headers, auth = true }: ApiOptions = {},
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (auth && !token) {
    redirect("/");
  }

  let response: Response;
  try {
    response = await fetch(`${process.env.BACKEND_API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      ...(body !== undefined && { body: JSON.stringify(body) }),
    });
  } catch (error) {
    console.error(`API request failed: ${method} ${path}`, error);
    throw new Error("An unknown error occurred. Please try again");
  }

  if (response.status === 401) {
    cookieStore.delete("token");
    redirect("/");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(formatErrorMessage(data.message));
  }

  return data as T;
}

export async function apiAction<T>(
  path: string,
  options?: ApiOptions,
): Promise<T | ApiErrorResult> {
  try {
    return await apiFetch<T>(path, options);
  } catch (error) {
    unstable_rethrow(error);

    return {
      error:
        error instanceof Error
          ? error.message
          : "An unknown error occurred. Please try again",
    };
  }
}

export async function apiFetchOrRedirect<T>(
  path: string,
  options?: ApiOptions,
): Promise<T> {
  try {
    return await apiFetch<T>(path, options);
  } catch (error) {
    unstable_rethrow(error);
    console.error(`Request to ${path} failed, redirecting to login:`, error);
    redirect("/");
  }
}
