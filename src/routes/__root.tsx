import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ThemeProvider } from "@/components/theme-provider";
import "./__root.css";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { FormDevtoolsPanel } from "@tanstack/react-form-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Locales } from "intlayer";
import { IntlayerProvider, useLocale } from "react-intlayer";
import Navigator from "@/components/navigator";
import { Toaster } from "@/components/ui/sonner";
import { UserProvider } from "@/components/user-context";

const RootLayout = () => {
	const { defaultLocale } = useLocale();

	return (
		<>
			<IntlayerProvider locale={defaultLocale}>
				<UserProvider>
					<ThemeProvider defaultTheme="dark">
						<Navigator />
						<main className="flex min-h-[calc(100vh-4rem)] w-full flex-col items-center p-6 md:p-10">
							<Outlet />
						</main>
						<Toaster />
					</ThemeProvider>
				</UserProvider>
			</IntlayerProvider>
			<TanStackDevtools
				plugins={[
					{
						name: "TanStack Router",
						render: <TanStackRouterDevtoolsPanel />,
						defaultOpen: false,
					},
					{
						name: "TanStack Form",
						render: <FormDevtoolsPanel />,
						defaultOpen: false,
					},
				]}
			/>
		</>
	);
};

export const Route = createRootRoute({ component: RootLayout });
