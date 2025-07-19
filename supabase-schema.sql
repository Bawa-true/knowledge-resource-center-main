-- =====================================================
-- KNOWLEDGE RESOURCE CENTER - SUPABASE SCHEMA
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- USERS & AUTHENTICATION
-- =====================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    avatar_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_logged_in BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table
CREATE TABLE public.profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    staff_pin TEXT,
    role TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =====================================================
-- TRIGGER: AUTO-CREATE PROFILE ROW ON SIGNUP
-- =====================================================

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into users table
  INSERT INTO public.users (id, email, name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),  -- Use name from metadata if available
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),  -- Use role from metadata if available
    'active'
  );
  
  -- Insert into profiles table
  INSERT INTO public.profiles (user_id, full_name, role, email, staff_pin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.email,
    NEW.raw_user_meta_data->>'staff_pin'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- COURSES
-- =====================================================

-- Courses table
CREATE TABLE public.courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    instructor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    level TEXT NOT NULL CHECK (level IN ('100', '200', '300', '400', '500', 'graduate')),
    semester TEXT NOT NULL CHECK (semester IN ('first', 'second', 'summer')),
    course_type TEXT NOT NULL CHECK (course_type IN ('core', 'elective')),
    course_program TEXT NOT NULL CHECK (course_program IN ('general', 'ai', 'networking', 'control')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- RESOURCES (MATERIALS & VIDEOS)
-- =====================================================

-- Resource types enum
CREATE TYPE resource_type AS ENUM ('material', 'video');

-- Resources table (unified table for materials and videos)
CREATE TABLE public.resources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    resource_type resource_type NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    file_path TEXT NOT NULL, -- Supabase storage path
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL, -- in bytes
    file_type TEXT NOT NULL, -- MIME type
    thumbnail_url TEXT, -- For videos and documents
    duration INTEGER, -- For videos in seconds
    views INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'processing')),
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ANNOUNCEMENTS
-- =====================================================

