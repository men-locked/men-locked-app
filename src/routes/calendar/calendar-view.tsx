import type { Tables } from "database.types";
import {
	CalendarBody,
	CalendarDate,
	CalendarDatePicker,
	CalendarHeader,
	CalendarItem,
	CalendarMonthPicker,
	CalendarProvider,
	CalendarYearPicker,
	type Feature,
} from "@/components/ui/shadcn-io/calendar";
import { statuses } from "@/lib/constants";

export default function CalendarView({
	events,
}: {
	events: Tables<"events">[];
}) {
	const features: Feature[] = events.map((ev) => {
		const statusObj = statuses.find((s) => s.id === ev.status);
		return {
			id: ev.id,
			name: statusObj?.name || "Unknown",
			startAt: new Date(ev.created_at),
			endAt: new Date(ev.created_at),
			status: {
				id: statusObj?.id || "-1",
				name: statusObj?.name || "Unknown",
				color: statusObj?.color || "#808080",
			},
			imageUrl: ev.image_url || undefined,
		};
	});

	return (
		<CalendarProvider locale="zh-TW">
			<CalendarDate>
				<CalendarDatePicker>
					<CalendarYearPicker
						start={new Date().getFullYear() - 1}
						end={new Date().getFullYear() + 1}
					/>
					<CalendarMonthPicker />
				</CalendarDatePicker>
			</CalendarDate>
			<CalendarHeader />
			<CalendarBody features={features}>
				{({ feature }) => <CalendarItem feature={feature} key={feature.id} />}
			</CalendarBody>
		</CalendarProvider>
	);
}
