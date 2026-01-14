import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
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
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

function ForgotPasswordDialog() {
	const [open, setOpen] = useState(false);
	const form = useForm({
		defaultValues: {
			email: "",
		},
		onSubmit: async (values) => {
			const { error } = await supabase.auth.resetPasswordForEmail(
				values.value.email,
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
				<Button variant="ghost">登入</Button>
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
						<h4 className="leading-none font-medium">登入</h4>
						<p className="text-sm text-muted-foreground">
							使用電子郵件與密碼登入
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
										{isSubmitting ? "登入中..." : "登入"}
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

export default function Navigator({ className }: { className?: string }) {
	return (
		<header
			className={cn(
				"sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
				className,
			)}
		>
			<div className="container mx-auto flex h-16 items-center justify-between px-4">
				<div className="mr-4 flex items-center space-x-2">
					<Link to="/" className="text-2xl font-bold text-primary">
						Men Locked
					</Link>
				</div>
				<div className="flex flex-1 items-center justify-center space-x-2 md:justify-end">
					<div className="w-full max-w-lg md:w-auto md:flex-none"></div>
					<nav className="flex items-center space-x-2">
						<LoginButton />
						<ThemeToggle />
					</nav>
				</div>
			</div>
		</header>
	);
}
