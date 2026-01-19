import { Loader2 } from "lucide-react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

declare global {
	interface Window {
		Translator: Translator;
		LanguageDetector: LanguageDetector;
	}
}

interface AICreateMonitor extends EventTarget {}

interface AITranslatorCreateOptionsOrFactoryOptions {
	sourceLanguage: string;
	targetLanguage: string;
	monitor?: (m: AICreateMonitor) => void;
}

type Locale = "zh-TW" | "en";

interface I18nContextType {
	locale: Locale;
	setLocale: (locale: Locale) => void;
	t: (text: string) => React.ReactNode;
	tString: (text: string) => string;
	isSupported: boolean;
	isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
	const [locale, setLocale] = useState<Locale>(() => {
		const saved = localStorage.getItem("locale");
		return (saved as Locale) || "zh-TW";
	});
	const [isSupported, setIsSupported] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const translatorRef = useRef<Translator | null>(null);
	const [translations, setTranslations] = useState<Map<string, string>>(
		new Map(),
	);
	const pendingTranslations = useRef<Set<string>>(new Set());

	useEffect(() => {
		const checkSupport = async () => {
			setIsSupported("Translator" in self && "LanguageDetector" in self);
		};
		checkSupport();
	}, []);

	useEffect(() => {
		localStorage.setItem("locale", locale);
		document.documentElement.lang = locale;

		const initTranslator = async () => {
			if (locale === "zh-TW") {
				translatorRef.current = null;
				return;
			}

			if (!isSupported) return;

			const options: AITranslatorCreateOptionsOrFactoryOptions = {
				sourceLanguage: "zh-TW",
				targetLanguage: locale,
			};

			// Check availability again before creating
			const availability = await Translator.availability(options);
			if (availability === "unavailable") return;

			if (availability === "downloadable") {
				options.monitor = (m: AICreateMonitor) => {
					m.addEventListener("downloadprogress", (e: Event) => {
						const progressEvent = e as unknown as {
							loaded: number;
							total: number;
						};
						console.log(
							`Downloaded ${(
								(progressEvent.loaded / progressEvent.total) * 100
							).toFixed(2)}%`,
						);
					});
				};
			}

			try {
				setIsLoading(true);
				const translator = await Translator.create(options);
				translatorRef.current = translator;
			} catch (error) {
				console.error("Failed to create translator:", error);
			} finally {
				setIsLoading(false);
			}
		};

		initTranslator();
	}, [locale, isSupported]);

	const translate = (text: string, returnString = false): React.ReactNode => {
		if (locale === "zh-TW") return text;
		if (!translatorRef.current) return text;

		const cached = translations.get(text);
		if (cached) return cached;

		if (pendingTranslations.current.has(text)) {
			return returnString ? (
				text
			) : (
				<Loader2 className="h-3 w-3 animate-spin inline" />
			);
		}

		pendingTranslations.current.add(text);
		setTranslations((prev) => new Map(prev)); // Force re-render to show spinner

		translatorRef.current
			.translate(text)
			.then((result) => {
				setTranslations((prev) => {
					const newMap = new Map(prev);
					newMap.set(text, result);
					return newMap;
				});
			})
			.catch((err) => {
				console.error(`Translation failed for "${text}":`, err);
			})
			.finally(() => {
				pendingTranslations.current.delete(text);
			});

		return returnString ? (
			text
		) : (
			<Loader2 className="h-3 w-3 animate-spin inline" />
		);
	};

	const t = (text: string) => translate(text, false);
	const tString = (text: string) => translate(text, true) as string;

	return (
		<I18nContext.Provider
			value={{ locale, setLocale, t, tString, isSupported, isLoading }}
		>
			{children}
		</I18nContext.Provider>
	);
}

export function useI18n() {
	const context = useContext(I18nContext);
	if (context === undefined) {
		throw new Error("useI18n must be used within an I18nProvider");
	}
	return context;
}
