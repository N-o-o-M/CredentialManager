/*
  # Create credentials table and setup security

  1. New Tables
    - `credentials`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `platform` (text, platform name)
      - `username` (text, stored username)
      - `password` (text, stored password)
      - `url` (text, optional platform URL)
      - `notes` (text, optional notes)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on credentials table
    - Add policies for CRUD operations
    - Only authenticated users can access their own credentials
*/

CREATE TABLE IF NOT EXISTS credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  platform text NOT NULL,
  username text NOT NULL,
  password text NOT NULL,
  url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own credentials"
  ON credentials
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credentials"
  ON credentials
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credentials"
  ON credentials
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credentials"
  ON credentials
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);