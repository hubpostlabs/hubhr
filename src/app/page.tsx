import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/auth/login");
	}

	// Always redirect to onboarding so user can see list or create new
	redirect("/organization");

	return null; // Should not reach here
}
