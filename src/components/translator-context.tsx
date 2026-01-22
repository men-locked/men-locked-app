import { t } from "intlayer";
import { createContext, useEffect, useRef, useState } from "react";
import { useLocale } from "react-intlayer";

declare global {
	interface Window {
		Translator: Translator;
		LanguageDetector: LanguageDetector;
	}
}

type TranslatorContextType = {
	tr: (s: string) => void;
	isLoading: boolean;
};

const TranslatorContext = createContext<TranslatorContextType | undefined>(
	undefined,
);

export function TranslatorProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const { locale } = useLocale();
	const [isSupported] = useState("Translator" in self);
	const [availability, setAvailability] = useState<Availability>("unavailable");
	const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const translatorRef = useRef<Translator | null>(null);

	useEffect(() => {
		const initTranslator = async () => {
			if (!isSupported) return;

			const options: TranslatorCreateOptions = {
				sourceLanguage: "zh-TW",
				targetLanguage: locale,
			};
			if (options.sourceLanguage === options.targetLanguage) return;

			setAvailability(await Translator.availability(options));
			switch (availability) {
				case "unavailable":
					return;
				case "downloadable":
				case "downloading":
					options.monitor = (m: CreateMonitor) => {
						m.addEventListener("downloadprogress", (e: Event) => {
							const progressEvent = e as unknown as {
								loaded: number;
								total: number;
							};
							const percentage =
								(progressEvent.loaded / progressEvent.total) * 100;
							setDownloadProgress(percentage);
							console.log(`Downloading Language Model: ${percentage}%`);
						});
					};
			}

			try {
				setIsLoading(true);
				translatorRef.current = await Translator.create(options);
			} catch (error) {
				console.error(`Failed to create Translator: ${error}`);
			} finally {
				setIsLoading(false);
				setDownloadProgress(null);
			}
		};

		initTranslator();
	}, [locale, availability, isSupported]);

	const translateTemplate = (translated: string, original: string) => (
		<>
			<p>{translated}</p>
			<p className="text-[0.8em] opacity-60 italic font-normal">{original}</p>
		</>
	);

	const tr = (s: string) => {
		return t({
			"zh-TW": s,
			en: async () => {
				const translator = translatorRef.current;
				if (!translator)
					return translateTemplate("Failed to initialize translator", s);

				const translated = await translator.translate(s);
				return translateTemplate(translated, s);
			},
		});
	};

	return (
		<TranslatorContext.Provider value={{ tr, isLoading }}>
			{children}
		</TranslatorContext.Provider>
	);
}
