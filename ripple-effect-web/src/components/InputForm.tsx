'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { createPrompt } from "@/actions/createPrompt";
// import { useEffect, useActionState } from "react";
import React from "react";
import { useCompletionContext } from "@/contexts/completion-context";
// import { Loader2 } from "lucide-react";

export default function UserInputForm() {
	const { setCompletion, setGraphCompletion, } = useCompletionContext();
	// const [completion, action, isPending] = useActionState(createPrompt, null);
	async function fetchCompletion(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		// TODO: ensure we refactor urls into config, determine whether client or server url

		// this is a client component to show incremental loading progress to the user
		// if this was a server component, the component would have to wait for all the data to load before sending it to the client
		const response = await fetch("http://localhost:8000", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ message: e.target[0].value }),
		})
		if (!response.body) {
			return;
			// throw new Error("No response body!");
		}
		const reader = response.body.getReader()
		const decoder = new TextDecoder();
		let aiResponse = "";
		// Read and process chunks of data
		while (true) {
			const { done, value } = await reader.read()
			if (done) break

			// Process the chunk of data
			const chunk = decoder.decode(value, { stream: true });
			// Clean out unnecessary annotations from LLM
			chunk.split("\n").forEach((line) => {
				line = line.replace("\\n", "").replace("\r", "").replace("\\", "").replace("```", "").replace("json", "").trim().replace(/^"+|"+$/g, '');
				aiResponse += line.toString();
				setCompletion(aiResponse);
			});
		}
		// Format valid JSON
		aiResponse = aiResponse.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
		aiResponse = aiResponse.replace(/:\s*([^,\}\]\[]+)(?=[,\}\]])/g, function(match, p1) {
			// Trim the value.
			let trimmed = p1.trim();
			// If the value is already quoted, leave it.
			if (trimmed.startsWith('"') || trimmed.startsWith("'") || trimmed[0] === '[' || trimmed[0] === '{') {
				return ': ' + trimmed;
			}
			if (trimmed.endsWith('"')) {
				trimmed = trimmed.slice(0, -1).trim();
			}
			// Otherwise, wrap it in quotes.
			return ': "' + trimmed + '"';
		});
		setGraphCompletion(aiResponse);
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
				{/* {isPending && <p>Loading...</p>} */}
				{/* {error && <p>{error}</p>} */}
			</form>
		</section>
	);
}

