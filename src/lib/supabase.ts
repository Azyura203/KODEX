import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://ihsabhhmussuyoibfmxw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imloc2FiaGhtdXNzdXlvaWJmbXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODU5NTMsImV4cCI6MjA2Njk2MTk1M30.IbGPus17lyScuMqd7q77PT5cBj96Eu4wVjT4Se5ju2M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'kodex-auth',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Session management utilities
export const sessionManager = {
  // Save session to localStorage
  saveSession(session: any) {
    if (typeof window !== 'undefined' && session) {
      try {
        localStorage.setItem('kodex-session', JSON.stringify({
          user: session.user,
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
          saved_at: Date.now()
        }));
        localStorage.setItem('kodex-auth-timestamp', Date.now().toString());
        localStorage.setItem('kodex-session-active', 'true');
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }
  },

  // Get session from localStorage
  getStoredSession() {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem('kodex-session');
      if (!stored) return null;
      
      const session = JSON.parse(stored);
      
      // Check if session is expired
      if (session.expires_at && Date.now() / 1000 > session.expires_at) {
        this.clearSession();
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('Error reading stored session:', error);
      this.clearSession();
      return null;
    }
  },

  // Clear session from localStorage
  clearSession() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kodex-session');
      localStorage.removeItem('kodex-auth');
      localStorage.removeItem('kodex-auth-timestamp');
      localStorage.removeItem('kodex-session-active');
    }
  },

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session?.user;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  // Check if this is a fresh session (not from page reload)
  isFreshSession() {
    if (typeof window === 'undefined') return false;
    
    const isActive = localStorage.getItem('kodex-session-active');
    return !isActive;
  },

  // Mark session as active (after showing welcome notification)
  markSessionActive() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kodex-session-active', 'true');
    }
  },

  // Initialize session on app start
  async initializeSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        this.saveSession(session);
        return session;
      }
      
      // Try to get from localStorage if Supabase doesn't have it
      const storedSession = this.getStoredSession();
      if (storedSession) {
        // Try to refresh the session
        const { data: { session: refreshedSession } } = await supabase.auth.refreshSession({
          refresh_token: storedSession.refresh_token
        });
        
        if (refreshedSession) {
          this.saveSession(refreshedSession);
          return refreshedSession;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error initializing session:', error);
      this.clearSession();
      return null;
    }
  }
};

