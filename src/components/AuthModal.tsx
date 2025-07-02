import React, { useState } from 'react';
import { X, User, Mail, Lock, Eye, EyeOff, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { authService, sessionManager } from '../lib/supabase';
import { notificationManager } from './SimpleNotification';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    
    if (isSignUp && !fullName.trim()) {
      newErrors.fullName = 'Full name is required for sign up';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});

    try {
      if (isSignUp) {
        const { data } = await authService.signUp(email, password, fullName);
        
        if (data.user && !data.session) {
          // Email confirmation required
          setEmailSent(true);
          notificationManager.success(
            'Account Created! 🎉',
            `Welcome to KODEX! We've sent a confirmation email to ${email}.`,
            6000
          );
        } else if (data.session) {
          // User is automatically signed in
          sessionManager.saveSession(data.session);
          notificationManager.success(
            `Welcome to KODEX, ${fullName}! 🎉`,
            'Your account has been created and you are now signed in.',
            4000
          );
          onSuccess();
          onClose();
          
          // Redirect to projects page after successful signup
          setTimeout(() => {
            window.location.href = '/projects';
          }, 1000);
        }
      } else {
        const { data } = await authService.signIn(email, password);
        
        if (data.session) {
          sessionManager.saveSession(data.session);
          
          // Don't show notification here - let AuthButton handle it to avoid duplicates
          onSuccess();
          onClose();
          
          // Redirect to projects page after successful login
          setTimeout(() => {
            window.location.href = '/projects';
          }, 500);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      
      let friendlyMessage = errorMessage;
      if (errorMessage.includes('Invalid login credentials')) {
        friendlyMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (errorMessage.includes('Email not confirmed')) {
        friendlyMessage = 'Please check your email and click the confirmation link before signing in.';
      } else if (errorMessage.includes('User already registered')) {
        friendlyMessage = 'An account with this email already exists. Try signing in instead.';
      }
      
      notificationManager.error('Authentication Failed', friendlyMessage, 6000);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setShowPassword(false);
    setEmailSent(false);
    setErrors({});
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 pb-4 px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
          
          <div className="text-center text-white">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold font-display">K</span>
            </div>
            <h2 className="text-xl font-bold mb-1 font-display">
              {emailSent ? 'Check Your Email' : (isSignUp ? 'Join KODEX' : 'Welcome Back')}
            </h2>
            <p className="text-white/80 text-sm">
              {emailSent ? 'Verification email sent' : (isSignUp ? 'Create your free account' : 'Sign in to continue')}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {emailSent ? (
            /* Success State */
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                Account Created Successfully!
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                We've sent a verification email to <strong>{email}</strong>. 
                Please check your inbox and click the confirmation link.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setEmailSent(false);
                    setIsSignUp(false);
                    resetForm();
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors font-medium"
                >
                  Sign In Instead
                </button>
                <button
                  onClick={onClose}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.fullName ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                      }`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.fullName}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.email ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.password ? 'border-red-300 dark:border-red-600' : 'border-slate-300 dark:border-slate-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.password}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Must be at least 6 characters long
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  <>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer */}
          {!emailSent && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={toggleMode}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors hover:underline"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
              
              {isSignUp && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}