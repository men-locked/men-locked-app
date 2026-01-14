import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function LoginButton() {
	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: (values) => {
			console.log(values);
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
