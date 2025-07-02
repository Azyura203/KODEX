import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, Hash, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

interface SearchResult {
  title: string;
  content: string;
  url: string;
  type: 'page' | 'heading' | 'content';
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockSearchResults: SearchResult[] = [
  {
    title: 'Getting Started',
    content: 'Quick setup guide for KaneDocs',
    url: '/getting-started',
    type: 'page'
  },
  {
    title: 'Installation',
    content: 'How to install and configure KaneDocs',
    url: '/getting-started#installation',
    type: 'heading'
  },
  {
    title: 'API Reference',
    content: 'Complete API documentation and examples',
    url: '/api',
    type: 'page'
  },
  {
    title: 'Configuration Options',
    content: 'Customize your documentation site',
    url: '/getting-started#configuration',
    type: 'heading'
  },
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim()) {
      // Simple mock search - in a real app, this would be a proper search implementation
      const filtered = mockSearchResults.filter(
        result =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.content.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      window.location.href = results[selectedIndex].url;
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <Search className="text-gray-400" size={20} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search documentation..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none text-lg"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {query && results.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Search size={48} className="mx-auto mb-4 opacity-50" />
              <p>No results found for "{query}"</p>
            </div>
          )}

          {results.map((result, index) => (
            <a
              key={index}
              href={result.url}
              onClick={onClose}
              className={clsx(
                'flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-l-4',
                index === selectedIndex
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500'
                  : 'border-transparent'
              )}
            >
              <div className="flex-shrink-0">
                {result.type === 'page' ? (
                  <FileText size={20} className="text-primary-500" />
                ) : (
                  <Hash size={20} className="text-gray-400" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                  {result.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {result.content}
                </p>
              </div>
              
              <ArrowRight size={16} className="text-gray-400 flex-shrink-0" />
            </a>
          ))}
        </div>

        {/* Footer */}
        {query && (
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs">esc</kbd>
                  Close
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}