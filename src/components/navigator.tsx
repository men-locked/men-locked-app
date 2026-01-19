import type { User } from "@supabase/supabase-js";
import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import {
	Calendar,
	Languages,
	Loader2,
	LogOut,
	Upload,
	UserIcon,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/lib/supabase/client";
import { updateProfile } from "@/lib/supabase/profile";
import { cn } from "@/lib/utils";
import { useI18n } from "./i18n-context";
import { Skeleton } from "./ui/skeleton";
import { useUser } from "./user-context";

function ForgotPasswordDialog() {
	const [open, setOpen] = useState(false);
	const form = useForm({
		defaultValues: {
			email: "",
		},
		onSubmit: async (values) => {
			const { error } = await supabase.auth.resetPasswordForEmail(
				values.value.email,
				{ redirectTo: `${window.location.origin}/auth/update-password` },
			);
			if (error) {
				toast.error(`寄發密碼重設信件失敗：${error.message}`);
				return;
			}
			toast.success("密碼重設信件已寄出，請查收信箱");
			setOpen(false);
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
				忘記密碼？
			</DialogTrigger>
			<DialogContent>
				<DialogHeader className="flex flex-col gap-4">
					<DialogTitle>寄發密碼重設認證信</DialogTitle>
					<DialogDescription>
						為了保護您的帳號安全，我們將會寄發一封密碼重設認證到您的電子信箱，請依照信中的指示完成密碼重設流程。
					</DialogDescription>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="flex flex-col gap-4"
					>
						<form.Field
							name="email"
							children={(field) => (
								<>
									<Label htmlFor={field.name}>Email</Label>
									<Input
										id={field.name}
										type="email"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										className="col-span-2 h-8"
									/>
								</>
							)}
						/>
						<form.Subscribe
							selector={(state) => [state.canSubmit, state.isSubmitting]}
							children={([canSubmit, isSubmitting]) => (
								<Button type="submit" disabled={!canSubmit}>
									{isSubmitting ? "寄送中..." : "送出"}
								</Button>
							)}
						/>
					</form>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}

function RegisterDialog() {
	const [open, setOpen] = useState(false);
	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async (values) => {
			const { error } = await supabase.auth.signUp({
				email: values.value.email,
				password: values.value.password,
				options: {
					emailRedirectTo: `${window.location.origin}/`,
					data: {
						username: values.value.email.split("@")[0],
					},
				},
			});
			if (error) {
				toast.error(`註冊失敗：${error.message}`);
				return;
			}
			toast.success("註冊成功，請到電子郵件信相依指示啟用帳戶");
			setOpen(false);
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">註冊</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader className="flex flex-col gap-4">
					<DialogTitle>註冊新帳號</DialogTitle>
					<DialogDescription>
						請填寫您的電子郵件與密碼，完成註冊流程。
					</DialogDescription>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="flex flex-col gap-4"
					>
						<form.Field
							name="email"
							children={(field) => (
								<>
									<Label htmlFor={field.name}>Email</Label>
									<Input
										id={field.name}
										type="email"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										className="col-span-2 h-8"
									/>
								</>
							)}
						/>
						<form.Field
							name="password"
							children={(field) => (
								<>
									<Label htmlFor={field.name}>Password</Label>
									<Input
										id={field.name}
										type="password"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										className="col-span-2 h-8"
									/>
								</>
							)}
						/>
						<form.Subscribe
							selector={(state) => [state.canSubmit, state.isSubmitting]}
							children={([canSubmit, isSubmitting]) => (
								<Button type="submit" disabled={!canSubmit}>
									{isSubmitting ? "註冊中..." : "註冊"}
								</Button>
							)}
						/>
					</form>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}

function LoginButton() {
	const { t } = useI18n();
	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async (values) => {
			const { error } = await supabase.auth.signInWithPassword({
				email: values.value.email,
				password: values.value.password,
			});

			if (error) {
				toast.error(`登入失敗：${error.message}`);
			}
		},
	});

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="ghost">{t("登入")}</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80">
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="grid gap-4"
				>
					<div className="space-y-2">
						<h4 className="leading-none font-medium">{t("登入")}</h4>
						<p className="text-sm text-muted-foreground">
							{t("使用電子郵件與密碼登入")}
						</p>
					</div>
					<div className="grid gap-2">
						<form.Field
							name="email"
							children={(field) => (
								<>
									<Label htmlFor={field.name}>Email</Label>
									<Input
										id={field.name}
										type="email"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										className="col-span-2 h-8"
									/>
								</>
							)}
						/>
						<form.Field
							name="password"
							children={(field) => (
								<>
									<Label htmlFor={field.name}>Password</Label>
									<Input
										id={field.name}
										type="password"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										className="col-span-2 h-8"
									/>
								</>
							)}
						/>
					</div>
					<ForgotPasswordDialog />
					<div className="grid grid-cols-2 gap-2">
						<form.Subscribe
							selector={(state) => [state.canSubmit, state.isSubmitting]}
							children={([canSubmit, isSubmitting]) => (
								<>
									<Button type="submit" disabled={!canSubmit}>
										{isSubmitting ? "..." : t("登入")}
									</Button>
								</>
							)}
						/>
						<RegisterDialog />
					</div>
				</form>
			</PopoverContent>
		</Popover>
	);
}

function LanguageSelector() {
	const { locale, setLocale, isSupported } = useI18n();

	if (!isSupported) return null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon">
					<Languages className="h-[1.2rem] w-[1.2rem]" />
					<span className="sr-only">Toggle language</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					onClick={() => setLocale("zh-TW")}
					className={cn(locale === "zh-TW" && "bg-accent")}
				>
					正體中文
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => setLocale("en")}
					className={cn(locale === "en" && "bg-accent")}
				>
					English
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

interface Profile {
	username: string;
	avatar_url: string;
}

interface UserProfilePopoverProps {
	user: User;
	profile: Profile | null;
	setProfile: (profile: Profile) => void;
	signOut: () => Promise<void>;
}

function UserProfilePopover({
	user,
	profile,
	setProfile,
	signOut,
}: UserProfilePopoverProps) {
	const { t, tString } = useI18n();
	const [isOpen, setIsOpen] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [newUsername, setNewUsername] = useState("");
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		if (profile) {
			setNewUsername(profile.username);
		}
	}, [profile]);

	useEffect(() => {
		if (isOpen) {
			setSelectedFile(null);
			setPreviewUrl(null);
		}
	}, [isOpen]);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const file = e.target.files[0];
			setSelectedFile(file);
			setPreviewUrl(URL.createObjectURL(file));
		}
	};

	const handleSave = () => {
		startTransition(async () => {
			try {
				const formData = new FormData();
				formData.append("username", newUsername);

				if (selectedFile) {
					formData.append("avatar", selectedFile);
				}

				await updateProfile(user, formData);
				setIsOpen(false);

				// Optimistic update (optional but good for UX)
				if (profile) {
					setProfile({
						...profile,
						username: newUsername,
						avatar_url: previewUrl || profile.avatar_url,
					});
				}

				toast.success("已更新用戶資料");
			} catch (error) {
				toast.error(`更新用戶資料失敗：${error}`);
			}
		});
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button variant="ghost" className="relative h-8 w-8 rounded-full">
					<Avatar>
						<AvatarImage src={profile?.avatar_url ?? ""} alt="Avatar" />
						<AvatarFallback>
							{(profile?.username || user.email)?.substring(0, 2).toUpperCase()}
						</AvatarFallback>
					</Avatar>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80" align="end">
				<div className="grid gap-4">
					<div className="space-y-2">
						<h4 className="font-medium leading-none">{t("用戶資料")}</h4>
						<p className="text-sm text-muted-foreground">
							{t("更新您的個人資料")}
						</p>
					</div>

					{/* Avatar Section */}
					<div className="flex flex-col items-center gap-4">
						<div className="relative group">
							<div className="w-24 h-24 rounded-full overflow-hidden border bg-muted flex items-center justify-center relative">
								{previewUrl || profile?.avatar_url ? (
									<img
										src={previewUrl || profile?.avatar_url || ""}
										height={96}
										width={96}
										className="w-full h-full object-cover"
										alt="Avatar"
									/>
								) : (
									<UserIcon className="w-12 h-12 text-muted-foreground" />
								)}
								<label
									htmlFor="avatar-upload"
									className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
								>
									<Upload className="w-6 h-6 text-white" />
								</label>
							</div>
							<input
								id="avatar-upload"
								type="file"
								accept="image/*"
								className="hidden"
								onChange={handleFileSelect}
							/>
						</div>
					</div>

					{/* Username Section */}
					<div className="grid gap-2">
						<Label htmlFor="username">{t("用戶名稱")}</Label>
						<Input
							id="username"
							value={newUsername}
							onChange={(e) => setNewUsername(e.target.value)}
							placeholder={tString("用戶名稱")}
						/>
					</div>

					<div className="flex flex-col gap-2">
						<Button onClick={handleSave} disabled={isPending}>
							{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{t("儲存修改")}
						</Button>
						<Button
							variant="outline"
							onClick={signOut}
							className="text-destructive hover:text-destructive"
						>
							<LogOut className="mr-2 h-4 w-4" />
							{t("登出")}
						</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}

export default function Navigator({ className }: { className?: string }) {
	const { user, profile, setProfile, isLoading, signOut } = useUser();
	const { t } = useI18n();

	return (
		<header
			className={cn(
				"sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
				className,
			)}
		>
			<div className="container mx-auto flex h-16 items-center justify-between px-4">
				<div className="mr-4 flex items-center space-x-2 gap-8">
					<Link to="/" className="text-2xl font-bold text-primary">
						Men Locked
					</Link>
					{user && (
						<Link to="/calendar" className="flex items-center">
							<Calendar className="mr-2 h-4 w-4 inline-block" />
							{t("日曆")}
						</Link>
					)}
				</div>
				<div className="flex flex-1 items-center justify-center space-x-2 md:justify-end">
					<div className="w-full max-w-lg md:w-auto md:flex-none"></div>
					<nav className="flex items-center space-x-2">
						{isLoading ? (
							<Skeleton className="h-8 w-20" />
						) : user ? (
							<UserProfilePopover
								user={user}
								profile={profile}
								setProfile={setProfile}
								signOut={signOut}
							/>
						) : (
							<LoginButton />
						)}
						<LanguageSelector />
						<ThemeToggle />
					</nav>
				</div>
			</div>
		</header>
	);
}
