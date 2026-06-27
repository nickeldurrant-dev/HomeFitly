/*
  # Create Tasks System

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `priority` (text)
      - `due_date` (date)
      - `completed` (boolean)
      - `completed_at` (timestamp)
      - `completed_by` (text)
      - `notes` (text)
      - `archived` (boolean)
      - `parent_task_id` (uuid, for recurring tasks)
      - `estimated_time` (integer, minutes)
      - `actual_time` (integer, minutes)
      - `difficulty` (text)
      - `points` (integer)
      - `appliance_id` (uuid, optional link to appliances)
      - `recurring_config` (jsonb)
      - `home_specific_config` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `task_completions`
      - `id` (uuid, primary key)
      - `task_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `completed_at` (timestamp)
      - `time_spent` (integer, minutes)
      - `difficulty_rating` (text)
      - `notes` (text)
      - `next_due_date` (date, for recurring)
      - `created_at` (timestamp)

    - `task_suggestions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `suggested_task` (jsonb)
      - `reason` (text)
      - `priority_score` (integer)
      - `accepted` (boolean)
      - `dismissed` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add indexes for performance
*/

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'maintenance',
  priority text NOT NULL DEFAULT 'medium',
  due_date date NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  completed_by text,
  notes text,
  archived boolean DEFAULT false,
  parent_task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
  estimated_time integer DEFAULT 30,
  actual_time integer,
  difficulty text DEFAULT 'medium',
  points integer DEFAULT 25,
  appliance_id uuid,
  recurring_config jsonb,
  home_specific_config jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create task_completions table
CREATE TABLE IF NOT EXISTS task_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  time_spent integer,
  difficulty_rating text,
  notes text,
  next_due_date date,
  created_at timestamptz DEFAULT now()
);

-- Create task_suggestions table
CREATE TABLE IF NOT EXISTS task_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suggested_task jsonb NOT NULL,
  reason text NOT NULL,
  priority_score integer DEFAULT 50,
  accepted boolean DEFAULT false,
  dismissed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_suggestions ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
CREATE POLICY "Users can manage their own tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for task_completions
CREATE POLICY "Users can manage their own task completions"
  ON task_completions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for task_suggestions
CREATE POLICY "Users can manage their own task suggestions"
  ON task_suggestions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON tasks(due_date);
CREATE INDEX IF NOT EXISTS tasks_completed_idx ON tasks(completed);
CREATE INDEX IF NOT EXISTS tasks_category_idx ON tasks(category);
CREATE INDEX IF NOT EXISTS tasks_priority_idx ON tasks(priority);
CREATE INDEX IF NOT EXISTS tasks_parent_task_id_idx ON tasks(parent_task_id);

CREATE INDEX IF NOT EXISTS task_completions_task_id_idx ON task_completions(task_id);
CREATE INDEX IF NOT EXISTS task_completions_user_id_idx ON task_completions(user_id);
CREATE INDEX IF NOT EXISTS task_completions_completed_at_idx ON task_completions(completed_at DESC);

CREATE INDEX IF NOT EXISTS task_suggestions_user_id_idx ON task_suggestions(user_id);
CREATE INDEX IF NOT EXISTS task_suggestions_priority_score_idx ON task_suggestions(priority_score DESC);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for tasks updated_at
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();