import { createContext, useEffect, useRef, useState } from "react";
import { useLocale } from "react-intlayer";

declare global {
	interface Window {
		Translator: Translator;
		LanguageDetector: LanguageDetector;
	}
}

type TranslatorContextType = {
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

	return (
		<TranslatorContext.Provider value={{ isLoading }}>
			{children}
		</TranslatorContext.Provider>
	);
}
