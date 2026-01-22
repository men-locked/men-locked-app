import { Image as ImageIcon, Loader2, Send, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { uuidv7 } from "uuidv7";
import { Button } from "@/components/ui/button";
import { useUser } from "@/components/user-context";
import { supabase } from "@/lib/supabase/client";

interface CreatePostProps {
	onPostCreated: () => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
	const { user } = useUser();
	const [content, setContent] = useState("");
	const [images, setImages] = useState<{ id: string; file: File }[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const newFiles = Array.from(e.target.files);

			if (images.length + newFiles.length > 5) {
				toast.error("You can only upload up to 5 images.");
				if (fileInputRef.current) fileInputRef.current.value = "";
				return;
			}

			const validFiles: { id: string; file: File }[] = [];
			for (const file of newFiles) {
				if (file.size > 5 * 1024 * 1024) {
					toast.error(`Image ${file.name} exceeds 5MB limit.`);
					continue;
				}
				validFiles.push({ id: uuidv7(), file });
			}

			setImages((prev) => [...prev, ...validFiles]);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	const removeImage = (id: string) => {
		setImages((prev) => prev.filter((img) => img.id !== id));
	};

	const handleSubmit = async () => {
		if (!content.trim() && images.length === 0) {
			toast.error("Post cannot be empty.");
			return;
		}

		if (content.length > 200) {
			toast.error("Text must be less than 200 characters.");
			return;
		}

		if (!user) {
			toast.error("You must be logged in to post.");
			return;
		}

		setIsSubmitting(true);

		try {
			const imageUrls: string[] = [];

			// Upload images
			if (images.length > 0) {
				for (const { file } of images) {
					const fileExt = file.name.split(".").pop();
					const fileName = `${user.id}/${uuidv7()}.${fileExt}`;

					const { error: uploadError } = await supabase.storage
						.from("posts")
						.upload(fileName, file);

					if (uploadError) {
						throw uploadError;
					}

					const {
						data: { publicUrl },
					} = supabase.storage.from("posts").getPublicUrl(fileName);

					imageUrls.push(publicUrl);
				}
			}

			// Create post
			const { error: insertError } = await supabase.from("posts").insert({
				content: content.trim(),
				user_id: user.id,
				images: imageUrls.length > 0 ? imageUrls : null,
			});

			if (insertError) throw insertError;

			toast.success("Post created!");
			setContent("");
			setImages([]);
			onPostCreated();
		} catch (error) {
			console.error("Error creating post:", error);
			toast.error("Failed to create post. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="border rounded-lg p-4 bg-card shadow-sm mb-6">
			<div className="flex gap-4">
				<textarea
					className="flex-1 bg-transparent resize-none outline-none min-h-[80px] text-foreground placeholder:text-muted-foreground"
					placeholder="What's happening?"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					maxLength={200}
				/>
			</div>

			{images.length > 0 && (
				<div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
					{images.map(({ id, file }, index) => (
						<div
							key={id}
							className="relative group aspect-square rounded-md overflow-hidden bg-muted"
						>
							<img
								src={URL.createObjectURL(file)}
								alt={`Preview ${index}`}
								className="w-full h-full object-cover"
							/>
							<button
								type="button"
								onClick={() => removeImage(id)}
								className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
							>
								<X className="w-4 h-4" />
							</button>
						</div>
					))}
				</div>
			)}

			<div className="flex justify-between items-center mt-4 pt-4 border-t">
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => fileInputRef.current?.click()}
						disabled={isSubmitting || images.length >= 5}
						className="text-primary hover:text-primary/80 hover:bg-primary/10"
					>
						<ImageIcon className="w-5 h-5" />
					</Button>
					<span className="text-xs text-muted-foreground w-12">
						{content.length}/200
					</span>

					<input
						type="file"
						ref={fileInputRef}
						className="hidden"
						accept="image/*"
						multiple
						onChange={handleImageSelect}
					/>
				</div>

				<Button
					onClick={handleSubmit}
					disabled={isSubmitting || (!content.trim() && images.length === 0)}
					className="rounded-full px-6 font-bold"
				>
					{isSubmitting ? (
						<Loader2 className="w-4 h-4 animate-spin" />
					) : (
						<>
							Post <Send className="w-3 h-3 ml-2" />
						</>
					)}
				</Button>
			</div>
		</div>
	);
}
