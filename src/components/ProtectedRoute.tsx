import React, { useState, useEffect } from 'react';
import { authService, sessionManager } from '../lib/supabase';
import { Loader, Lock, User, Sparkles } from 'lucide-react';
import AuthModal from './AuthModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First try to get session from storage or initialize it
        const session = await sessionManager.initializeSession();
        if (session?.user) {
          setUser(session.user);
        } else {
          // Fallback to current user check
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Also listen for storage changes (for cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'kodex-session') {
        if (e.newValue) {
          try {
            const session = JSON.parse(e.newValue);
            setUser(session.user);
          } catch (error) {
            console.error('Error parsing session from storage:', error);
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Don't reload the page, just check auth again
    sessionManager.initializeSession().then(session => {
      if (session?.user) {
        setUser(session.user);
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <span className="text-white font-bold text-2xl font-display">K</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading KODEX...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-white font-bold text-3xl font-display">K</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 font-display">
                Authentication Required
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Please sign in to access KODEX's powerful documentation and version control features.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Lock className="text-blue-600" size={28} />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 font-display">
                    Secure Access Required
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    KODEX protects your documentation and provides personalized features through secure authentication.
                  </p>
                </div>

                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-display"
                >
                  <User size={20} />
                  Sign In / Create Account
                </button>

                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">Free Forever</span>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Lock className="text-blue-600" size={20} />
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">Secure</span>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Sparkles className="text-purple-600" size={20} />
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">AI-Powered</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  return <>{children}</>;
}