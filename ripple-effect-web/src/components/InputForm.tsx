"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useCompletionContext } from "@/contexts/completion-context";

export default function UserInputForm() {
	const { setCompletion, setGraphCompletion, } = useCompletionContext();

	async function fetchCompletion(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const input = form.elements[0] as HTMLInputElement;
		// TODO: ensure we refactor urls into config, create client side action

		// this is a client component to show incremental loading progress to the user
		const response = await fetch("http://localhost:8000", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ message: input.value }),
		})
		if (!response.body) {
			return;
			// throw new Error("No response body!");
		}
		const reader = response.body.getReader()
		const decoder = new TextDecoder();
		// let aiResponse = "";
		// Read and process chunks of data
		while (true) {
			const { done, value } = await reader.read()
			if (done) break

			// Process the chunk of data
			const chunk = decoder.decode(value, { stream: true });
			setCompletion(chunk)
			setGraphCompletion(chunk)
		}
	}

	return (
		<section className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
			<form
				onSubmit={fetchCompletion}
				className="space-y-6"
			>
				{/* Message Input and File Upload (inline) */}
				<div>
					<Label htmlFor="message" className="mb-2 block text-sm font-medium text-gray-700">
						Your Message
					</Label>
					<div className="flex items-center space-x-4">
						{/* Text Input */}
						<Input
							id="message"
							name="message"
							type="text"
							placeholder="Type your message here..."
							className="flex-1"
						/>

						{/* File Upload styled as a button, not used for now */}
						{/* <Button disabled={isPending}>
							{isPending ?
								<Loader2 className="animate-spin" /> :
								<label htmlFor="file" className="cursor-pointer">
									Upload File
								</label>
							}
						</Button> */}
						{/* Hidden file input */}
						{/* <input id="file" name="file" type="file" className="hidden" /> */}
					</div>
				</div>

				{/* Submit button */}
				<Button type="submit" className="w-full">
					Submit
				</Button>
			</form>
		</section>
	);
}

