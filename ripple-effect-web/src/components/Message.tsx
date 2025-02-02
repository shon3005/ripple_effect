'use client';
import { useEffect, useState } from 'react';

export default function Message() {
	const [message, setMessage] = useState<string>();
	useEffect(() => {
		async function fetchCompletion() {
			// TODO: ensure we refactor urls into config, determine whether client or server url

			// this is a client component to show incremental loading progress to the user
			// if this was a server component, the component would have to wait for all the data to load before sending it to the client
			const response = await fetch("http://localhost:8000/", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				}
			})
			if (!response.body) {
				throw new Error("No response body!");
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
				chunk.split("\n").forEach((line) => {
					aiResponse += line;
					setMessage(aiResponse);
				});
			}
		}
		fetchCompletion();
	}, [])

	return (
		<div>
			{message ? message : "Loading..."}
		</div>
	)
}
