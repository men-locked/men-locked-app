import type { User } from "@supabase/supabase-js";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Check, Copy, Link } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/components/user-context";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/calendar/")({
	async beforeLoad() {
		const {
			data: { session },
		} = await supabase.auth.getSession();
		if (!session) {
			throw redirect({ to: "/" });
		}
	},
	component: RouteComponent,
});

function ShareUrl({ user }: { user: User }) {
	const [copied, setCopied] = useState(false);

	const publicUrl = `${window.location.origin}/calendar/${user.id}`;

	const handleCopy = async () => {
		await navigator.clipboard.writeText(publicUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-2">
			<Link className="size-4 text-muted-foreground shrink-0" />
			<span className="text-sm text-muted-foreground truncate flex-1">
				{publicUrl}
			</span>
			<Button
				variant="ghost"
				size="icon-sm"
				onClick={handleCopy}
				title={copied ? "已複製" : "複製網址"}
			>
				{copied ? (
					<Check className="size-4 text-green-500" />
				) : (
					<Copy className="size-4" />
				)}
			</Button>
		</div>
	);
}

function RouteComponent() {
	const { user } = useUser();
	if (!user) {
		return null;
	}

	return (
		<div className="flex w-full max-w-7xl flex-col gap-4">
			<ShareUrl user={user} />
		</div>
	);
}
