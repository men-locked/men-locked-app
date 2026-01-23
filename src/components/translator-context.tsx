import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useLocale } from "react-intlayer";

declare global {
	interface Window {
		Translator: Translator;
		LanguageDetector: LanguageDetector;
	}
}

type TranslatorContextType = {
	tr: (s: string, sourceLang?: string) => Promise<string | undefined>;
	detect: (s: string) => Promise<string | undefined>;
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

	const [_downloadProgress, setDownloadProgress] = useState<number | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(false);
	const translatorsRef = useRef<Map<string, Translator>>(new Map());
	const detectorRef = useRef<LanguageDetector | null>(null);

	useEffect(() => {
		const initDetector = async () => {
			if (!("LanguageDetector" in self)) return;

			const availability = await LanguageDetector.availability();
			if (availability === "unavailable") return;

			try {
				detectorRef.current = await LanguageDetector.create();
			} catch (error) {
				console.error(`Failed to create LanguageDetector: ${error}`);
			}
		};

		initDetector();
	}, []);

	const tr = async (s: string, sourceLang?: string) => {
		if (!sourceLang) {
			const detected = await detect(s);
			if (detected) {
				sourceLang = detected;
			} else {
				return s; // Fallback if detection fails
			}
		}

		if (sourceLang === locale) return s;

		// Check cache first
		if (translatorsRef.current.has(sourceLang)) {
			try {
				return await translatorsRef.current.get(sourceLang)?.translate(s);
			} catch (e) {
				console.error("Translation error with cached translator:", e);
				// If cached translator fails, maybe try recreating? For now, fall through.
			}
		}

		// Create new translator
		try {
			setIsLoading(true);
			const options: TranslatorCreateOptions = {
				sourceLanguage: sourceLang,
				targetLanguage: locale,
			};

			const availability = await Translator.availability(options);
			if (availability === "unavailable") return s;

			if (availability === "downloadable" || availability === "downloading") {
				options.monitor = (m: CreateMonitor) => {
					m.addEventListener("downloadprogress", (e: Event) => {
						const progressEvent = e as unknown as {
							loaded: number;
							total: number;
						};
						const percentage =
							(progressEvent.loaded / progressEvent.total) * 100;
						setDownloadProgress(percentage);
					});
				};
			}

			const translator = await Translator.create(options);
			translatorsRef.current.set(sourceLang, translator);
			return await translator.translate(s);
		} catch (error) {
			console.error(`Failed to create Translator for ${sourceLang}:`, error);
			return s;
		} finally {
			setIsLoading(false);
			setDownloadProgress(null);
		}
	};

	const detect = async (s: string) => {
		if (!detectorRef.current) return undefined;
		try {
			const results = await detectorRef.current.detect(s);
			if (results && results.length > 0) {
				return results[0].detectedLanguage;
			}
		} catch (error) {
			console.error("Error detecting language:", error);
		}
		return undefined;
	};

	return (
		<TranslatorContext.Provider value={{ tr, detect, isLoading }}>
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
