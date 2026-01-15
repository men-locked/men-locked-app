import type { Session, User } from "@supabase/supabase-js";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { supabase } from "@/lib/supabase/client";
import { fetchProfile } from "@/lib/supabase/profile";

interface UserContextType {
	user: User | null;
	profile: Profile | null;
	setProfile: (profile: Profile) => void;
	session: Session | null;
	isLoading: boolean;
	signOut: () => Promise<void>;
}

interface Profile {
	avatar_url: string;
	username: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [profile, setProfile] = useState<Profile | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			setSession(session);
			setUser(session?.user ?? null);
			setIsLoading(false);
		};

		fetchSession();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			setUser(session?.user ?? null);
			setIsLoading(false);
		});

		return () => subscription.unsubscribe();
	}, []);

	useEffect(() => {
		if (!user) {
			setProfile(null);
			return;
		}

		fetchProfile(user.id)
			.catch((error) => {
				console.error(`Failed to fetch user profile: ${error}`);
			})
			.then((data) => {
				setProfile(data);
			});
	}, [user]);

	const signOut = async () => {
		await supabase.auth.signOut();
	};

	const value = {
		user,
		profile,
		setProfile,
		session,
		isLoading,
		signOut,
	};

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
}