-- Announcements table
CREATE TABLE public.announcements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    target_audience TEXT NOT NULL CHECK (target_audience IN ('all', '500 level', '400 level', '300 level')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    is_pinned BOOLEAN DEFAULT FALSE,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    expiry_date TIMESTAMP WITH TIME ZONE,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

-- Notifications table
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    type TEXT NOT NULL CHECK (type IN ('announcement', 'upload', 'system', 'course')),
    related_id UUID, -- ID of related resource (announcement, course, etc.)
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SYSTEM SETTINGS
-- =====================================================

-- General settings table
CREATE TABLE public.settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type TEXT NOT NULL CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- USER ACTIVITY & ANALYTICS
-- =====================================================

-- User activity log
CREATE TABLE public.user_activity (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    resource_type TEXT, -- 'course', 'material', 'video', 'announcement'
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resource views tracking
CREATE TABLE public.resource_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(resource_id, user_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_status ON public.users(status);

-- Profiles indexes
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Courses indexes
CREATE INDEX idx_courses_code ON public.courses(code);
CREATE INDEX idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX idx_courses_level ON public.courses(level);
CREATE INDEX idx_courses_status ON public.courses(status);

-- Resources indexes
CREATE INDEX idx_resources_course ON public.resources(course_id);
CREATE INDEX idx_resources_type ON public.resources(resource_type);
CREATE INDEX idx_resources_uploaded_by ON public.resources(uploaded_by);
CREATE INDEX idx_resources_status ON public.resources(status);
CREATE INDEX idx_resources_created_at ON public.resources(created_at);

-- Announcements indexes
CREATE INDEX idx_announcements_priority ON public.announcements(priority);
CREATE INDEX idx_announcements_target_audience ON public.announcements(target_audience);
CREATE INDEX idx_announcements_status ON public.announcements(status);
CREATE INDEX idx_announcements_created_at ON public.announcements(created_at);
CREATE INDEX idx_announcements_expiry_date ON public.announcements(expiry_date);

-- Notifications indexes
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);

-- Activity indexes
CREATE INDEX idx_user_activity_user ON public.user_activity(user_id);
CREATE INDEX idx_user_activity_created_at ON public.user_activity(created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_views ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Courses policies
CREATE POLICY "Anyone can view active courses" ON public.courses
    FOR SELECT USING (status = 'active');

CREATE POLICY "Instructors can manage their courses" ON public.courses
    FOR ALL USING (
        instructor_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Resources policies
CREATE POLICY "Anyone can view active resources" ON public.resources
    FOR SELECT USING (status = 'active');

CREATE POLICY "Uploaders can manage their resources" ON public.resources
    FOR ALL USING (
        uploaded_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Announcements policies
CREATE POLICY "Anyone can view active announcements" ON public.announcements
    FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage announcements" ON public.announcements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Settings policies
CREATE POLICY "Admins can manage settings" ON public.settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment resource views
CREATE OR REPLACE FUNCTION increment_resource_views()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.resources 
    SET views = views + 1 
    WHERE id = NEW.resource_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for resource views
CREATE TRIGGER increment_resource_views_trigger 
    AFTER INSERT ON public.resource_views
    FOR EACH ROW EXECUTE FUNCTION increment_resource_views();

-- Function to create notification for new announcements
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
        INSERT INTO public.notifications (user_id, title, message, priority, type, related_id)
        SELECT id, NEW.title, NEW.content, NEW.priority, 'announcement', NEW.id
        FROM public.users
        WHERE status = 'active' AND level = NEW.target_audience;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for announcement notifications
CREATE TRIGGER create_announcement_notifications_trigger 
    AFTER INSERT ON public.announcements
    FOR EACH ROW EXECUTE FUNCTION create_announcement_notifications();

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default settings
INSERT INTO public.settings (setting_key, setting_value, setting_type, description) VALUES
('site_name', 'Knowledge Resource Center', 'string', 'Website name'),
('site_description', 'Computer Engineering Educational Platform', 'string', 'Website description'),
('contact_email', 'admin@edutech.com', 'string', 'Contact email'),
('allowed_file_types', 'pdf,doc,docx,ppt,pptx,mp4,avi,mov,jpg,jpeg,png,gif,zip,rar', 'string', 'Allowed file types'),
('auto_enrollment', 'true', 'boolean', 'Auto-enrollment for courses'),
('email_notifications', 'true', 'boolean', 'Email notifications enabled'),
('maintenance_mode', 'false', 'boolean', 'Maintenance mode'),
('password_min_length', '8', 'number', 'Minimum password length'),
('require_two_factor', 'false', 'boolean', 'Require two-factor authentication'),
('session_timeout', '1800', 'number', 'Session timeout in seconds'),
('login_attempts', '5', 'number', 'Maximum login attempts'),
('ssl_required', 'true', 'boolean', 'SSL required'),
('data_encryption', 'true', 'boolean', 'Data encryption enabled');

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Note: These buckets need to be created in Supabase Dashboard or via API
-- The following are the bucket configurations you should create:

/*
1. 'resources' bucket
   - Public bucket for course materials and videos
   - Allowed file types: pdf, doc, docx, ppt, ppttx, mp4, avi, mov, jpg, jpeg, png, gif, zip, rar
   - No file size limit (or set to maximum allowed by Supabase)
   - Folder structure: /{course_id}/{resource_type}/{filename}

2. 'avatars' bucket
   - Public bucket for user profile pictures
   - Allowed file types: jpg, jpeg, png, gif
   - Max file size: 5MB
   - Folder structure: /{user_id}/{filename}

3. 'thumbnails' bucket
   - Public bucket for video and document thumbnails
   - Allowed file types: jpg, jpeg, png
   - Max file size: 2MB
   - Folder structure: /{resource_id}/{filename}
*/

-- =====================================================
-- COMMENTS
-- =====================================================

/*
This schema provides a complete foundation for the Knowledge Resource Center application with:

1. User Management: Students, Instructors, and Admins
2. Course Management: Course creation and organization
3. Resource Management: Materials and videos with file storage
4. Announcements: System-wide and targeted announcements
5. Notifications: Real-time user notifications
6. Analytics: User activity and resource usage tracking
7. Settings: Configurable system settings
8. Security: Row Level Security (RLS) policies
9. Performance: Optimized indexes for common queries

Key Features:
- UUID primary keys for security
- Proper foreign key relationships
- Enum types for data validation
- Automatic timestamp management
- Comprehensive RLS policies
- Activity tracking and analytics
- Notification system
- File storage integration

To complete the setup:
1. Create the storage buckets in Supabase Dashboard
2. Set up authentication providers
3. Configure email templates for notifications
4. Set up real-time subscriptions for notifications
5. Configure backup and retention policies
*/ 