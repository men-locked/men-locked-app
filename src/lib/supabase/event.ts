import type { User } from "@supabase/supabase-js";
import type { Tables } from "database.types";
import { uuidv7 } from "uuidv7";
import { supabase } from "./client";

export const fetchEvents = async (
	user: string,
): Promise<Tables<"events">[]> => {
	const { data, error } = await supabase
		.from("events")
		.select("*")
		.eq("user_id", user);

	if (error) {
		throw error;
	}

	return data;
};

export const createEvent = async (user: User, formData: FormData) => {
	const status = formData.get("status") as string;
	const image = formData.get("image") as File;

	if (!status || !image) {
		throw new Error("Missing required fields");
	}

	const filename = `${user.id}/${uuidv7()}`;
	const { error: uploadError } = await supabase.storage
		.from("events")
		.upload(filename, image);

	if (uploadError) {
		throw new Error(`Failed to upload image: ${uploadError.message}`);
	}

	const {
		data: { publicUrl },
	} = supabase.storage.from("events").getPublicUrl(filename);

	const { error: insertError } = await supabase.from("events").insert({
		user_id: user.id,
		status,
		image_url: publicUrl,
	});

	if (insertError) {
		throw new Error(`Failed to create event: ${insertError.message}`);
	}
};
