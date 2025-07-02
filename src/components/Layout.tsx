import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { NotificationContainer, notificationManager } from './SimpleNotification';
import { sessionManager } from '../lib/supabase';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export default function Layout({ children, showSidebar = true }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true);
    
    // Initialize session on app start
    sessionManager.initializeSession().catch(console.error);
    
    // Reset notification session to prevent stale notifications
    notificationManager.resetSession();
  }, []);

  // Load sidebar state from localStorage
  useEffect(() => {
    if (!mounted) return;
    
    const savedState = localStorage.getItem('sidebarOpen');
    if (savedState !== null) {
      setIsSidebarOpen(savedState === 'true');
    }
  }, [mounted]);

  // Save sidebar state to localStorage
  useEffect(() => {
    if (!mounted) return;
    
    localStorage.setItem('sidebarOpen', isSidebarOpen.toString());
  }, [isSidebarOpen, mounted]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!mounted) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mounted]);

  // Handle page transitions
  useEffect(() => {
    const handleTransitionStart = () => setIsTransitioning(true);
    const handleTransitionEnd = () => setIsTransitioning(false);

    // Listen for navigation events
    window.addEventListener('beforeunload', handleTransitionStart);
    window.addEventListener('load', handleTransitionEnd);
    
    // Custom navigation events
    window.addEventListener('navigation', handleTransitionStart);
    
    // End transition after a delay
    const transitionTimer = setTimeout(handleTransitionEnd, 300);

    return () => {
      window.removeEventListener('beforeunload', handleTransitionStart);
      window.removeEventListener('load', handleTransitionEnd);
      window.removeEventListener('navigation', handleTransitionStart);
      clearTimeout(transitionTimer);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-pulse flex items-center justify-center">
            <span className="text-white font-bold text-lg font-display">K</span>
          </div>
          <span className="text-slate-600 dark:text-slate-400 font-medium">Loading KODEX...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white dark:bg-slate-900 transition-all duration-300 ${isTransitioning ? 'opacity-95' : 'opacity-100'}`}>
      <Header 
        onSidebarToggle={showSidebar ? toggleSidebar : undefined}
        isSidebarOpen={showSidebar ? isSidebarOpen : false}
        onMenuToggle={showSidebar ? toggleMobileMenu : undefined}
        isMenuOpen={showSidebar ? isMobileMenuOpen : false}
      />

      <div className="flex">
        {showSidebar && (
          <Sidebar 
            isOpen={isMobileMenuOpen}
            onClose={closeMobileMenu}
            isCollapsed={!isSidebarOpen}
          />
        )}

        <main className={`flex-1 min-w-0 transition-all duration-300 ${
          showSidebar && isSidebarOpen ? 'lg:ml-0' : 'lg:ml-0'
        } ${isTransitioning ? 'transform scale-[0.99]' : 'transform scale-100'}`}>
          <div className="transition-all duration-300">
            {children}
          </div>
        </main>
      </div>

      {/* Notification Container - Only render once */}
      <NotificationContainer />
      
      {/* Page transition overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-sm z-50 pointer-events-none transition-opacity duration-300" />
      )}
    </div>
  );
}