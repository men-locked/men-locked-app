import type { User } from "@supabase/supabase-js";
import { uuidv7 } from "uuidv7";
import { supabase } from "./client";

export const fetchProfile = async (user: string) => {
	const { data, error } = await supabase
		.from("profiles")
		.select("*")
		.eq("id", user)
		.single();

	if (error) {
		throw error;
	}

	return data;
};

export const updateProfile = async (user: User, formData: FormData) => {
	const username = formData.get("username") as string | null;
	const avatarFile = formData.get("avatar") as File | null;

	const updates: { username?: string; avatar_url?: string } = {};

	if (username) {
		updates.username = username;
	}

	if (avatarFile && avatarFile.size > 0) {
		const filename = `${user.id}/${uuidv7()}`;
		const { error: uploadError } = await supabase.storage
			.from("avatars")
			.upload(filename, avatarFile, {
				upsert: true,
			});

		if (uploadError) {
			throw new Error(`Failed to upload avatar: ${uploadError.message}`);
		}

		const {
			data: { publicUrl },
		} = supabase.storage.from("avatars").getPublicUrl(filename);
		updates.avatar_url = publicUrl;
	}

	if (Object.keys(updates).length > 0) {
		const { error: userUpdateError } = await supabase.auth.updateUser({
			data: { username: updates.username },
		});

		if (userUpdateError) {
			throw new Error(`Failed to update user: ${userUpdateError.message}`);
		}

		const { error: profileUpdateError } = await supabase
			.from("profiles")
			.update(updates)
			.eq("id", user.id);

		if (profileUpdateError) {
			throw new Error(
				`Failed to update profile: ${profileUpdateError.message}`,
			);
		}
	}
};
