import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useIntlayer } from "react-intlayer";
import { supabase } from "@/lib/supabase/client";
import { CreatePost } from "./create-post";
import { PostItem } from "./post-item";
import type { PostWithProfile } from "./types";

export function PostList() {
	const [posts, setPosts] = useState<PostWithProfile[]>([]);
	const [loading, setLoading] = useState(true);
	const content = useIntlayer("post-list");

	const fetchPosts = useCallback(async () => {
		try {
			const { data, error } = await supabase
				.from("posts")
				.select(`
					*,
					profiles (
						username,
						avatar_url
					)
				`)
				.is("deleted_at", null)
				.order("created_at", { ascending: false });

			if (error) throw error;
			setPosts(data as unknown as PostWithProfile[]);
		} catch (error) {
			console.error("Error fetching posts:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchPosts();
	}, [fetchPosts]);

	return (
		<div className="max-w-2xl mx-auto py-8 px-4">
			<CreatePost onPostCreated={fetchPosts} />

			{loading ? (
				<div className="flex justify-center p-8">
					<Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
				</div>
			) : (
				<div className="space-y-4">
					{posts.map((post) => (
						<PostItem
							key={post.id}
							post={post}
							onUpdate={fetchPosts}
							onDelete={fetchPosts}
						/>
					))}
					{posts.length === 0 && (
						<div className="text-center py-10 text-muted-foreground">
							{content.empty}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
