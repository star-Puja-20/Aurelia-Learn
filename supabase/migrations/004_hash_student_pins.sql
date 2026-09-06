-- Stop storing student PINs in plaintext. Existing rows must be migrated separately.
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS pin_hash TEXT;

ALTER TABLE public.students
  ALTER COLUMN pin DROP NOT NULL;

COMMENT ON COLUMN public.students.pin IS 'Deprecated plaintext PIN; null for newly created students.';
COMMENT ON COLUMN public.students.pin_hash IS 'Scrypt hash of the student PIN.';
