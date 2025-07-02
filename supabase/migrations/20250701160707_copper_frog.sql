/*
  # Git Management System Database Schema

  1. New Tables
    - `repositories` - Store repository information
    - `branches` - Track all branches in repositories
    - `commits` - Store commit history and metadata
    - `file_changes` - Track individual file changes in commits
    - `projects` - Store project metadata and settings
    - `collaborators` - Manage project access and permissions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for collaborators to access shared projects

  3. Features
    - Full commit history tracking
    - Branch management with merge tracking
    - File change tracking with diffs
    - Project collaboration system
    - Repository statistics and analytics
*/

-- Create repositories table
CREATE TABLE IF NOT EXISTS repositories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  is_private boolean DEFAULT false,
  default_branch text DEFAULT 'main',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  stars_count integer DEFAULT 0,
  forks_count integer DEFAULT 0,
  size_kb integer DEFAULT 0,
  language text,
  topics text[] DEFAULT '{}',
  UNIQUE(owner_id, name)
);

-- Create branches table
CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id uuid REFERENCES repositories(id) ON DELETE CASCADE,
  name text NOT NULL,
  commit_sha text,
  is_default boolean DEFAULT false,
  is_protected boolean DEFAULT false,
  ahead_count integer DEFAULT 0,
  behind_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(repository_id, name)
);

-- Create commits table
CREATE TABLE IF NOT EXISTS commits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id uuid REFERENCES repositories(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES branches(id) ON DELETE CASCADE,
  sha text UNIQUE NOT NULL,
  message text NOT NULL,
  description text,
  author_id uuid REFERENCES auth.users(id),
  author_name text NOT NULL,
  author_email text NOT NULL,
  committer_name text,
  committer_email text,
  parent_sha text,
  tree_sha text,
  files_changed integer DEFAULT 0,
  additions integer DEFAULT 0,
  deletions integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create file_changes table
CREATE TABLE IF NOT EXISTS file_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commit_id uuid REFERENCES commits(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  change_type text CHECK (change_type IN ('added', 'modified', 'deleted', 'renamed', 'copied')),
  old_path text,
  additions integer DEFAULT 0,
  deletions integer DEFAULT 0,
  is_binary boolean DEFAULT false,
  patch text,
  created_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id uuid REFERENCES repositories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  homepage_url text,
  documentation_url text,
  license text,
  readme_content text,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create collaborators table
CREATE TABLE IF NOT EXISTS collaborators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id uuid REFERENCES repositories(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text CHECK (role IN ('read', 'write', 'admin')) DEFAULT 'read',
  invited_by uuid REFERENCES auth.users(id),
  invited_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  UNIQUE(repository_id, user_id)
);

-- Create working_directory table for staging area
CREATE TABLE IF NOT EXISTS working_directory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id uuid REFERENCES repositories(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  content text,
  change_type text CHECK (change_type IN ('added', 'modified', 'deleted', 'renamed')),
  is_staged boolean DEFAULT false,
  additions integer DEFAULT 0,
  deletions integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(repository_id, user_id, file_path)
);

-- Create repository_stats table for analytics
CREATE TABLE IF NOT EXISTS repository_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id uuid REFERENCES repositories(id) ON DELETE CASCADE,
  date date DEFAULT CURRENT_DATE,
  commits_count integer DEFAULT 0,
  contributors_count integer DEFAULT 0,
  lines_added integer DEFAULT 0,
  lines_deleted integer DEFAULT 0,
  files_changed integer DEFAULT 0,
  UNIQUE(repository_id, date)
);

-- Enable Row Level Security
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE commits ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE repository_stats ENABLE ROW LEVEL SECURITY;

-- Repositories policies
CREATE POLICY "Users can view public repositories"
  ON repositories
  FOR SELECT
  USING (NOT is_private OR owner_id = auth.uid());

CREATE POLICY "Users can manage their own repositories"
  ON repositories
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Collaborators can view repositories"
  ON repositories
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collaborators 
      WHERE repository_id = repositories.id 
      AND user_id = auth.uid()
      AND accepted_at IS NOT NULL
    )
  );

