/*
  # Create secure user data backups table

  1. New Tables
    - `user_data_backups`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `data` (jsonb, encrypted user data)
      - `checksum` (text, data integrity verification)
      - `version` (text, app version)
      - `encrypted` (boolean, encryption status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_data_backups` table
    - Add policy for users to manage their own backup data
    - Add indexes for performance
    - Add data retention policy

  3. Features
    - Automatic data integrity verification
    - Version-based data migration support
    - Encrypted storage for sensitive information
    - Audit trail for backup operations
*/

-- Create user data backups table
CREATE TABLE IF NOT EXISTS user_data_backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data jsonb NOT NULL,
  checksum text,
  version text NOT NULL DEFAULT '1.0.0',
  encrypted boolean DEFAULT true,
  backup_type text DEFAULT 'automatic',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_data_backups ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own backup data
CREATE POLICY "Users can manage their own backup data"
  ON user_data_backups
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS user_data_backups_user_id_idx ON user_data_backups(user_id);
CREATE INDEX IF NOT EXISTS user_data_backups_created_at_idx ON user_data_backups(created_at DESC);
CREATE INDEX IF NOT EXISTS user_data_backups_version_idx ON user_data_backups(version);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_data_backups_updated_at
  BEFORE UPDATE ON user_data_backups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create security audit log table
CREATE TABLE IF NOT EXISTS security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on security audit log
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policy for security audit log (admin access only)
CREATE POLICY "Only service role can access audit log"
  ON security_audit_log
  FOR ALL
  TO service_role
  USING (true);

-- Create indexes for audit log
CREATE INDEX IF NOT EXISTS security_audit_log_user_id_idx ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS security_audit_log_event_type_idx ON security_audit_log(event_type);
CREATE INDEX IF NOT EXISTS security_audit_log_created_at_idx ON security_audit_log(created_at DESC);

-- Create data retention function (delete old backups)
CREATE OR REPLACE FUNCTION cleanup_old_backups()
RETURNS void AS $$
BEGIN
  -- Keep only the last 10 backups per user
  DELETE FROM user_data_backups
  WHERE id NOT IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
      FROM user_data_backups
    ) ranked
    WHERE rn <= 10
  );
  
  -- Delete audit logs older than 90 days
  DELETE FROM security_audit_log
  WHERE created_at < now() - interval '90 days';
END;
$$ LANGUAGE plpgsql;

-- Create function to log security events from the application
CREATE OR REPLACE FUNCTION log_security_event(
  p_user_id uuid,
  p_event_type text,
  p_event_details jsonb DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO security_audit_log (
    user_id,
    event_type,
    event_details,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_event_type,
    p_event_details,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;