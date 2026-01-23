import { type Dictionary, t } from "intlayer";

const postItemContent = {
	key: "post-item",
	content: {
		unknownUser: t({
			"zh-TW": "未知使用者",
			en: "Unknown User",
		}),
		menu: {
			edit: t({
				"zh-TW": "編輯",
				en: "Edit",
			}),
			delete: t({
				"zh-TW": "刪除",
				en: "Delete",
			}),
			deleting: t({
				"zh-TW": "刪除中...",
				en: "Deleting...",
			}),
		},
		dialog: {
			edit: {
				title: t({
					"zh-TW": "編輯貼文",
					en: "Edit Post",
				}),
				add: t({
					"zh-TW": "新增",
					en: "Add",
				}),
				cancel: t({
					"zh-TW": "取消",
					en: "Cancel",
				}),
				save: t({
					"zh-TW": "儲存變更",
					en: "Save Changes",
				}),
			},
			delete: {
				title: t({
					"zh-TW": "您確定要這麼做嗎？",
					en: "Are you absolutely sure?",
				}),
				description: t({
					"zh-TW":
						"此動作無法還原。這將會永久刪除您的貼文並從伺服器移除相關資料。",
					en: "This action cannot be undone. This will permanently delete your post and remove the data from our servers.",
				}),
				cancel: t({
					"zh-TW": "取消",
					en: "Cancel",
				}),
				confirm: t({
					"zh-TW": "刪除",
					en: "Delete",
				}),
			},
		},
		toasts: {
			deleteSuccess: t({
				"zh-TW": "貼文已刪除",
				en: "Post deleted",
			}),
			deleteError: t({
				"zh-TW": "刪除貼文失敗",
				en: "Failed to delete post",
			}),
			updateEmpty: t({
				"zh-TW": "貼文內容不能為空",
				en: "Post cannot be empty",
			}),
			updateMaxImages: t({
				"zh-TW": "圖片總數不能超過 5 張",
				en: "Total images cannot exceed 5",
			}),
			updateImageSize: t({
				"zh-TW": "圖片超過 5MB 限制",
				en: "Image exceeds 5MB",
			}),
			updateSuccess: t({
				"zh-TW": "貼文已更新",
				en: "Post updated",
			}),
			updateError: t({
				"zh-TW": "更新貼文失敗",
				en: "Failed to update post",
			}),
		},
		translation: {
			translate: t({
				"zh-TW": "翻譯",
				en: "Translate",
			}),
			translating: t({
				"zh-TW": "翻譯中...",
				en: "Translating...",
			}),
			hide: t({
				"zh-TW": "隱藏翻譯",
				en: "Hide Translation",
			}),
			failed: t({
				"zh-TW": "翻譯失敗",
				en: "Translation Failed",
			}),
			label: t({
				"zh-TW": "由 AI 翻譯",
				en: "Translated by AI",
			}),
		},
	},
} satisfies Dictionary;

export default postItemContent;