-- Branches policies
CREATE POLICY "Users can view branches of accessible repositories"
  ON branches
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM repositories r
      WHERE r.id = repository_id
      AND (
        r.owner_id = auth.uid()
        OR NOT r.is_private
        OR EXISTS (
          SELECT 1 FROM collaborators c
          WHERE c.repository_id = r.id
          AND c.user_id = auth.uid()
          AND c.accepted_at IS NOT NULL
        )
      )
    )
  );

CREATE POLICY "Repository owners can manage branches"
  ON branches
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM repositories r
      WHERE r.id = repository_id
      AND r.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM repositories r
      WHERE r.id = repository_id
      AND r.owner_id = auth.uid()
    )
  );

-- Commits policies
CREATE POLICY "Users can view commits of accessible repositories"
  ON commits
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM repositories r
      WHERE r.id = repository_id
      AND (
        r.owner_id = auth.uid()
        OR NOT r.is_private
        OR EXISTS (
          SELECT 1 FROM collaborators c
          WHERE c.repository_id = r.id
          AND c.user_id = auth.uid()
          AND c.accepted_at IS NOT NULL
        )
      )
    )
  );

CREATE POLICY "Users can create commits in accessible repositories"
  ON commits
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM repositories r
      WHERE r.id = repository_id
      AND (
        r.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM collaborators c
          WHERE c.repository_id = r.id
          AND c.user_id = auth.uid()
          AND c.role IN ('write', 'admin')
          AND c.accepted_at IS NOT NULL
        )
      )
    )
  );

-- File changes policies
CREATE POLICY "Users can view file changes of accessible commits"
  ON file_changes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM commits c
      JOIN repositories r ON r.id = c.repository_id
      WHERE c.id = commit_id
      AND (
        r.owner_id = auth.uid()
        OR NOT r.is_private
        OR EXISTS (
          SELECT 1 FROM collaborators col
          WHERE col.repository_id = r.id
          AND col.user_id = auth.uid()
          AND col.accepted_at IS NOT NULL
        )
      )
    )
  );

-- Working directory policies
CREATE POLICY "Users can manage their own working directory"
  ON working_directory
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Projects policies
CREATE POLICY "Users can view projects of accessible repositories"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM repositories r
      WHERE r.id = repository_id
      AND (
        r.owner_id = auth.uid()
        OR NOT r.is_private
        OR EXISTS (
          SELECT 1 FROM collaborators c
          WHERE c.repository_id = r.id
          AND c.user_id = auth.uid()
          AND c.accepted_at IS NOT NULL
        )
      )
    )
  );

