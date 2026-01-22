import { formatDistanceToNow } from "date-fns";
import {
	Image as ImageIcon,
	Loader2,
	MoreHorizontal,
	Pencil,
	Trash2,
	X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { uuidv7 } from "uuidv7";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/components/user-context";
import { supabase } from "@/lib/supabase/client";
import type { PostWithProfile } from "./types";

interface PostItemProps {
	post: PostWithProfile;
	onUpdate: () => void;
	onDelete: () => void;
}

export function PostItem({ post, onUpdate, onDelete }: PostItemProps) {
	const { user } = useUser();
	const [isEditing, setIsEditing] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	// Edit state
	const [editContent, setEditContent] = useState(post.content);
	const [currentImages, setCurrentImages] = useState<string[]>(
		post.images || [],
	);
	const [newImages, setNewImages] = useState<{ id: string; file: File }[]>([]);
	const [isSaving, setIsSaving] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const isOwner = user?.id === post.user_id;

	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete this post?")) return;
		setIsDeleting(true);
		try {
			// Delete images from storage first
			if (post.images && post.images.length > 0) {
				const filesToRemove = post.images
					.map((url: string) => {
						const parts = url.split("/posts/");
						return parts.length > 1 ? parts[1] : null;
					})
					.filter((path): path is string => Boolean(path));

				if (filesToRemove.length > 0) {
					await supabase.storage.from("posts").remove(filesToRemove);
				}
			}

			const { error } = await supabase.from("posts").delete().eq("id", post.id);
			if (error) throw error;

			toast.success("Post deleted");
			onDelete();
		} catch (error) {
			console.error("Error deleting post:", error);
			toast.error("Failed to delete post");
		} finally {
			setIsDeleting(false);
		}
	};

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const files = Array.from(e.target.files);
			const totalImages =
				currentImages.length + newImages.length + files.length;

			if (totalImages > 5) {
				toast.error("Total images cannot exceed 5");
				return;
			}

			const validFiles = files.filter((file) => {
				if (file.size > 5 * 1024 * 1024) {
					toast.error(`Image ${file.name} exceeds 5MB`);
					return false;
				}
				return true;
			});

			setNewImages((prev) => [
				...prev,
				...validFiles.map((file) => ({ id: uuidv7(), file })),
			]);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	const handleSave = async () => {
		if (
			!editContent.trim() &&
			currentImages.length === 0 &&
			newImages.length === 0
		) {
			toast.error("Post cannot be empty");
			return;
		}

		setIsSaving(true);
		try {
			const finalImageUrls = [...currentImages];

			// Identify removed images to delete from storage
			if (post.images) {
				const removedImages = post.images.filter(
					(url: string) => !currentImages.includes(url),
				);
				if (removedImages.length > 0) {
					const filesToRemove = removedImages
						.map((url: string) => {
							const parts = url.split("/posts/");
							return parts.length > 1 ? parts[1] : null;
						})
						.filter((path): path is string => Boolean(path));
					await supabase.storage.from("posts").remove(filesToRemove);
				}
			}

			// Upload new images
			if (newImages.length > 0 && user) {
				for (const { file } of newImages) {
					const fileExt = file.name.split(".").pop();
					const fileName = `${user.id}/${uuidv7()}.${fileExt}`;

					const { error: uploadError } = await supabase.storage
						.from("posts")
						.upload(fileName, file);

					if (uploadError) throw uploadError;

					const {
						data: { publicUrl },
					} = supabase.storage.from("posts").getPublicUrl(fileName);

					finalImageUrls.push(publicUrl);
				}
			}

			const { error } = await supabase
				.from("posts")
				.update({
					content: editContent.trim(),
					images: finalImageUrls.length > 0 ? finalImageUrls : null,
					updated_at: new Date().toISOString(),
				})
				.eq("id", post.id);

			if (error) throw error;

			toast.success("Post updated");
			setIsEditing(false);
			setNewImages([]);
			onUpdate();
		} catch (error) {
			console.error("Error updating post:", error);
			toast.error("Failed to update post");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="border border-border/50 rounded-lg p-5 bg-card/50 hover:bg-card/80 transition-colors mb-4">
			<div className="flex gap-3">
				<Avatar className="w-10 h-10 border border-border">
					<AvatarImage src={post.profiles?.avatar_url || ""} />
					<AvatarFallback>
						{post.profiles?.username?.[0]?.toUpperCase() || "?"}
					</AvatarFallback>
				</Avatar>

				<div className="flex-1 min-w-0">
					<div className="flex justify-between items-start">
						<div>
							<div className="font-semibold text-foreground">
								{post.profiles?.username || "Unknown User"}
							</div>
							<div className="text-xs text-muted-foreground">
								{formatDistanceToNow(new Date(post.created_at), {
									addSuffix: true,
								})}
							</div>
						</div>

						{isOwner && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 -mr-2"
										disabled={isDeleting}
									>
										<MoreHorizontal className="w-4 h-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => setIsEditing(true)}>
										<Pencil className="w-4 h-4 mr-2" /> Edit
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={handleDelete}
										className="text-destructive focus:text-destructive"
									>
										<Trash2 className="w-4 h-4 mr-2" />{" "}
										{isDeleting ? "Deleting..." : "Delete"}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>

					<p className="mt-2 text-foreground whitespace-pre-wrap wrap-break-word">
						{post.content}
					</p>

					{post.images && post.images.length > 0 && (
						<div className="mt-3">
							{post.images.length === 1 ? (
								<div className="rounded-md overflow-hidden border border-border max-h-[400px] w-fit">
									<img
										src={post.images[0]}
										alt="Post attachment"
										className="max-w-full h-auto object-cover"
									/>
								</div>
							) : (
								<Carousel className="w-full max-w-[90%] mx-auto">
									<CarouselContent>
										{post.images.map((url: string, idx: number) => (
											<CarouselItem key={url}>
												<div className="p-1">
													<img
														src={url}
														alt={`Slide ${idx + 1}`}
														className="rounded-md object-cover w-full max-h-[400px]"
													/>
												</div>
											</CarouselItem>
										))}
									</CarouselContent>
									<CarouselPrevious />
									<CarouselNext />
								</Carousel>
							)}
						</div>
					)}
				</div>
			</div>

			<Dialog open={isEditing} onOpenChange={setIsEditing}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Edit Post</DialogTitle>
					</DialogHeader>

					<div className="py-4 space-y-4">
						<textarea
							className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
							value={editContent}
							onChange={(e) => setEditContent(e.target.value)}
							maxLength={200}
						/>

						<div className="space-y-2">
							<div className="flex flex-wrap gap-2">
								{currentImages.map((url, idx) => (
									<div key={`curr-${url}`} className="relative w-20 h-20 group">
										<img
											src={url}
											alt="Current upload"
											className="w-full h-full object-cover rounded-md"
										/>
										<button
											type="button"
											onClick={() =>
												setCurrentImages((prev) =>
													prev.filter((_, i) => i !== idx),
												)
											}
											className="absolute -top-1 -right-1 p-0.5 bg-destructive rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
										>
											<X className="w-3 h-3" />
										</button>
									</div>
								))}
								{newImages.map(({ id, file }) => (
									<div key={id} className="relative w-20 h-20 group">
										<img
											src={URL.createObjectURL(file)}
											alt="New upload"
											className="w-full h-full object-cover rounded-md opacity-80"
										/>
										<button
											type="button"
											onClick={() =>
												setNewImages((prev) =>
													prev.filter((item) => item.id !== id),
												)
											}
											className="absolute -top-1 -right-1 p-0.5 bg-destructive rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
										>
											<X className="w-3 h-3" />
										</button>
									</div>
								))}

								{currentImages.length + newImages.length < 5 && (
									<Button
										variant="outline"
										className="w-20 h-20 flex flex-col items-center justify-center p-0"
										onClick={() => fileInputRef.current?.click()}
									>
										<ImageIcon className="w-6 h-6 mb-1 text-muted-foreground" />
										<span className="text-[10px] text-muted-foreground">
											Add
										</span>
									</Button>
								)}
							</div>
							<input
								type="file"
								ref={fileInputRef}
								className="hidden"
								accept="image/*"
								multiple
								onChange={handleImageSelect}
							/>
						</div>

						<div className="text-xs text-end text-muted-foreground">
							{editContent.length}/200
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setIsEditing(false)}>
							Cancel
						</Button>
						<Button onClick={handleSave} disabled={isSaving}>
							{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Save Changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
