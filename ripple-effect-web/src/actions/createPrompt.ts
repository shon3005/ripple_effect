"use server";

import { revalidatePath } from "next/cache";

// TODO: figure out how to resolve type error with _previousState
export async function createPrompt(_previousState, formData: FormData) {
  try {
    console.log(formData);
    const response = await fetch("http://host.docker.internal:8000/", {
      method: "POST",
      body: formData,
    });
    if (!response.body) {
      throw new Error("No response body!");
    }
    // TODO: figure out how to resolve unknown type error with e
  } catch (e: unknown) {
    console.log(e.message);
    return "An error occurred when creating prompt.";
  }
  revalidatePath("/");
}
