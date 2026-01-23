import { type Dictionary, t } from "intlayer";

const createPostDialogContent = {
	key: "create-post",
	content: {
		checkout: {
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
		post: {
			tab: t({
				"zh-TW": "發文",
				en: "Post",
			}),
			placeholder: t({
				"zh-TW": "有什麼新鮮事？",
				en: "What's happening?",
			}),
			submit: t({
				"zh-TW": "發佈",
				en: "Post",
			}),
			toasts: {
				maxImages: t({
					"zh-TW": "最多只能上傳 5 張圖片",
					en: "You can only upload up to 5 images",
				}),
				sizeLimit: t({
					"zh-TW": "圖片大小超過 5MB 限制",
					en: "Image exceeds 5MB limit",
				}),
				empty: t({
					"zh-TW": "貼文內容不能為空",
					en: "Post cannot be empty",
				}),
				tooLong: t({
					"zh-TW": "文字長度不能超過 200 字",
					en: "Text must be less than 200 characters",
				}),
				login: t({
					"zh-TW": "請先登入才能發文",
					en: "You must be logged in to post",
				}),
				success: t({
					"zh-TW": "貼文已發佈！",
					en: "Post created!",
				}),
				failed: t({
					"zh-TW": "發文失敗，請再試一次",
					en: "Failed to create post. Please try again",
				}),
			},
		},
	},
} satisfies Dictionary;

export default createPostDialogContent;
