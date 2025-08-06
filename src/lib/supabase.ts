import { createClient } from '@supabase/supabase-js';

// Get Supabase configuration from environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL || 'https://ihsabhhmussuyoibfmxw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imloc2FiaGhtdXNzdXlvaWJmbXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODU5NTMsImV4cCI6MjA2Njk2MTk1M30.IbGPus17lyScuMqd7q77PT5cBj96Eu4wVjT4Se5ju2M';

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'kodex-auth',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'kodex-app'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Enhanced session management utilities
export const sessionManager = {
  // Save session to localStorage with error handling
  saveSession(session: any) {
    if (typeof window !== 'undefined' && session) {
      try {
        const sessionData = {
          user: session.user,
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
          expires_in: session.expires_in,
          token_type: session.token_type,
          saved_at: Date.now()
        };
        
        localStorage.setItem('kodex-session', JSON.stringify(sessionData));
        localStorage.setItem('kodex-auth-timestamp', Date.now().toString());
        localStorage.setItem('kodex-session-active', 'true');
        
        console.log('Session saved successfully');
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }
  },

  // Get session from localStorage with validation
  getStoredSession() {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem('kodex-session');
      if (!stored) return null;
      
      const session = JSON.parse(stored);
      
      // Validate session structure
      if (!session.user || !session.access_token) {
        console.warn('Invalid session structure, clearing...');
        this.clearSession();
        return null;
      }
      
      // Check if session is expired
      if (session.expires_at && Date.now() / 1000 > session.expires_at) {
        console.log('Session expired, clearing...');
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
      try {
        localStorage.removeItem('kodex-session');
        localStorage.removeItem('kodex-auth');
        localStorage.removeItem('kodex-auth-timestamp');
        localStorage.removeItem('kodex-session-active');
        console.log('Session cleared successfully');
      } catch (error) {
        console.error('Error clearing session:', error);
      }
    }
  },

  // Check if user is authenticated with retry logic
  async isAuthenticated() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error checking authentication:', error);
        return false;
      }
      
      return !!session?.user;
    } catch (error) {
      console.error('Network error checking authentication:', error);
      
      // Fallback to stored session
      const storedSession = this.getStoredSession();
      return !!storedSession?.user;
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

  // Initialize session on app start with better error handling
  async initializeSession() {
    try {
      console.log('Initializing session...');
      
      // First try to get current session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Supabase session error:', error);
        
        // Try stored session as fallback
        const storedSession = this.getStoredSession();
        if (storedSession) {
          console.log('Using stored session as fallback');
          return storedSession;
        }
        
        return null;
      }
      
      if (session) {
        console.log('Active Supabase session found');
        this.saveSession(session);
        return session;
      }
      
      // Try to get from localStorage if Supabase doesn't have it
      const storedSession = this.getStoredSession();
      if (storedSession && storedSession.refresh_token) {
        console.log('Attempting to refresh stored session...');
        
        try {
          const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession({
            refresh_token: storedSession.refresh_token
          });
          
          if (refreshError) {
            console.error('Session refresh failed:', refreshError);
            this.clearSession();
            return null;
          }
          
          if (refreshedSession) {
            console.log('Session refreshed successfully');
            this.saveSession(refreshedSession);
            return refreshedSession;
          }
        } catch (refreshErr) {
          console.error('Network error during session refresh:', refreshErr);
          // Keep stored session for offline use
          return storedSession;
        }
      }
      
      console.log('No valid session found');
      return null;
    } catch (error) {
      console.error('Error initializing session:', error);
      
      // Try stored session as last resort
      const storedSession = this.getStoredSession();
      if (storedSession) {
        console.log('Using stored session due to initialization error');
        return storedSession;
      }
      
      this.clearSession();
      return null;
    }
  }
};

// Enhanced authentication service with better error handling
export const authService = {
  async signUp(email: string, password: string, fullName?: string) {
    try {
      console.log('Attempting sign up for:', email);
      
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
      
      if (error) {
        console.error('Sign up error:', error);
        throw error;
      }
      
      console.log('Sign up successful:', !!data.user);
      
      // Save session if sign up was successful and user is confirmed
      if (data.session) {
        sessionManager.saveSession(data.session);
      }
      
      return { data };
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    }
  },

  async signIn(email: string, password: string) {
    try {
      console.log('Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }
      
      console.log('Sign in successful:', !!data.user);
      
      // Save session on successful sign in
      if (data.session) {
        sessionManager.saveSession(data.session);
      }
      
      return { data };
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  },

  async signOut() {
    try {
      console.log('Attempting sign out...');
      
      const { error } = await supabase.auth.signOut();
      
      // Clear session regardless of Supabase response
      sessionManager.clearSession();
      
      if (error) {
        console.error('Sign out error:', error);
        // Don't throw error for sign out - just log it
      }
      
      console.log('Sign out completed');
    } catch (error) {
      console.error('Sign out failed:', error);
      // Still clear session even if network request fails
      sessionManager.clearSession();
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error getting current user:', error);
        
        // Try to get from stored session as fallback
        const storedSession = sessionManager.getStoredSession();
        return storedSession?.user || null;
      }
      
      return user;
    } catch (error) {
      console.error('Network error getting current user:', error);
      
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
    try {
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
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  },

  async resetPassword(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  },

  async updatePassword(newPassword: string) {
    try {
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
    } catch (error) {
      console.error('Password update failed:', error);
      throw error;
    }
  },

  // Test connection to Supabase
  async testConnection() {
    try {
      console.log('Testing Supabase connection...');
      console.log('URL:', supabaseUrl);
      console.log('Key:', supabaseAnonKey ? 'Present' : 'Missing');
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Connection test failed:', error);
        return { success: false, error: error.message };
      }
      
      console.log('Connection test successful');
      return { success: true, session: data.session };
    } catch (error) {
      console.error('Network error during connection test:', error);
      return { success: false, error: 'Network error' };
    }
  }
};

// Set up auth state listener with better error handling
let authListenerSetup = false;
if (typeof window !== 'undefined' && !authListenerSetup) {
  console.log('Setting up auth state listener...');
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state change:', event, !!session);
    
    try {
      if (event === 'SIGNED_IN' && session) {
        sessionManager.saveSession(session);
      } else if (event === 'SIGNED_OUT') {
        sessionManager.clearSession();
      } else if (event === 'TOKEN_REFRESHED' && session) {
        sessionManager.saveSession(session);
      } else if (event === 'USER_UPDATED' && session) {
        sessionManager.saveSession(session);
      }
    } catch (error) {
      console.error('Error handling auth state change:', error);
    }
  });
  
  authListenerSetup = true;
  
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    subscription.unsubscribe();
  });
}

// Database service placeholders (using local storage instead)
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

// Export types for compatibility
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