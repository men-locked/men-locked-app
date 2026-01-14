import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/auth/update-password")({
	component: RouteComponent,
});

function UpdatePasswordForm() {
	const form = useForm({
		defaultValues: {
			password: "",
		},
		onSubmit: async (values) => {
			const { error } = await supabase.auth.updateUser({
				password: values.value.password,
			});
			if (error) {
				toast.error(`更新密碼失敗：${error.message}`);
				return;
			}
			toast.success("密碼已更新");
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="flex flex-col gap-6"
		>
			<form.Field
				name="password"
				children={(field) => (
					<div className="grid gap-2">
						<Label htmlFor={field.name}>新密碼</Label>
						<Input
							id={field.name}
							type="password"
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							className="col-span-2 h-8"
						/>
					</div>
				)}
			/>
			<form.Subscribe
				selector={(state) => [state.canSubmit, state.isSubmitting]}
				children={([canSubmit, isSubmitting]) => (
					<Button type="submit" disabled={!canSubmit}>
						{isSubmitting ? "重設中..." : "重設密碼"}
					</Button>
				)}
			/>
		</form>
	);
}

function RouteComponent() {
	return (
		<div className="w-full max-w-sm">
			<Card className="flex flex-col gap-6">
				<CardHeader>
					<CardTitle className="text-2xl">重設密碼</CardTitle>
					<CardDescription></CardDescription>
				</CardHeader>
				<CardContent>
					<UpdatePasswordForm />
				</CardContent>
			</Card>
		</div>
	);
}
