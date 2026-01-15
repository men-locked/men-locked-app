import { AvatarImage } from "@radix-ui/react-avatar";
import { createFileRoute } from "@tanstack/react-router";
import type { Tables } from "database.types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase/client";
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

		const fetchEvents = async () => {
			const { data, error } = await supabase
				.from("events")
				.select("*")
				.eq("user_id", user);

			if (error) {
				toast.error(`無法取得記錄資料：${error.message}`);
				return;
			}

			setEvents(data || []);
		};
		const fetchProfile = async () => {
			const { data, error } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", user)
				.single();

			if (error) {
				toast.error(`無法取得用戶資料：${error.message}`);
				return;
			}

			setProfile(data);
		};

		fetchEvents();
		fetchProfile();
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
