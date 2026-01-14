import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@/components/theme-provider";
import "./__root.css";
import Navigator from "@/components/navigator";
import { Toaster } from "@/components/ui/sonner";

const RootLayout = () => (
	<>
		<ThemeProvider defaultTheme="dark">
			<Navigator />
			<Outlet />
			<Toaster />
		</ThemeProvider>
		<TanStackRouterDevtools />
	</>
);

export const Route = createRootRoute({ component: RootLayout });
