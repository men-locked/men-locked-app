import ReactGA from "react-ga4";

export const initGA = () => {
	const gaId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;
	if (gaId) {
		ReactGA.initialize(gaId);
	} else {
		console.warn("Google Analytics ID is missing in environment variables.");
	}
};

export const logPageView = (path: string) => {
	ReactGA.send({ hitType: "pageview", page: path });
};
