import { type Dictionary, t } from "intlayer";

const themeToggleContent = {
	content: {
		light: t({
			"zh-TW": "亮色介面",
			en: "Light",
		}),
		dark: t({
			"zh-TW": "暗色介面",
			en: "Dark",
		}),
		system: t({
			"zh-TW": "系統預設",
			en: "System",
		}),
	},
	key: "theme-toggle",
} satisfies Dictionary;

export default themeToggleContent;
