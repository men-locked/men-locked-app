import { useState, useTransition } from "react";
import { useIntlayer } from "react-intlayer";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	ImageCrop,
	ImageCropApply,
	ImageCropContent,
	ImageCropReset,
} from "@/components/ui/shadcn-io/image-crop";
import { statuses } from "@/lib/constants";
import { createEvent } from "@/lib/supabase/event";
import { Spinner } from "./ui/spinner";
import { useUser } from "./user-context";

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

export function CheckoutDialog() {
	const content = useIntlayer("checkout-dialog");
	const { user } = useUser();
	const [open, setOpen] = useState(false);
	const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
	const [file, setFile] = useState<File | null>(null);
	const [croppedDataUrl, setCroppedDataUrl] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	if (!user) {
		return null;
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setFile(e.target.files[0]);
			setCroppedDataUrl(null); // Reset crop when new file selected
		}
	};

	const handleCreate = () => {
		if (!file || !croppedDataUrl) return;

		startTransition(async () => {
			try {
				const blob = dataURLtoBlob(croppedDataUrl);
				const formData = new FormData();

				if (!selectedStatus) throw new Error("missing required field 'status'");
				formData.append("status", selectedStatus);
				formData.append("image", blob, file.name);

				await createEvent(user, formData);
				setOpen(false);
				// Reset state
				setFile(null);
				setCroppedDataUrl(null);
				setSelectedStatus(undefined);
			} catch (error) {
				toast.error(`${content.failedMessage}${error}`);
			}
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>{content.trigger}</Button>
			</DialogTrigger>
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle>{content.title}</DialogTitle>
					<DialogDescription>{content.description}</DialogDescription>
				</DialogHeader>

				<div className="grid gap-6 py-4">
					<div className="grid gap-2">
						<Label>{content.status}</Label>
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
											content.statuses[
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
						<Label htmlFor="image">{content.photo}</Label>
						<Input
							id="image"
							type="file"
							accept="image/*"
							onChange={handleFileChange}
							capture="environment"
						/>
					</div>

					{file && !croppedDataUrl && (
						<div className="rounded-md border p-4">
							<ImageCrop file={file} aspect={1} onCrop={setCroppedDataUrl}>
								<div className="flex flex-col gap-4">
									<ImageCropContent />
									<div className="flex justify-center gap-2">
										<ImageCropApply>{content.imageCrop.crop}</ImageCropApply>
										<ImageCropReset>{content.imageCrop.reset}</ImageCropReset>
									</div>
								</div>
							</ImageCrop>
						</div>
					)}

					{croppedDataUrl && (
						<div className="grid gap-2">
							<Label>{content.imageCrop.preview}</Label>
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
								{content.imageCrop.recrop}
							</Button>
						</div>
					)}

					<Button
						onClick={handleCreate}
						disabled={!file || !croppedDataUrl || isPending}
					>
						{isPending && <Spinner />}
						{content.submit}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
