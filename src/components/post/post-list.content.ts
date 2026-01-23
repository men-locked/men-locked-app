import { type Dictionary, t } from "intlayer";

const postListContent = {
	key: "post-list",
	content: {
		empty: t({
			"zh-TW": "目前沒有任何貼文。成為第一個分享的人吧！",
			en: "No posts yet. Be the first to share something!",
		}),
	},
} satisfies Dictionary;

export default postListContent;