-- Collaborators policies
CREATE POLICY "Repository owners can manage collaborators"
  ON collaborators
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM repositories r
      WHERE r.id = repository_id
      AND r.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM repositories r
      WHERE r.id = repository_id
      AND r.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own collaborations"
  ON collaborators
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Repository stats policies
CREATE POLICY "Users can view stats of accessible repositories"
  ON repository_stats
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM repositories r
      WHERE r.id = repository_id
      AND (
        r.owner_id = auth.uid()
        OR NOT r.is_private
        OR EXISTS (
          SELECT 1 FROM collaborators c
          WHERE c.repository_id = r.id
          AND c.user_id = auth.uid()
          AND c.accepted_at IS NOT NULL
        )
      )
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_repositories_owner ON repositories(owner_id);
CREATE INDEX IF NOT EXISTS idx_repositories_name ON repositories(name);
CREATE INDEX IF NOT EXISTS idx_branches_repository ON branches(repository_id);
CREATE INDEX IF NOT EXISTS idx_commits_repository ON commits(repository_id);
CREATE INDEX IF NOT EXISTS idx_commits_branch ON commits(branch_id);
CREATE INDEX IF NOT EXISTS idx_commits_sha ON commits(sha);
CREATE INDEX IF NOT EXISTS idx_file_changes_commit ON file_changes(commit_id);
CREATE INDEX IF NOT EXISTS idx_working_directory_repo_user ON working_directory(repository_id, user_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_repository ON collaborators(repository_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_user ON collaborators(user_id);

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_repository_stats(repo_id uuid)
RETURNS TABLE (
  total_commits bigint,
  total_contributors bigint,
  total_files_changed bigint,
  total_additions bigint,
  total_deletions bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(c.id) as total_commits,
    COUNT(DISTINCT c.author_id) as total_contributors,
    COALESCE(SUM(c.files_changed), 0) as total_files_changed,
    COALESCE(SUM(c.additions), 0) as total_additions,
    COALESCE(SUM(c.deletions), 0) as total_deletions
  FROM commits c
  WHERE c.repository_id = repo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a new commit
CREATE OR REPLACE FUNCTION create_commit(
  p_repository_id uuid,
  p_branch_name text,
  p_message text,
  p_description text DEFAULT NULL,
  p_author_name text DEFAULT NULL,
  p_author_email text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_commit_id uuid;
  v_branch_id uuid;
  v_commit_sha text;
  v_user_id uuid;
  v_staged_files record;
  v_total_additions integer := 0;
  v_total_deletions integer := 0;
  v_files_count integer := 0;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  -- Generate commit SHA
  v_commit_sha := encode(gen_random_bytes(20), 'hex');
  
  -- Get or create branch
  SELECT id INTO v_branch_id
  FROM branches
  WHERE repository_id = p_repository_id AND name = p_branch_name;
  
  IF v_branch_id IS NULL THEN
    INSERT INTO branches (repository_id, name, is_default)
    VALUES (p_repository_id, p_branch_name, p_branch_name = 'main')
    RETURNING id INTO v_branch_id;
  END IF;
  
  -- Count staged files and calculate totals
  SELECT 
    COUNT(*),
    COALESCE(SUM(additions), 0),
    COALESCE(SUM(deletions), 0)
  INTO v_files_count, v_total_additions, v_total_deletions
  FROM working_directory
  WHERE repository_id = p_repository_id 
    AND user_id = v_user_id 
    AND is_staged = true;
  
  -- Create commit
  INSERT INTO commits (
    repository_id,
    branch_id,
    sha,
    message,
    description,
    author_id,
    author_name,
    author_email,
    files_changed,
    additions,
    deletions
  ) VALUES (
    p_repository_id,
    v_branch_id,
    v_commit_sha,
    p_message,
    p_description,
    v_user_id,
    COALESCE(p_author_name, 'User'),
    COALESCE(p_author_email, 'user@example.com'),
    v_files_count,
    v_total_additions,
    v_total_deletions
  ) RETURNING id INTO v_commit_id;
  
  -- Move staged files to file_changes
  FOR v_staged_files IN
    SELECT * FROM working_directory
    WHERE repository_id = p_repository_id 
      AND user_id = v_user_id 
      AND is_staged = true
  LOOP
    INSERT INTO file_changes (
      commit_id,
      file_path,
      change_type,
      additions,
      deletions
    ) VALUES (
      v_commit_id,
      v_staged_files.file_path,
      v_staged_files.change_type,
      v_staged_files.additions,
      v_staged_files.deletions
    );
  END LOOP;
  
  -- Remove staged files from working directory
  DELETE FROM working_directory
  WHERE repository_id = p_repository_id 
    AND user_id = v_user_id 
    AND is_staged = true;
  
  -- Update branch commit SHA
  UPDATE branches
  SET commit_sha = v_commit_sha, updated_at = now()
  WHERE id = v_branch_id;
  
  -- Update repository updated_at
  UPDATE repositories
  SET updated_at = now()
  WHERE id = p_repository_id;
  
  RETURN v_commit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;