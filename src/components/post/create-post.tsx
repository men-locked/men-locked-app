import { Image as ImageIcon, Loader2, Send, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { useIntlayer } from "react-intlayer";
import { toast } from "sonner";
import { uuidv7 } from "uuidv7";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	ImageCrop,
	ImageCropApply,
	ImageCropContent,
	ImageCropReset,
} from "@/components/ui/shadcn-io/image-crop";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/components/user-context";
import { statuses } from "@/lib/constants";
import { supabase } from "@/lib/supabase/client";
import { createEvent } from "@/lib/supabase/event";

function dataURLtoBlob(dataurl: string) {
	const arr = dataurl.split(",");
	const mime = arr[0].match(/:(.*?);/)?.[1];
	const bstr = atob(arr[1]);
	let n = bstr.length;
	const u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new Blob([u8arr], { type: mime });
}

interface CreatePostProps {
	onPostCreated: () => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
	const { user } = useUser();
	const contentKeys = useIntlayer("create-post"); // Reuse checkout strings

	// Post Mode State
	const [content, setContent] = useState("");
	const [images, setImages] = useState<{ id: string; file: File }[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Checkout Mode State
	const [checkoutFile, setCheckoutFile] = useState<File | null>(null);
	const [croppedDataUrl, setCroppedDataUrl] = useState<string | null>(null);
	const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
	const [isCheckoutPending, startCheckoutTransition] = useTransition();
	// Checkout Handlers
	const handleCheckoutFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setCheckoutFile(e.target.files[0]);
			setCroppedDataUrl(null);
		}
	};

	const handleCheckoutCreate = () => {
		if (!checkoutFile || !croppedDataUrl || !user) return;

		startCheckoutTransition(async () => {
			try {
				const blob = dataURLtoBlob(croppedDataUrl);
				const formData = new FormData();

				if (!selectedStatus) throw new Error("missing required field 'status'");
				formData.append("status", selectedStatus);
				formData.append("image", blob, checkoutFile.name);

				await createEvent(user, formData);

				// Reset state
				setCheckoutFile(null);
				setCroppedDataUrl(null);
				setSelectedStatus(undefined);
				toast.success("Check-in created successfully!");
				onPostCreated(); // Refresh list if needed (though check-ins might be separate)
			} catch (error) {
				toast.error(`${contentKeys.checkout.failedMessage}${error}`);
			}
		});
	};

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const newFiles = Array.from(e.target.files);

			if (images.length + newFiles.length > 5) {
				toast.error(contentKeys.post.toasts.maxImages);
				if (fileInputRef.current) fileInputRef.current.value = "";
				return;
			}

			const validFiles: { id: string; file: File }[] = [];
			for (const file of newFiles) {
				if (file.size > 5 * 1024 * 1024) {
					toast.error(`${contentKeys.post.toasts.sizeLimit}: ${file.name}`);
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
			toast.error(contentKeys.post.toasts.empty);
			return;
		}

		if (content.length > 200) {
			toast.error(contentKeys.post.toasts.tooLong);
			return;
		}

		if (!user) {
			toast.error(contentKeys.post.toasts.login);
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

			toast.success(contentKeys.post.toasts.success);
			setContent("");
			setImages([]);
			onPostCreated();
		} catch (error) {
			console.error("Error creating post:", error);
			toast.error(contentKeys.post.toasts.failed);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="border rounded-lg p-4 bg-card shadow-sm mb-6">
			<Tabs defaultValue="post" className="w-full">
				<TabsList className="grid w-full grid-cols-2 mb-4">
					<TabsTrigger value="post">{contentKeys.post.tab}</TabsTrigger>
					<TabsTrigger value="checkout">
						{contentKeys.checkout.title}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="post">
					<div className="flex gap-4">
						<textarea
							className="flex-1 bg-transparent resize-none outline-none min-h-[80px] text-foreground placeholder:text-muted-foreground"
							placeholder={contentKeys.post.placeholder.value}
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
							disabled={
								isSubmitting || (!content.trim() && images.length === 0)
							}
							className="rounded-full px-6 font-bold"
						>
							{isSubmitting ? (
								<Loader2 className="w-4 h-4 animate-spin" />
							) : (
								<>
									{contentKeys.post.submit} <Send className="w-3 h-3 ml-2" />
								</>
							)}
						</Button>
					</div>
				</TabsContent>

				<TabsContent value="checkout">
					<div className="grid gap-6 py-4">
						<div className="grid gap-2">
							<Label>{contentKeys.checkout.status}</Label>
							<RadioGroup
								value={selectedStatus}
								onValueChange={setSelectedStatus}
								className="flex flex-wrap gap-4"
							>
								{statuses.map((status) => (
									<div key={status.id} className="flex items-center space-x-2">
										<RadioGroupItem
											value={status.id}
											id={`status-${status.id}`}
										/>
										<Label
											htmlFor={`status-${status.id}`}
											style={{ color: status.color }}
										>
											{
												contentKeys.checkout.statuses[
													status.name as
														| "no_cum"
														| "cum_in_cage"
														| "jerk_off"
														| "wet_dream"
														| "runied_orgasm"
												]
											}
										</Label>
									</div>
								))}
							</RadioGroup>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="checkout-image">
								{contentKeys.checkout.photo}
							</Label>
							<Input
								id="checkout-image"
								type="file"
								accept="image/*"
								onChange={handleCheckoutFileChange}
								capture="environment"
							/>
						</div>

						{checkoutFile && !croppedDataUrl && (
							<div className="rounded-md border p-4">
								<ImageCrop
									file={checkoutFile}
									aspect={1}
									onCrop={setCroppedDataUrl}
								>
									<div className="flex flex-col gap-4">
										<ImageCropContent />
										<div className="flex justify-center gap-2">
											<ImageCropApply>
												{contentKeys.checkout.imageCrop.crop}
											</ImageCropApply>
											<ImageCropReset>
												{contentKeys.checkout.imageCrop.reset}
											</ImageCropReset>
										</div>
									</div>
								</ImageCrop>
							</div>
						)}

						{croppedDataUrl && (
							<div className="grid gap-2">
								<Label>{contentKeys.checkout.imageCrop.preview}</Label>
								<div className="relative aspect-square w-32 overflow-hidden rounded-md border">
									<img
										src={croppedDataUrl}
										alt="Preview"
										className="object-cover w-full h-full"
									/>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCroppedDataUrl(null)}
								>
									{contentKeys.checkout.imageCrop.recrop}
								</Button>
							</div>
						)}

						<Button
							onClick={handleCheckoutCreate}
							disabled={!checkoutFile || !croppedDataUrl || isCheckoutPending}
							className="w-full"
						>
							{isCheckoutPending && <Spinner />}
							{contentKeys.checkout.submit}
						</Button>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
