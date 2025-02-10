'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPrompt } from "@/actions/createPrompt";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";

export default function UserInputForm() {
	const [error, action, isPending] = useActionState(createPrompt, null);
	return (
		<section className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
			<form
				action={action}
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
							disabled={isPending}
						/>

						{/* File Upload styled as a button */}
						<Button disabled={isPending}>
							{isPending ?
								<Loader2 className="animate-spin" /> :
								<label htmlFor="file" className="cursor-pointer">
									Upload File
								</label>
							}
						</Button>
						{/* Hidden file input */}
						<input id="file" name="file" type="file" className="hidden" />
					</div>
				</div>

				{/* Submit button */}
				<Button type="submit" disabled={isPending} className="w-full">
					Submit
				</Button>
				{isPending && <p>Loading...</p>}
				{error && <p>{error}</p>}
			</form>
		</section>
	);
}

