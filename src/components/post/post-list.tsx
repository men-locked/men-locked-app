import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useIntlayer } from "react-intlayer";
import { supabase } from "@/lib/supabase/client";
import { CreatePost } from "./create-post";
import { PostItem } from "./post-item";
import type { PostWithProfile } from "./types";

const PAGE_SIZE = 10;

export function PostList() {
	const [posts, setPosts] = useState<PostWithProfile[]>([]);
	const [page, setPage] = useState(0);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(true);
	const content = useIntlayer("post-list");

	const fetchPosts = useCallback(async (pageToFetch = 0) => {
		try {
			const from = pageToFetch * PAGE_SIZE;
			const to = from + PAGE_SIZE - 1;

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
				.order("created_at", { ascending: false })
				.range(from, to);

			if (error) throw error;

			const newPosts = data as unknown as PostWithProfile[];

			if (newPosts.length < PAGE_SIZE) {
				setHasMore(false);
			}

			if (pageToFetch === 0) {
				setPosts(newPosts);
			} else {
				setPosts((prev) => [...prev, ...newPosts]);
			}
			setPage(pageToFetch);
		} catch (error) {
			console.error("Error fetching posts:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	const handlePostCreated = () => {
		setHasMore(true);
		fetchPosts(0);
	};

	const handleDelete = (id: string) => {
		setPosts((prev) => prev.filter((p) => p.id !== id));
	};

	useEffect(() => {
		fetchPosts(0);
	}, [fetchPosts]);

	return (
		<div className="max-w-2xl mx-auto py-8 px-4">
			<CreatePost onPostCreated={handlePostCreated} />

			{loading && posts.length === 0 ? (
				<div className="flex justify-center p-8">
					<Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
				</div>
			) : (
				<InfiniteScroll
					dataLength={posts.length}
					next={() => fetchPosts(page + 1)}
					hasMore={hasMore}
					loader={
						<div className="flex justify-center p-4">
							<Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
							<span className="ml-2 text-sm text-muted-foreground">
								{content.loading}
							</span>
						</div>
					}
					endMessage={
						posts.length > 0 && (
							<div className="text-center py-4 text-muted-foreground text-sm">
								{content.end}
							</div>
						)
					}
					className="space-y-4"
				>
					{posts.map((post) => (
						<PostItem
							key={post.id}
							post={post}
							onUpdate={() => {}} // Could implement local update logic if needed
							onDelete={() => handleDelete(post.id)}
						/>
					))}
					{posts.length === 0 && (
						<div className="text-center py-10 text-muted-foreground">
							{content.empty}
						</div>
					)}
				</InfiniteScroll>
			)}
		</div>
	);
}
