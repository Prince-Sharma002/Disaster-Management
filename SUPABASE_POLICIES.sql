-- Supabase Storage Policies for polygon-images bucket
-- Run these SQL commands in your Supabase SQL Editor

-- 1. Allow public uploads to polygon-images bucket
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'polygon-images');

-- 2. Allow public access to view images
CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT USING (bucket_id = 'polygon-images');

-- 3. Allow public updates (optional)
CREATE POLICY "Allow public updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'polygon-images');

-- 4. Allow public deletes (optional)
CREATE POLICY "Allow public deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'polygon-images');

-- Alternative: If you want to allow all operations with one policy
-- CREATE POLICY "Allow all operations" ON storage.objects
-- FOR ALL USING (bucket_id = 'polygon-images');
