import { createFileRoute } from "@tanstack/react-router";
import { CheckoutDialog } from "@/components/checkout-dialog";
import { PostList } from "@/components/post/post-list";
import { useUser } from "@/components/user-context";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	const { user } = useUser();

	if (!user) return null;

	return (
		<div className="container max-w-2xl mx-auto p-4">
			<div className="mb-6 flex justify-end">
				<CheckoutDialog />
			</div>
			<PostList />
		</div>
	);
}
