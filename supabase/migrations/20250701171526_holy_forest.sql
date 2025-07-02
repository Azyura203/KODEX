/*
  # Fix RLS Policy Infinite Recursion

  1. Drop existing problematic policies
  2. Create simplified, non-recursive policies
  3. Ensure proper policy structure without circular references

  This migration fixes the infinite recursion error in repository policies.
*/

-- Drop all existing policies for repositories table
DROP POLICY IF EXISTS "Users can manage their own repositories" ON repositories;
DROP POLICY IF EXISTS "Users can view public repositories" ON repositories;
DROP POLICY IF EXISTS "Collaborators can view repositories" ON repositories;

-- Create simplified, non-recursive policies
CREATE POLICY "Repository owners can manage their repositories"
  ON repositories
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Public repositories are viewable by everyone"
  ON repositories
  FOR SELECT
  TO public
  USING (NOT is_private);

CREATE POLICY "Authenticated users can view public repositories"
  ON repositories
  FOR SELECT
  TO authenticated
  USING (NOT is_private OR owner_id = auth.uid());

-- Fix collaborators policies to avoid recursion
DROP POLICY IF EXISTS "Repository owners can manage collaborators" ON collaborators;
DROP POLICY IF EXISTS "Users can view their own collaborations" ON collaborators;

CREATE POLICY "Repository owners can manage collaborators"
  ON collaborators
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM repositories 
      WHERE repositories.id = collaborators.repository_id 
      AND repositories.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM repositories 
      WHERE repositories.id = collaborators.repository_id 
      AND repositories.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own collaborations"
  ON collaborators
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Fix branches policies
DROP POLICY IF EXISTS "Repository owners can manage branches" ON branches;
DROP POLICY IF EXISTS "Users can view branches of accessible repositories" ON branches;

CREATE POLICY "Repository owners can manage branches"
  ON branches
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM repositories 
      WHERE repositories.id = branches.repository_id 
      AND repositories.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM repositories 
      WHERE repositories.id = branches.repository_id 
      AND repositories.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view branches of accessible repositories"
  ON branches
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM repositories 
      WHERE repositories.id = branches.repository_id 
      AND (
        repositories.owner_id = auth.uid() 
        OR NOT repositories.is_private
      )
    )
  );

-- Fix commits policies
DROP POLICY IF EXISTS "Users can create commits in accessible repositories" ON commits;
DROP POLICY IF EXISTS "Users can view commits of accessible repositories" ON commits;

CREATE POLICY "Users can create commits in accessible repositories"
  ON commits
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM repositories 
      WHERE repositories.id = commits.repository_id 
      AND repositories.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view commits of accessible repositories"
  ON commits
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM repositories 
      WHERE repositories.id = commits.repository_id 
      AND (
        repositories.owner_id = auth.uid() 
        OR NOT repositories.is_private
      )
    )
  );

-- Fix working directory policies
DROP POLICY IF EXISTS "Users can manage their own working directory" ON working_directory;

CREATE POLICY "Users can manage their own working directory"
  ON working_directory
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Fix other table policies to avoid recursion
DROP POLICY IF EXISTS "Users can view file changes of accessible commits" ON file_changes;

CREATE POLICY "Users can view file changes of accessible commits"
  ON file_changes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM commits 
      JOIN repositories ON repositories.id = commits.repository_id
      WHERE commits.id = file_changes.commit_id 
      AND (
        repositories.owner_id = auth.uid() 
        OR NOT repositories.is_private
      )
    )
  );

DROP POLICY IF EXISTS "Users can view projects of accessible repositories" ON projects;

CREATE POLICY "Users can view projects of accessible repositories"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM repositories 
      WHERE repositories.id = projects.repository_id 
      AND (
        repositories.owner_id = auth.uid() 
        OR NOT repositories.is_private
      )
    )
  );

DROP POLICY IF EXISTS "Users can view stats of accessible repositories" ON repository_stats;

CREATE POLICY "Users can view stats of accessible repositories"
  ON repository_stats
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM repositories 
      WHERE repositories.id = repository_stats.repository_id 
      AND (
        repositories.owner_id = auth.uid() 
        OR NOT repositories.is_private
      )
    )
  );