"use server";

import { getErrorMessage } from "@/utils/getErrorMessage";

export async function createPrompt(message: string) {
  try {
    const response = await fetch("http://host.docker.internal:8000/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });
    if (!response.body) {
      throw new Error("No response body!");
    }
    const reader = response.body.getReader();
    return { reader };
  } catch (e: unknown) {
    return {
      error: getErrorMessage(e),
    };
  }
}
