# Supabase Setup Guide for Knowledge Resource Center

## Overview

This guide provides step-by-step instructions for setting up Supabase as the backend for the Knowledge Resource Center application.

## Prerequisites

- Supabase account (free tier available)
- Node.js and npm installed
- Basic knowledge of SQL and database management

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `knowledge-resource-center`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be provisioned (2-3 minutes)

## Step 2: Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the entire content from `supabase-schema.sql`
4. Paste and execute the SQL script
5. Verify all tables are created in **Table Editor**

## Step 3: Create Storage Buckets

### 1. Resources Bucket
```bash
# Via Supabase Dashboard:
1. Go to Storage > Create bucket
2. Name: resources
3. Public bucket: ✅ Yes
4. File size limit: No limit (or set to maximum allowed)
5. Allowed MIME types: 
   - application/pdf
   - application/msword
   - application/vnd.openxmlformats-officedocument.wordprocessingml.document
   - application/vnd.ms-powerpoint
   - application/vnd.openxmlformats-officedocument.presentationml.presentation
   - video/mp4
   - video/avi
   - video/quicktime
   - image/jpeg
   - image/png
   - image/gif
   - application/zip
   - application/x-rar-compressed
```

### 2. Avatars Bucket
```bash
# Via Supabase Dashboard:
1. Go to Storage > Create bucket
2. Name: avatars
3. Public bucket: ✅ Yes
4. File size limit: 5242880 (5MB) - Keep reasonable limit for profile pictures
5. Allowed MIME types:
   - image/jpeg
   - image/png
   - image/gif
```

### 3. Thumbnails Bucket
```bash
# Via Supabase Dashboard:
1. Go to Storage > Create bucket
2. Name: thumbnails
3. Public bucket: ✅ Yes
4. File size limit: 2097152 (2MB) - Keep reasonable limit for thumbnails
5. Allowed MIME types:
   - image/jpeg
   - image/png
```

## Step 4: Configure Authentication

### 1. Enable Email Auth
1. Go to **Authentication > Settings**
2. Enable **Email auth**
3. Configure email templates (optional)

### 2. Set Up Row Level Security (RLS)
- RLS is already enabled in the schema
- Policies are automatically created for data security

### 3. Configure Auth Settings
```javascript
// In your Supabase project settings:
1. Go to Authentication > Settings
2. Set Site URL: http://localhost:3000 (for development)
3. Set Redirect URLs: 
   - http://localhost:3000/auth/callback
   - http://localhost:3000/dashboard
4. Save changes
```

## Step 5: Install Supabase Client

```bash
# Install Supabase client in your React project
npm install @supabase/supabase-js
```

## Step 6: Environment Configuration

Create `.env.local` file in your project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Service Role Key (for admin operations)
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Step 7: Initialize Supabase Client

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For admin operations (server-side only)
export const supabaseAdmin = createClient(
  supabaseUrl,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
)
```

## Step 8: Database Types Generation

### 1. Install Supabase CLI
```bash
npm install -g supabase
```

### 2. Generate TypeScript Types
```bash
# Login to Supabase
supabase login

# Generate types
supabase gen types typescript --project-id your-project-id > src/types/supabase.ts
```

## Step 9: API Integration Examples

### Authentication
```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// Sign out
const { error } = await supabase.auth.signOut()
```

### User Management
```typescript
// Create user profile
const { data, error } = await supabase
  .from('users')
  .insert({
    id: user.id,
    email: user.email,
    name: 'John Doe',
    role: 'student',
    level: '300'
  })

// Get user profile
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', user.id)
  .single()
```

### Resource Management
```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('resources')
  .upload(`course-123/materials/file.pdf`, file)

// Get file URL
const { data } = supabase.storage
  .from('resources')
  .getPublicUrl(`course-123/materials/file.pdf`)

// Create resource record
const { data, error } = await supabase
  .from('resources')
  .insert({
    title: 'Lecture Notes',
    description: 'Introduction to algorithms',
    resource_type: 'material',
    course_id: 'course-uuid',
    uploaded_by: user.id,
    file_path: 'course-123/materials/file.pdf',
    file_name: 'file.pdf',
    file_size: 1024000,
    file_type: 'application/pdf'
  })
