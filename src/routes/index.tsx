import { createFileRoute } from "@tanstack/react-router";
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
			<PostList />
		</div>
	);
}
