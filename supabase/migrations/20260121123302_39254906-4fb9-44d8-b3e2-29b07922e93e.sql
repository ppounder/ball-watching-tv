-- Rename storage bucket from 'competition' to 'ball-watching'
UPDATE storage.buckets SET id = 'ball-watching', name = 'ball-watching' WHERE id = 'competition';