```

### Announcements
```typescript
// Create announcement
const { data, error } = await supabase
  .from('announcements')
  .insert({
    title: 'System Maintenance',
    content: 'Platform will be down for maintenance',
    priority: 'high',
    target_audience: 'all',
    author_id: user.id
  })

// Get announcements
const { data, error } = await supabase
  .from('announcements')
  .select('*')
  .eq('status', 'active')
  .order('created_at', { ascending: false })
```

## Step 10: Real-time Subscriptions

```typescript
// Subscribe to notifications
const subscription = supabase
  .channel('notifications')
  .on('postgres_changes', 
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'notifications',
      filter: `user_id=eq.${user.id}`
    }, 
    (payload) => {
      console.log('New notification:', payload.new)
      // Update UI with new notification
    }
  )
  .subscribe()

// Subscribe to announcements
const announcementSubscription = supabase
  .channel('announcements')
  .on('postgres_changes', 
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'announcements'
    }, 
    (payload) => {
      console.log('New announcement:', payload.new)
      // Update UI with new announcement
    }
  )
  .subscribe()
```

## Step 11: Testing the Setup

### 1. Test Database Connection
```typescript
// Test query
const { data, error } = await supabase
  .from('users')
  .select('count')
  .limit(1)

if (error) {
  console.error('Database connection failed:', error)
} else {
  console.log('Database connection successful')
}
```

### 2. Test File Upload
```typescript
// Test file upload
const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
const { data, error } = await supabase.storage
  .from('resources')
  .upload('test/test.txt', file)

if (error) {
  console.error('File upload failed:', error)
} else {
  console.log('File upload successful:', data)
}
```

## Step 12: Production Deployment

### 1. Update Environment Variables
```env
# Production environment
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

### 2. Update Auth Settings
1. Go to Supabase Dashboard > Authentication > Settings
2. Update Site URL to your production domain
3. Add production redirect URLs
4. Configure custom email templates

### 3. Database Backups
1. Go to Supabase Dashboard > Settings > Database
2. Enable automatic backups
3. Set backup retention period

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**
   - Check if user is authenticated
   - Verify user role and permissions
   - Review RLS policies in schema

2. **File Upload Errors**
   - Check allowed file types
   - Ensure bucket permissions are correct
   - Verify storage quota (if applicable)

3. **Authentication Issues**
   - Verify environment variables
   - Check auth settings in Supabase dashboard
   - Ensure redirect URLs are correct

### Performance Optimization

1. **Database Indexes**
   - All necessary indexes are included in the schema
   - Monitor query performance in Supabase dashboard

2. **Storage Optimization**
   - Use appropriate file formats
   - Consider compression for very large files
   - Implement lazy loading for media
   - Monitor storage usage and costs

3. **Caching**
   - Implement client-side caching for frequently accessed data
   - Use Supabase's built-in caching features

## Security Best Practices

1. **Never expose service role key in client-side code**
2. **Use RLS policies for data access control**
3. **Validate all user inputs**
4. **Implement proper error handling**
5. **Regular security audits**
6. **Keep dependencies updated**

## Monitoring and Analytics

1. **Database Performance**
   - Monitor query performance in Supabase dashboard
   - Set up alerts for slow queries

2. **Storage Usage**
   - Track storage bucket usage
   - Monitor file upload patterns

3. **User Activity**
   - Review user activity logs
   - Monitor authentication patterns

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Community](https://github.com/supabase/supabase/discussions)
- [Supabase Discord](https://discord.supabase.com)

## Next Steps

1. Implement authentication flow in your React app
2. Create API hooks for data operations
3. Set up real-time subscriptions
4. Implement file upload functionality
5. Add error handling and loading states
6. Test all features thoroughly
7. Deploy to production

This setup provides a solid foundation for your Knowledge Resource Center application with Supabase as the backend. 