import { createContext, useContext, useEffect, useState } from "react";

type Locale = "zh-TW" | "en";

interface I18nContextType {
	locale: Locale;
	setLocale: (locale: Locale) => void;
	t: (key: string) => string;
}

const translations = {
	"zh-TW": {
		"nav.home": "首頁",
		"nav.calendar": "日曆",
		"nav.login": "登入",
		"nav.logout": "登出",
		"nav.profile": "用戶資料",
		"nav.updateProfile": "更新您的個人資料",
		"nav.username": "用戶名稱",
		"nav.save": "儲存修改",
		"nav.forgotPassword": "忘記密碼？",
		"nav.register": "註冊",
		"nav.email": "Email",
		"nav.password": "密碼",
		"nav.signInWithEmail": "使用電子郵件與密碼登入",
	},
	en: {
		"nav.home": "Home",
		"nav.calendar": "Calendar",
		"nav.login": "Login",
		"nav.logout": "Logout",
		"nav.profile": "Profile",
		"nav.updateProfile": "Update your profile",
		"nav.username": "Username",
		"nav.save": "Save Changes",
		"nav.forgotPassword": "Forgot password?",
		"nav.register": "Register",
		"nav.email": "Email",
		"nav.password": "Password",
		"nav.signInWithEmail": "Sign in with email and password",
	},
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
	const [locale, setLocale] = useState<Locale>(() => {
		const saved = localStorage.getItem("locale");
		return (saved as Locale) || "zh-TW";
	});

	useEffect(() => {
		localStorage.setItem("locale", locale);
		document.documentElement.lang = locale;
	}, [locale]);

	const t = (key: string) => {
		return (
			translations[locale][key as keyof (typeof translations)["en"]] || key
		);
	};

	return (
		<I18nContext.Provider value={{ locale, setLocale, t }}>
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
