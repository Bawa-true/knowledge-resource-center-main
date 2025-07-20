# Admin Upload Functionality

## Overview
The admin upload form allows administrators to create courses and upload multiple resources (materials and videos) to the Knowledge Resource Center platform.

## Features

### Course Creation
- Course name and code (required)
- Course description (optional)
- Level selection (100, 200, 300, 400, graduate)
- Semester selection (first, second, summer)
- Course type (core, elective)
- Course program (general, ai, networking, control)

### File Upload
- Drag and drop interface
- Multiple file selection
- File validation (type and size)
- Supported file types:
  - Documents: PDF, Word (.doc, .docx), PowerPoint (.ppt, .pptx)
  - Videos: MP4, AVI, MOV
  - Images: JPG, JPEG, PNG, GIF
  - Archives: ZIP, RAR
- Maximum file size: 300MB per file

### Backend Integration
- Creates course record in `courses` table
- Uploads files to Supabase Storage bucket `resources`
- Creates resource records in `resources` table
- Links resources to the created course
- Handles authentication and user permissions

## Database Schema

### Courses Table
```sql
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
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Resources Table
```sql
CREATE TABLE public.resources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    resource_type resource_type NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER,
    views INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Implementation Details

### Key Components
1. **AdminUpload.tsx** - Main upload form component
2. **useCourses.ts** - Hook for course and resource management
3. **utils.ts** - File validation and utility functions

### File Storage
- Files are stored in Supabase Storage bucket named `resources`
- File path structure: `{course_id}/{resource_type}/{filename}`
- Unique filenames are generated to prevent conflicts

### Error Handling
- File validation before upload
- Network error handling
- User feedback through toast notifications
- Loading states during upload

### Security
- Row Level Security (RLS) policies
- User authentication required
- File type validation
- File size limits

## Usage

1. Navigate to `/admin/upload`
2. Fill in course information
3. Drag and drop files or click to browse
4. Review selected files
5. Click "Upload Resources" to submit

## Prerequisites

1. Supabase project configured
2. Storage bucket `resources` created
3. Database schema applied
4. User authenticated with admin role
5. Environment variables set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Troubleshooting

### Common Issues
1. **File upload fails**: Check storage bucket permissions
2. **Course creation fails**: Verify database schema and RLS policies
3. **Authentication errors**: Ensure user is logged in and has admin role
4. **File validation errors**: Check file type and size limits

### Storage Bucket Setup
```sql
-- Create storage bucket (run in Supabase SQL editor)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resources', 'resources', true);
``` 