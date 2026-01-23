-- Add deleted_at column for soft-delete support
alter table public.posts 
add column deleted_at timestamp with time zone null;

-- Update select policy to filter out soft-deleted posts by default
-- Note: This is an alternative to frontend filtering, but for now we'll stick to frontend filtering
-- as per the implementation plan to keep it simple and explicit.
