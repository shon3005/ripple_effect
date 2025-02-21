"use client";

import { useCompletionContext } from "@/contexts/completion-context";

export default function Message() {
	const { completion, } = useCompletionContext();

	return (
		<div>
			{completion}
		</div>
	)
}
