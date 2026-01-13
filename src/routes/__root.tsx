import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@/components/theme-provider";

const RootLayout = () => (
	<>
		<ThemeProvider defaultTheme="dark">
			<Outlet />
		</ThemeProvider>
		<TanStackRouterDevtools />
	</>
);

export const Route = createRootRoute({ component: RootLayout });
