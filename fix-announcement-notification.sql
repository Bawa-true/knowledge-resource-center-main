-- Fix the announcement notification function
-- The issue is that the function tries to access a 'level' column that doesn't exist in the users table

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS create_announcement_notifications_trigger ON public.announcements;
DROP FUNCTION IF EXISTS create_announcement_notifications();

-- Create the corrected function
CREATE OR REPLACE FUNCTION create_announcement_notifications()
RETURNS TRIGGER AS $$
BEGIN
    -- Create notifications for all users based on target audience
    IF NEW.target_audience = 'all' THEN
        INSERT INTO public.notifications (user_id, title, message, priority, type, related_id)
        SELECT id, NEW.title, NEW.content, NEW.priority, 'announcement', NEW.id
        FROM public.users
        WHERE status = 'active';
    ELSE
        -- Create notifications for specific level students
        -- Since users table doesn't have a 'level' column, we'll use the role field
        -- or create notifications for all active users (you can modify this logic as needed)
        INSERT INTO public.notifications (user_id, title, message, priority, type, related_id)
        SELECT id, NEW.title, NEW.content, NEW.priority, 'announcement', NEW.id
        FROM public.users
        WHERE status = 'active' AND role = 'student';
        -- Note: This is a simplified approach. You might want to add a 'level' column to users table
        -- or modify the logic based on your specific requirements
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate the trigger
CREATE TRIGGER create_announcement_notifications_trigger 
    AFTER INSERT ON public.announcements
    FOR EACH ROW EXECUTE FUNCTION create_announcement_notifications();

-- Alternative: If you want to add a 'level' column to users table instead
-- Uncomment the following lines if you prefer this approach:

/*
-- Add level column to users table
ALTER TABLE public.users ADD COLUMN level TEXT CHECK (level IN ('100', '200', '300', '400', '500', 'graduate'));

-- Update existing users with default level (optional)
UPDATE public.users SET level = '300' WHERE level IS NULL;

-- Then use the original function logic:
CREATE OR REPLACE FUNCTION create_announcement_notifications()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.target_audience = 'all' THEN
        INSERT INTO public.notifications (user_id, title, message, priority, type, related_id)
        SELECT id, NEW.title, NEW.content, NEW.priority, 'announcement', NEW.id
        FROM public.users
        WHERE status = 'active';
    ELSE
        INSERT INTO public.notifications (user_id, title, message, priority, type, related_id)
        SELECT id, NEW.title, NEW.content, NEW.priority, 'announcement', NEW.id
        FROM public.users
        WHERE status = 'active' AND level = NEW.target_audience;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';
*/ 