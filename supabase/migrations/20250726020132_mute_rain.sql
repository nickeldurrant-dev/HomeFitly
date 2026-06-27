/*
  # Create home profiles table

  1. New Tables
    - `home_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `address` (text)
      - `family_name` (text)
      - `year_built` (integer)
      - `square_footage` (integer)
      - `bedrooms` (integer)
      - `bathrooms` (numeric)
      - `home_type` (text)
      - `lot_size` (numeric, nullable)
      - `features` (jsonb array)
      - `notification_settings` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `home_profiles` table
    - Add policy for users to manage their own profile
*/

CREATE TABLE IF NOT EXISTS home_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  address text NOT NULL,
  family_name text NOT NULL,
  year_built integer NOT NULL,
  square_footage integer NOT NULL,
  bedrooms integer NOT NULL,
  bathrooms numeric NOT NULL,
  home_type text NOT NULL,
  lot_size numeric,
  features jsonb DEFAULT '[]'::jsonb,
  notification_settings jsonb DEFAULT '{
    "enabled": true,
    "taskReminders": true,
    "warrantyAlerts": true,
    "maintenanceSchedule": true,
    "urgentTasks": true,
    "emailNotifications": true,
    "pushNotifications": true,
    "reminderDays": 3
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE home_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own home profile"
  ON home_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS home_profiles_user_id_idx ON home_profiles(user_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_home_profiles_updated_at
  BEFORE UPDATE ON home_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();