import type { Tables } from "database.types";

export type Profile = Pick<Tables<"profiles">, "username" | "avatar_url">;

export type PostWithProfile = Tables<"posts"> & {
	profiles: Profile | null;
};
