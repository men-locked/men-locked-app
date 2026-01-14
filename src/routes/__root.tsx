import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@/components/theme-provider";
import "./__root.css";
import Navigator from "@/components/navigator";

const RootLayout = () => (
	<>
		<ThemeProvider defaultTheme="dark">
			<Navigator />
			<Outlet />
		</ThemeProvider>
		<TanStackRouterDevtools />
	</>
);

export const Route = createRootRoute({ component: RootLayout });
