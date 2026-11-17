-- 프로필 사진 버킷은 공개라서, 올릴 수 있는 파일을 5MB 이하 이미지로 묶는다.
update storage.buckets
  set file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
  where id = 'profile-photos';
