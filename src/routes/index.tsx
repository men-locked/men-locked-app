import { createFileRoute } from "@tanstack/react-router";
import { CheckoutDialog } from "@/components/checkout-dialog";
import { useUser } from "@/components/user-context";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	const { user } = useUser();

	return user ? <CheckoutDialog /> : null;
}
