// This is a server component (no "use client" directive is present)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UserInputForm() {
	return (
		<section className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
			<form
				action="/api/upload" // Your API route to handle the submission
				method="POST"
				encType="multipart/form-data"
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

						{/* File Upload styled as a button */}
						<Button asChild>
							<label htmlFor="file" className="cursor-pointer">
								Upload File
							</label>
						</Button>
						{/* Hidden file input */}
						<input id="file" name="file" type="file" className="hidden" />
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

