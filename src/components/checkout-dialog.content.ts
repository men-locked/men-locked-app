import { type Dictionary, t } from "intlayer";

const checkoutDialogContent = {
	key: "checkout-dialog",
	content: {
		trigger: t({
			"zh-TW": "打卡",
			en: "Daily Verification",
		}),
		title: t({
			"zh-TW": "打卡",
			en: "Daily Verification",
		}),
		description: t({
			"zh-TW": "建立打卡記錄",
			en: "Submit daily verification",
		}),
		status: t({
			"zh-TW": "今日狀態",
			en: "Status",
		}),
		statuses: {
			no_cum: t({
				"zh-TW": "沒射",
				en: "No Cum",
			}),
			cum_in_cage: t({
				"zh-TW": "鎖射",
				en: "Cum in Cage",
			}),
			jerk_off: t({
				"zh-TW": "尻射",
				en: "Jerk Off",
			}),
			wet_dream: t({
				"zh-TW": "夢遺",
				en: "Wet Dream",
			}),
			runied_orgasm: t({
				"zh-TW": "邊緣寸止",
				en: "Runied Orgasm",
			}),
		},
		photo: t({
			"zh-TW": "照片",
			en: "Photo",
		}),
		imageCrop: {
			crop: t({
				"zh-TW": "裁切",
				en: "Crop",
			}),
			reset: t({
				"zh-TW": "重新操作",
				en: "Reset",
			}),
			preview: t({
				"zh-TW": "預覽",
				en: "Preview",
			}),
			recrop: t({
				"zh-TW": "重新裁切",
				en: "Crop Again",
			}),
		},
		submit: t({
			"zh-TW": "建立打卡",
			en: "Submit",
		}),
		failedMessage: t({
			"zh-TW": "打卡失敗：",
			en: "Failed to verify: ",
		}),
	},
} satisfies Dictionary;

export default checkoutDialogContent;
