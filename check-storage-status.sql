-- Allow authenticated users to SELECT from storage.buckets
CREATE POLICY "Allow authenticated list buckets"
ON storage.buckets
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to read files
CREATE POLICY "Allow authenticated read files"
ON storage.objects
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Optional: Allow delete if needed
CREATE POLICY "Allow authenticated delete files"
ON storage.objects
FOR DELETE
TO authenticated
USING (true);
