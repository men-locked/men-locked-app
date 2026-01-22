import { type Dictionary, t } from "intlayer";

const navigatorContent = {
	key: "navigator",
	content: {
		features: {
			calendar: t({
				"zh-TW": "日曆",
				en: "Calendar",
			}),
		},
		loginButton: {
			title: t({
				"zh-TW": "登入",
				en: "Login",
			}),
			description: t({
				"zh-TW": "使用電子郵件與密碼登入",
				en: "Login with Email and Password",
			}),
			email: t({
				"zh-TW": "Email",
				en: "E-mail Address",
			}),
			password: t({
				"zh-TW": "密碼",
				en: "Password",
			}),
			submit: t({
				"zh-TW": "登入",
				en: "Login",
			}),
			failedMessage: t({
				"zh-TW": "登入失敗：",
				en: "Login Failed: ",
			}),
		},
		forgotPasswordDialog: {
			trigger: t({
				"zh-TW": "忘記密碼？",
				en: "Forgot Passowrd?",
			}),
			title: t({
				"zh-TW": "寄發密碼重設認證信",
				en: "Send Password Reset Email",
			}),
			description: t({
				"zh-TW":
					"為了保護您的帳號安全，我們將會寄發一封密碼重設認證到您的電子信箱，請依照信中的指示完成密碼重設流程。",
				en: "We'll send a password reset mail to your email address. Please follow the instructions in the email to complete the password reset process.",
			}),
			email: t({
				"zh-TW": "Email",
				en: "E-mail Address",
			}),
			submit: t({
				"zh-TW": "寄出",
				en: "Submit",
			}),
			failedMessage: t({
				"zh-TW": "寄發密碼重設信件失敗：",
				en: "Failed to send password reset mail: ",
			}),
			successMessage: t({
				"zh-TW": "密碼重設信件已寄出，請依照信件中的流程繼續操作",
				en: "Sent password reset mail success",
			}),
		},
		registerDialog: {
			trigger: t({
				"zh-TW": "註冊",
				en: "Register",
			}),
			title: t({
				"zh-TW": "註冊新帳號",
				en: "Register",
			}),
			description: t({
				"zh-TW": "使用 Email 與密碼註冊",
				en: "Register with Email address and password.",
			}),
			email: t({
				"zh-TW": "Email",
				en: "E-mail Address",
			}),
			password: t({
				"zh-TW": "密碼",
				en: "Password",
			}),
			submit: t({
				"zh-TW": "註冊",
				en: "Register",
			}),
			failedMessage: t({
				"zh-TW": "註冊失敗：",
				en: "Register Failed: ",
			}),
			successMessage: t({
				"zh-TW": "註冊成功，請收取 Email 並依指示啟用帳號",
				en: "Register success, remember to active your account by email confirmation",
			}),
		},
		userProfilePopover: {
			title: t({
				"zh-TW": "個人資料",
				en: "User Profile",
			}),
			description: t({
				"zh-TW": "更新您的個人資料",
				en: "Update your profile",
			}),
			username: t({
				"zh-TW": "用戶名",
				en: "Username",
			}),
			submit: t({
				"zh-TW": "更新",
				en: "Update",
			}),
			logout: t({
				"zh-TW": "登出",
				en: "Logout",
			}),
			failedMessage: t({
				"zh-TW": "更新用戶資料失敗：",
				en: "Failed to update your profile: ",
			}),
			successMessage: t({
				"zh-TW": "已更新用戶資料",
				en: "Update your profile succes.",
			}),
		},
	},
} satisfies Dictionary;

export default navigatorContent;
