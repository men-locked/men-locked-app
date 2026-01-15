import { AvatarImage } from "@radix-ui/react-avatar";
import { createFileRoute } from "@tanstack/react-router";
import type { Tables } from "database.types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { fetchEvents } from "@/lib/supabase/event";
import { fetchProfile } from "@/lib/supabase/profile";
import CalendarView from "./calendar-view";

export const Route = createFileRoute("/calendar/$user")({
	component: RouteComponent,
});

function RouteComponent() {
	const { user } = Route.useParams();

	const [events, setEvents] = useState<Tables<"events">[]>([]);
	const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
	useEffect(() => {
		if (!user) {
			return;
		}

		fetchEvents(user)
			.catch((error) => {
				toast.error(`無法取得資料：${error.message}`);
			})
			.then((data) => {
				setEvents(data || []);
			});
		fetchProfile(user)
			.catch((error) => {
				toast.error(`無法取得資料：${error.message}`);
			})
			.then((data) => {
				setProfile(data);
			});
	}, [user]);

	return (
		<div className="flex w-full max-w-7xl flex-col gap-4">
			<div className="flex items-center gap-4">
				<Avatar className="h-16 w-16 border-2 border-border">
					<AvatarImage
						src={profile?.avatar_url || undefined}
						alt={profile?.username}
					/>
					<AvatarFallback>
						{profile?.username.slice(0, 2).toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<div>
					<h1 className="text-3xl font-bold">{profile?.username}</h1>
				</div>
			</div>
			<CalendarView events={events} />
		</div>
	);
}
