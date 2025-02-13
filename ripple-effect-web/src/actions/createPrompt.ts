"use server";

import { revalidatePath } from "next/cache";

// TODO: figure out how to resolve type error with _previousState
export async function createPrompt(
  _previousState: unknown,
  formData: FormData,
) {
  try {
    const response = await fetch("http://host.docker.internal:8000/", {
      method: "POST",
      body: formData,
    });
    if (!response.body) {
      throw new Error("No response body!");
    }
    return response;
    // TODO: figure out how to resolve unknown type error with e
  } catch (e: unknown) {
    console.log(e.message);
  }
  revalidatePath("/");
}
