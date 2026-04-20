# Photo Folder Convention

This project treats photo sections as folders managed in Supabase:

- `photo_folders.slug` acts like the folder name.
- Uploaded files are stored in bucket `photo-sections` under `<folder-slug>/...`.
- `photos.storage_path` keeps the exact storage path.
- `photos.public_url` is used for rendering images on the public page.

This keeps your "folder-like image sections" consistent between admin uploads and public display.
