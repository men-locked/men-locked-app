import { type Dictionary, t } from "intlayer";

const postListContent = {
	key: "post-list",
	content: {
		empty: t({
			"zh-TW": "目前沒有任何貼文。成為第一個分享的人吧！",
			en: "No posts yet. Be the first to share something!",
		}),
		loading: t({
			"zh-TW": "載入更多中...",
			en: "Loading more...",
		}),
		end: t({
			"zh-TW": "已經到底了",
			en: "You have reached the end",
		}),
	},
} satisfies Dictionary;

export default postListContent;
