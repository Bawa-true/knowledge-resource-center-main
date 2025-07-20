-- =====================================================
-- CREATE FRESH STORAGE BUCKET
-- =====================================================

-- Create a fresh resources bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resources',
  'resources',
  true,
  314572800, -- 300MB in bytes
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'video/mp4',
    'video/avi',
    'video/quicktime',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/zip',
    'application/x-rar-compressed',
    'text/plain'
  ]
);

-- Create basic storage policies
CREATE POLICY "Enable read access for all users" ON storage.objects
FOR SELECT USING (bucket_id = 'resources');

CREATE POLICY "Enable insert for authenticated users only" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'resources' AND auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON storage.objects
FOR UPDATE USING (bucket_id = 'resources' AND auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON storage.objects
FOR DELETE USING (bucket_id = 'resources' AND auth.role() = 'authenticated');

-- Verify the bucket was created
SELECT 'Bucket created successfully!' as status;
SELECT name, public, file_size_limit FROM storage.buckets WHERE name = 'resources'; 