import { createFileRoute } from "@tanstack/react-router";
import { CheckoutDialog } from "@/components/checkout-dialog";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	return <CheckoutDialog />;
}
