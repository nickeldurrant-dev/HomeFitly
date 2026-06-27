/*
  # Add unique constraint to home_profiles table

  1. Changes
    - Add unique constraint on `user_id` column in `home_profiles` table
    - This enables upsert operations with `onConflict: 'user_id'`

  2. Notes
    - Required for proper upsert functionality in the application
    - Ensures each user can only have one home profile
*/

-- Add unique constraint to user_id column if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'home_profiles_user_id_key' 
    AND table_name = 'home_profiles'
  ) THEN
    ALTER TABLE home_profiles ADD CONSTRAINT home_profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;