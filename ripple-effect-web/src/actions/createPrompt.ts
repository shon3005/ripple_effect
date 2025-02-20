"use server";

import { revalidatePath } from "next/cache";

// TODO: figure out how to resolve type error with _previousState
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
    // TODO: figure out how to resolve unknown type error with e
  } catch (e: unknown) {
    console.log(e.message);
  }
  revalidatePath("/");
}