// Enhanced authentication service with session management
export const authService = {
  async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split('@')[0],
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || email.split('@')[0])}&size=200&background=random`,
          bio: '',
          location: '',
          website: '',
          company: '',
          twitter_username: '',
          github_username: '',
          email_notifications: true,
          marketing_emails: false,
          security_alerts: true,
          two_factor_enabled: false,
          theme: 'system',
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          date_format: 'MM/DD/YYYY',
          created_at: new Date().toISOString()
        }
      }
    });
    
    if (error) throw error;
    
    // Save session if sign up was successful and user is confirmed
    if (data.session) {
      sessionManager.saveSession(data.session);
    }
    
    return { data };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Save session on successful sign in
    if (data.session) {
      sessionManager.saveSession(data.session);
    }
    
    return { data };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    
    // Clear session regardless of Supabase response
    sessionManager.clearSession();
    
    if (error) throw error;
  },

  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      // Try to get from stored session
      const storedSession = sessionManager.getStoredSession();
      return storedSession?.user || null;
    }
  },

  async updateProfile(updates: { 
    full_name?: string; 
    avatar_url?: string;
    bio?: string;
    location?: string;
    website?: string;
    company?: string;
    twitter_username?: string;
    github_username?: string;
    email_notifications?: boolean;
    marketing_emails?: boolean;
    security_alerts?: boolean;
    two_factor_enabled?: boolean;
    theme?: string;
    language?: string;
    timezone?: string;
    date_format?: string;
    password?: string;
    data?: any;
  }) {
    // If updating password
    if (updates.password) {
      const { data, error } = await supabase.auth.updateUser({
        password: updates.password
      });
      if (error) throw error;
      
      // Update stored session
      if (data.user) {
        const storedSession = sessionManager.getStoredSession();
        if (storedSession) {
          storedSession.user = data.user;
          sessionManager.saveSession(storedSession);
        }
      }
      
      return data;
    }

    // If updating user metadata
    const updateData = updates.data || updates;
    const { data, error } = await supabase.auth.updateUser({
      data: {
        ...updateData,
        updated_at: new Date().toISOString()
      }
    });
    
    if (error) throw error;
    
    // Update stored session
    if (data.user) {
      const storedSession = sessionManager.getStoredSession();
      if (storedSession) {
        storedSession.user = data.user;
        sessionManager.saveSession(storedSession);
      }
    }
    
    return data;
  },

  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error) throw error;
    return data;
  },

  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    
    // Update stored session
    if (data.user) {
      const storedSession = sessionManager.getStoredSession();
      if (storedSession) {
        storedSession.user = data.user;
        sessionManager.saveSession(storedSession);
      }
    }
    
    return data;
  },

  // Profile-specific methods
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async upsertProfile(profile: any) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Settings management
  async getUserSettings(userId: string) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateUserSettings(userId: string, settings: any) {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Listen for auth state changes and update localStorage
// Only set up listener once to avoid duplicates
let authListenerSetup = false;
if (typeof window !== 'undefined' && !authListenerSetup) {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Supabase auth state change:', event);
    
    if (event === 'SIGNED_IN' && session) {
      sessionManager.saveSession(session);
    } else if (event === 'SIGNED_OUT') {
      sessionManager.clearSession();
    } else if (event === 'TOKEN_REFRESHED' && session) {
      sessionManager.saveSession(session);
    }
  });
  authListenerSetup = true;
}

// Export types for compatibility (but we won't use the database operations)
export interface Repository {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  is_private: boolean;
  default_branch: string;
  created_at: string;
  updated_at: string;
  stars_count: number;
  forks_count: number;
  size_kb: number;
  language?: string;
  topics: string[];
}

export interface Branch {
  id: string;
  repository_id: string;
  name: string;
  commit_sha?: string;
  is_default: boolean;
  is_protected: boolean;
  ahead_count: number;
  behind_count: number;
  created_at: string;
  updated_at: string;
}

export interface Commit {
  id: string;
  repository_id: string;
  branch_id: string;
  sha: string;
  message: string;
  description?: string;
  author_id?: string;
  author_name: string;
  author_email: string;
  committer_name?: string;
  committer_email?: string;
  parent_sha?: string;
  tree_sha?: string;
  files_changed: number;
  additions: number;
  deletions: number;
  created_at: string;
}

export interface WorkingDirectoryFile {
  id: string;
  repository_id: string;
  user_id: string;
  file_path: string;
  content?: string;
  change_type: 'added' | 'modified' | 'deleted' | 'renamed';
  is_staged: boolean;
  additions: number;
  deletions: number;
  created_at: string;
  updated_at: string;
}

// Placeholder services (not used, but kept for compatibility)
export const repositoryService = {
  async create() { throw new Error('Use local storage instead'); },
  async getAll() { throw new Error('Use local storage instead'); },
  async getById() { throw new Error('Use local storage instead'); },
  async update() { throw new Error('Use local storage instead'); },
  async delete() { throw new Error('Use local storage instead'); }
};

export const branchService = {
  async create() { throw new Error('Use local storage instead'); },
  async getByRepository() { throw new Error('Use local storage instead'); },
  async update() { throw new Error('Use local storage instead'); },
  async delete() { throw new Error('Use local storage instead'); }
};

export const commitService = {
  async create() { throw new Error('Use local storage instead'); },
  async getByRepository() { throw new Error('Use local storage instead'); },
  async getById() { throw new Error('Use local storage instead'); }
};

export const workingDirectoryService = {
  async addFile() { throw new Error('Use local storage instead'); },
  async getFiles() { throw new Error('Use local storage instead'); },
  async stageFile() { throw new Error('Use local storage instead'); },
  async unstageFile() { throw new Error('Use local storage instead'); },
  async stageAllFiles() { throw new Error('Use local storage instead'); },
  async unstageAllFiles() { throw new Error('Use local storage instead'); },
  async deleteFile() { throw new Error('Use local storage instead'); }
};