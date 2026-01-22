import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useLocale } from "react-intlayer";

declare global {
	interface Window {
		Translator: Translator;
		LanguageDetector: LanguageDetector;
	}
}

type TranslatorContextType = {
	tr: (s: string) => Promise<string>;
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
	const [_downloadProgress, setDownloadProgress] = useState<number | null>(
		null,
	);
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

	const tr = async (s: string) => {
		if (!translatorRef.current) return s;
		return await translatorRef.current.translate(s);
	};

	return (
		<TranslatorContext.Provider value={{ tr, isLoading }}>
			{children}
			{/* {downloadProgress && downloadProgress < 100 && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
					<div className="w-full max-w-sm space-y-4 p-4 text-center">
						<div className="text-lg font-semibold">
							下載翻譯模型中...
							<span className="text-md text-muted-foreground truncate flex-1 block">
								Downloading Language Model...
							</span>
						</div>
						<Progress value={downloadProgress} className="w-full" />
						<div className="text-sm text-muted-foreground">
							{downloadProgress.toFixed(0)}%
						</div>
					</div>
				</div>
			)} */}
		</TranslatorContext.Provider>
	);
}

export function useTranslator() {
	const context = useContext(TranslatorContext);
	if (context === undefined) {
		throw new Error("useTranslator must be used within an TranslatorProvider");
	}
	return context;
}
