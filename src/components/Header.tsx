import React, { useState, useEffect, useCallback } from 'react';
import { Search, Moon, Sun, Github, PanelLeftClose, PanelLeft } from 'lucide-react';
import SearchModal from './SearchModal';
import AuthButton from './AuthButton';

interface HeaderProps {
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
}

export default function Header({ onMenuToggle, isMenuOpen, onSidebarToggle, isSidebarOpen }: HeaderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  }, [theme]);

  // Use useCallback for event listeners
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsSearchOpen(true);
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      onSidebarToggle?.();
    }
  }, [onSidebarToggle]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transition-all duration-200">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle */}
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-105"
              aria-label="Toggle menu"
            >
              <div className="relative w-5 h-5">
                <span className={`absolute block h-0.5 w-5 bg-current transform transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : 'translate-y-0'}`} />
                <span className={`absolute block h-0.5 w-5 bg-current transform transition-all duration-300 translate-y-2 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
                <span className={`absolute block h-0.5 w-5 bg-current transform transition-all duration-300 ${isMenuOpen ? '-rotate-45 translate-y-2' : 'translate-y-4'}`} />
              </div>
            </button>
          )}

          {/* Sidebar toggle for desktop */}
          {onSidebarToggle && (
            <button
              onClick={onSidebarToggle}
              className="hidden lg:flex p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-105 group"
              aria-label="Toggle sidebar"
              title={`${isSidebarOpen ? 'Hide' : 'Show'} sidebar (⌘B)`}
            >
              <div className="transition-transform duration-200 group-hover:scale-110">
                {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
              </div>
            </button>
          )}
          
          {/* Enhanced Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg shadow-blue-500/25">
                <span className="text-white font-bold text-lg font-display tracking-tight">K</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
            </div>
            <h1 className="text-xl font-bold font-display bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
              KODEX
            </h1>
          </div>
        </div>

        {/* Center - Enhanced Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 text-left group hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600"
          >
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">
              <Search size={16} className="transition-transform duration-200 group-hover:scale-110" />
              <span className="text-sm">Search documentation...</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-xs text-slate-500 dark:text-slate-400 font-mono shadow-sm">
                ⌘K
              </kbd>
            </div>
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Mobile search */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-105"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
          
          {/* Theme toggle with enhanced animation */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-105 group"
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <div className="relative w-5 h-5">
              <Moon 
                size={18} 
                className={`absolute inset-0 transition-all duration-300 ${
                  theme === 'light' 
                    ? 'opacity-100 rotate-0 scale-100' 
                    : 'opacity-0 rotate-90 scale-0'
                }`} 
              />
              <Sun 
                size={18} 
                className={`absolute inset-0 transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'opacity-100 rotate-0 scale-100' 
                    : 'opacity-0 -rotate-90 scale-0'
                }`} 
              />
            </div>
          </button>
          
          {/* GitHub link - Fixed with stable key */}
            {/* <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-105 group text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            aria-label="View on GitHub"
            title="View on GitHub"
            >
            <Github size={18} className="transition-transform duration-200 group-hover:scale-110" />
          </a> */}
            

          {/* Auth Button */}
          <AuthButton />

          {/* Sidebar toggle hint for desktop */}
          {onSidebarToggle && (
            <div className="hidden xl:flex items-center gap-1 ml-2 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-500 dark:text-slate-400 transition-all duration-200 hover:bg-slate-200 dark:hover:bg-slate-700">
              <kbd className="px-1 py-0.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs">
                ⌘B
              </kbd>
              <span>Toggle</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="md:hidden px-4 pb-3">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
        >
          <Search size={16} />
          <span className="text-sm">Search documentation...</span>
        </button>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}