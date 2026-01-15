"use client";

import { getDay, getDaysInMonth, isSameDay } from "date-fns";
import { atom, useAtom } from "jotai";
import {
	Check,
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsUpDown,
} from "lucide-react";
import Image from "next/image";
import {
	createContext,
	memo,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type CalendarState = {
	month: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
	year: number;
};

const monthAtom = atom<CalendarState["month"]>(
	new Date().getMonth() as CalendarState["month"],
);
const yearAtom = atom<CalendarState["year"]>(new Date().getFullYear());

export const useCalendarMonth = () => useAtom(monthAtom);
export const useCalendarYear = () => useAtom(yearAtom);

type CalendarContextProps = {
	locale: Intl.LocalesArgument;
	startDay: number;
};

const CalendarContext = createContext<CalendarContextProps>({
	locale: "en-US",
	startDay: 0,
});

export type Status = {
	id: string;
	name: string;
	color: string;
};

export type Feature = {
	id: string;
	name: string;
	startAt: Date;
	endAt: Date;
	status: Status;
	imageUrl?: string;
};

type ComboboxProps = {
	value: string;
	setValue: (value: string) => void;
	data: {
		value: string;
		label: string;
	}[];
	labels: {
		button: string;
		empty: string;
		search: string;
	};
	className?: string;
};

export const monthsForLocale = (
	localeName: Intl.LocalesArgument,
	monthFormat: Intl.DateTimeFormatOptions["month"] = "long",
) => {
	const format = new Intl.DateTimeFormat(localeName, { month: monthFormat })
		.format;

	return [...new Array(12).keys()].map((m) =>
		format(new Date(Date.UTC(2021, m, 2))),
	);
};

export const daysForLocale = (
	locale: Intl.LocalesArgument,
	startDay: number,
) => {
	const weekdays: string[] = [];
	const baseDate = new Date(2024, 0, startDay);

	for (let i = 0; i < 7; i++) {
		weekdays.push(
			new Intl.DateTimeFormat(locale, { weekday: "short" }).format(baseDate),
		);
		baseDate.setDate(baseDate.getDate() + 1);
	}

	return weekdays;
};

const Combobox = ({
	value,
	setValue,
	data,
	labels,
	className,
}: ComboboxProps) => {
	const [open, setOpen] = useState(false);

	return (
		<Popover onOpenChange={setOpen} open={open}>
			<PopoverTrigger asChild>
				<Button
					aria-expanded={open}
					className={cn("w-40 justify-between capitalize", className)}
					variant="outline"
				>
					{value
						? data.find((item) => item.value === value)?.label
						: labels.button}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-40 p-0">
				<Command
					filter={(value, search) => {
						const label = data.find((item) => item.value === value)?.label;

						return label?.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
					}}
				>
					<CommandInput placeholder={labels.search} />
					<CommandList>
						<CommandEmpty>{labels.empty}</CommandEmpty>
						<CommandGroup>
							{data.map((item) => (
								<CommandItem
									className="capitalize"
									key={item.value}
									onSelect={(currentValue) => {
										setValue(currentValue === value ? "" : currentValue);
										setOpen(false);
									}}
									value={item.value}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											value === item.value ? "opacity-100" : "opacity-0",
										)}
									/>
									{item.label}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};

type OutOfBoundsDayProps = {
	day: number;
};

const OutOfBoundsDay = ({ day }: OutOfBoundsDayProps) => (
	<div className="relative h-full w-full bg-secondary p-1 text-muted-foreground text-xs">
		{day}
	</div>
);

export type CalendarBodyProps = {
	features: Feature[];
	children: (props: { feature: Feature }) => ReactNode;
};

export const CalendarBody = ({ features, children }: CalendarBodyProps) => {
	const [month] = useCalendarMonth();
	const [year] = useCalendarYear();
	const { startDay } = useContext(CalendarContext);
	const [selectedDay, setSelectedDay] = useState<number | null>(null);

	// Memoize expensive date calculations
	const currentMonthDate = useMemo(
		() => new Date(year, month, 1),
		[year, month],
	);
	const daysInMonth = useMemo(
		() => getDaysInMonth(currentMonthDate),
		[currentMonthDate],
	);
	const firstDay = useMemo(
		() => (getDay(currentMonthDate) - startDay + 7) % 7,
		[currentMonthDate, startDay],
	);

	// Memoize previous month calculations
	const prevMonthData = useMemo(() => {
		const prevMonth = month === 0 ? 11 : month - 1;
		const prevMonthYear = month === 0 ? year - 1 : year;
		const prevMonthDays = getDaysInMonth(new Date(prevMonthYear, prevMonth, 1));
		const prevMonthDaysArray = Array.from(
			{ length: prevMonthDays },
			(_, i) => i + 1,
		);
		return { prevMonthDays, prevMonthDaysArray };
	}, [month, year]);

	// Memoize next month calculations
	const nextMonthData = useMemo(() => {
		const nextMonth = month === 11 ? 0 : month + 1;
		const nextMonthYear = month === 11 ? year + 1 : year;
		const nextMonthDays = getDaysInMonth(new Date(nextMonthYear, nextMonth, 1));
		const nextMonthDaysArray = Array.from(
			{ length: nextMonthDays },
			(_, i) => i + 1,
		);
		return { nextMonthDaysArray };
	}, [month, year]);

	// Memoize features filtering by day to avoid recalculating on every render
	const featuresByDay = useMemo(() => {
		const result: { [day: number]: Feature[] } = {};
		for (let day = 1; day <= daysInMonth; day++) {
			const dayFeatures = features.filter((feature) => {
				return isSameDay(new Date(feature.endAt), new Date(year, month, day));
			});
			result[day] = dayFeatures.sort(
				(a, b) => a.startAt.getTime() - b.startAt.getTime(),
			);
		}
		return result;
	}, [features, daysInMonth, year, month]);

	const days: { content: ReactNode; borderColor?: string }[] = [];

	for (let i = 0; i < firstDay; i++) {
		const day =
			prevMonthData.prevMonthDaysArray[
				prevMonthData.prevMonthDays - firstDay + i
			];

		if (day) {
			days.push({
				content: <OutOfBoundsDay day={day} key={`prev-${i}`} />,
			});
		}
	}

	for (let day = 1; day <= daysInMonth; day++) {
		const featuresForDay = featuresByDay[day] || [];
		const lastFeature = featuresForDay[featuresForDay.length - 1];
		const coverImage = lastFeature?.imageUrl;

		// Find first non-zero status feature for border color
		const nonZeroFeature = featuresForDay.find((f) => f.status.id !== "0");
		const borderColor = nonZeroFeature?.status.color;

		days.push({
			borderColor,
			content: (
				<button
					type="button"
					className="relative flex h-full w-full flex-col gap-1 p-1 text-left text-muted-foreground text-xs cursor-pointer transition-all hover:bg-muted/50"
					key={day}
					onClick={() => {
						if (featuresForDay.length > 0) {
							setSelectedDay(day);
						}
					}}
				>
					{coverImage && (
						<Image
							src={coverImage}
							alt="Event image"
							fill
							className="object-cover opacity-80"
						/>
					)}
					<span className="z-10 relative font-medium">{day}</span>
				</button>
			),
		});
	}

	const remainingDays = 7 - ((firstDay + daysInMonth) % 7);
	if (remainingDays < 7) {
		for (let i = 0; i < remainingDays; i++) {
			const day = nextMonthData.nextMonthDaysArray[i];

			if (day) {
				days.push({
					content: <OutOfBoundsDay day={day} key={`next-${i}`} />,
				});
			}
		}
	}

	return (
		<>
			<div className="grid grow grid-cols-7">
				{days.map(({ content, borderColor }, index) => (
					<div
						className={cn(
							"relative aspect-square overflow-hidden border-2",
							index % 7 === 6 && "border-r-0",
							index % 7 === 0 && "border-l-0",
							index >= 28 && "border-b-0",
						)}
						style={{ borderColor }}
						// biome-ignore lint/suspicious/noArrayIndexKey: use index as key for date
						key={index}
					>
						{content}
					</div>
				))}
			</div>
			<Dialog
				open={selectedDay !== null}
				onOpenChange={(open) => !open && setSelectedDay(null)}
			>
				<DialogContent
					className="sm:max-w-xl p-0 overflow-hidden bg-transparent border-none shadow-none"
					showCloseButton={false}
				>
					<DialogTitle className="sr-only">Event Details</DialogTitle>
					<div className="relative w-full aspect-square">
						{selectedDay !== null && featuresByDay[selectedDay] && (
							<Carousel className="w-full h-full">
								<CarouselContent>
									{featuresByDay[selectedDay].map((feature) => (
										<CarouselItem
											key={feature.id}
											className="relative w-full h-full"
										>
											<div className="relative aspect-square w-full h-full rounded-lg overflow-hidden">
												{feature.imageUrl && (
													<Image
														src={feature.imageUrl}
														alt={feature.name}
														fill
														className="object-cover"
													/>
												)}
												<div className="absolute top-2 right-2 z-10">
													<Badge
														style={{
															backgroundColor: feature.status.color,
															color: "#000",
														}}
													>
														{feature.status.name}
													</Badge>
												</div>

												<div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/60 to-transparent">
													{/* Children might be the status text or other info passed down */}
													{children({ feature })}
												</div>
											</div>
										</CarouselItem>
									))}
								</CarouselContent>
								{featuresByDay[selectedDay].length > 1 && (
									<>
										<CarouselPrevious
											className="left-4 opacity-60 hover:opacity-90"
											style={{ backgroundColor: "black" }}
										/>
										<CarouselNext
											className="right-4 opacity-60 hover:opacity-90"
											style={{ backgroundColor: "black" }}
										/>
									</>
								)}
							</Carousel>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};

export type CalendarDatePickerProps = {
	className?: string;
	children: ReactNode;
};

export const CalendarDatePicker = ({
	className,
	children,
}: CalendarDatePickerProps) => (
	<div className={cn("flex items-center gap-1", className)}>{children}</div>
);

export type CalendarMonthPickerProps = {
	className?: string;
};

export const CalendarMonthPicker = ({
	className,
}: CalendarMonthPickerProps) => {
	const [month, setMonth] = useCalendarMonth();
	const { locale } = useContext(CalendarContext);

	// Memoize month data to avoid recalculating date formatting
	const monthData = useMemo(() => {
		return monthsForLocale(locale).map((month, index) => ({
			value: index.toString(),
			label: month,
		}));
	}, [locale]);

	return (
		<Combobox
			className={className}
			data={monthData}
			labels={{
				button: "Select month",
				empty: "No month found",
				search: "Search month",
			}}
			setValue={(value) => setMonth(Number(value) as CalendarState["month"])}
			value={month.toString()}
		/>
	);
};

export type CalendarYearPickerProps = {
	className?: string;
	start: number;
	end: number;
};

export const CalendarYearPicker = ({
	className,
	start,
	end,
}: CalendarYearPickerProps) => {
	const [year, setYear] = useCalendarYear();

	return (
		<Combobox
			className={className}
			data={Array.from({ length: end - start + 1 }, (_, i) => ({
				value: (start + i).toString(),
				label: (start + i).toString(),
			}))}
			labels={{
				button: "Select year",
				empty: "No year found",
				search: "Search year",
			}}
			setValue={(value) => setYear(Number(value))}
			value={year.toString()}
		/>
	);
};

export type CalendarDatePaginationProps = {
	className?: string;
};

export const CalendarDatePagination = ({
	className,
}: CalendarDatePaginationProps) => {
	const [month, setMonth] = useCalendarMonth();
	const [year, setYear] = useCalendarYear();

	const handlePreviousMonth = useCallback(() => {
		if (month === 0) {
			setMonth(11);
			setYear(year - 1);
		} else {
			setMonth((month - 1) as CalendarState["month"]);
		}
	}, [month, year, setMonth, setYear]);

	const handleNextMonth = useCallback(() => {
		if (month === 11) {
			setMonth(0);
			setYear(year + 1);
		} else {
			setMonth((month + 1) as CalendarState["month"]);
		}
	}, [month, year, setMonth, setYear]);

	return (
		<div className={cn("flex items-center gap-2", className)}>
			<Button onClick={handlePreviousMonth} size="icon" variant="ghost">
				<ChevronLeftIcon size={16} />
			</Button>
			<Button onClick={handleNextMonth} size="icon" variant="ghost">
				<ChevronRightIcon size={16} />
			</Button>
		</div>
	);
};

export type CalendarDateProps = {
	children: ReactNode;
};

export const CalendarDate = ({ children }: CalendarDateProps) => (
	<div className="flex items-center justify-between p-3">{children}</div>
);

export type CalendarHeaderProps = {
	className?: string;
};

export const CalendarHeader = ({ className }: CalendarHeaderProps) => {
	const { locale, startDay } = useContext(CalendarContext);

	// Memoize days data to avoid recalculating date formatting
	const daysData = useMemo(() => {
		return daysForLocale(locale, startDay);
	}, [locale, startDay]);

	return (
		<div className={cn("grid grow grid-cols-7", className)}>
			{daysData.map((day) => (
				<div className="p-3 text-right text-muted-foreground text-xs" key={day}>
					{day}
				</div>
			))}
		</div>
	);
};

export type CalendarItemProps = {
	feature?: Feature;
	className?: string;
};

export const CalendarItem = memo(({ className }: CalendarItemProps) => (
	<div
		className={cn(
			"flex w-[80%] items-center justify-center text-wrap",
			className,
		)}
	></div>
));

CalendarItem.displayName = "CalendarItem";

export type CalendarProviderProps = {
	locale?: Intl.LocalesArgument;
	startDay?: number;
	children: ReactNode;
	className?: string;
};

export const CalendarProvider = ({
	locale = "en-US",
	startDay = 0,
	children,
	className,
}: CalendarProviderProps) => (
	<CalendarContext.Provider value={{ locale, startDay }}>
		<div className={cn("relative flex flex-col", className)}>{children}</div>
	</CalendarContext.Provider>
);
