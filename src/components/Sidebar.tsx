import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  FileText, 
  Book, 
  User, 
  Edit3, 
  FolderOpen, 
  Sparkles, 
  GitBranch, 
  Database, 
  GitCommit,
  Tag,
  AlertCircle
} from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
}

interface NavItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  children?: NavItem[];
  badge?: string;
  requiresAuth?: boolean;
}

const navigationItems: NavItem[] = [
  {
    title: 'Overview',
    icon: <Book size={16} />,
    href: '/',
  },
  {
    title: 'Projects',
    icon: <FolderOpen size={16} />,
    href: '/projects',
    requiresAuth: true,
  },
  {
    title: 'Editor',
    icon: <Edit3 size={16} />,
    href: '/editor',
    requiresAuth: true,
  },
  {
    title: 'AI Generator',
    icon: <Sparkles size={16} />,
    href: '/ai-generator',
    badge: 'AI',
    requiresAuth: true,
  },
  {
    title: 'Version Control',
    icon: <GitCommit size={16} />,
    href: '/version-control',
    badge: 'VCS',
    requiresAuth: true,
  },
  {
    title: 'Git Manager',
    icon: <GitBranch size={16} />,
    href: '/git',
    requiresAuth: true,
  },
  {
    title: 'Database Git',
    icon: <Database size={16} />,
    href: '/database-git',
    requiresAuth: true,
  },
  {
    title: 'Releases',
    icon: <Tag size={16} />,
    href: '/releases',
    requiresAuth: true,
  },
  {
    title: 'Issues',
    icon: <AlertCircle size={16} />,
    href: '/issues',
    requiresAuth: true,
  },
  {
    title: 'About',
    icon: <User size={16} />,
    href: '/about',
  },
];

function NavItemComponent({ item, level = 0, isCollapsed }: { item: NavItem; level?: number; isCollapsed?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  // Enhanced active state detection with proper URL matching
  useEffect(() => {
    const checkActive = () => {
      if (typeof window === 'undefined') return;
      
      const currentPath = window.location.pathname;
      
      // Exact match for index page
      if (item.href === '/') {
        setIsActive(currentPath === '/' || currentPath === '');
      } else {
        // For other pages, check exact match only to prevent cross-highlighting
        setIsActive(currentPath === item.href);
      }
    };

    // Initial check
    checkActive();
    
    // Create a more robust listener for URL changes
    let lastPath = window.location.pathname;
    
    // Listen for navigation events with proper cleanup
    const handleLocationChange = () => {
      // Small delay to ensure URL has updated
      setTimeout(checkActive, 50);
    };

    // Listen for popstate (back/forward buttons)
    window.addEventListener('popstate', handleLocationChange);
    
    // Listen for clicks that might trigger navigation
    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && link.href) {
        setTimeout(checkActive, 50);
      }
    };
    
    document.addEventListener('click', handleClick);
    
    // Use MutationObserver to detect URL changes from programmatic navigation
    const observer = new MutationObserver(() => {
      const currentPath = window.location.pathname;
      if (currentPath !== lastPath) {
        lastPath = currentPath;
        checkActive();
      }
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: false,
      characterData: false
    });

    // Also listen for custom navigation events
    const handleCustomNavigation = () => {
      setTimeout(checkActive, 50);
    };
    
    window.addEventListener('navigation', handleCustomNavigation);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      document.removeEventListener('click', handleClick);
      window.removeEventListener('navigation', handleCustomNavigation);
      observer.disconnect();
    };
  }, [item.href]);

  // Handle navigation with smooth transitions
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (hasChildren) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
      return;
    }

    // Add smooth transition class to body
    document.body.classList.add('page-transitioning');
    
    // Remove transition class after navigation
    setTimeout(() => {
      document.body.classList.remove('page-transitioning');
    }, 300);

    // Dispatch custom navigation event
    window.dispatchEvent(new CustomEvent('navigation'));
  };

  return (
    <div>
      <a
        href={item.href}
        onClick={handleNavigation}
        className={clsx(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
          'hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-[1.02]',
          isActive 
            ? 'bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 text-blue-600 dark:text-blue-400 shadow-sm border-l-4 border-gradient-to-b border-blue-500' 
            : 'text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border-l-4 border-transparent',
          level > 0 && 'ml-4 text-xs',
          isCollapsed && 'justify-center px-2',
        )}
        title={isCollapsed ? item.title : undefined}
      >
        <span className={clsx('flex items-center gap-3 flex-1', isCollapsed && 'justify-center')}>
          <span className={clsx(
            'text-slate-500 dark:text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-all duration-200',
            isActive && 'text-blue-500 dark:text-blue-400 scale-110'
          )}>
            {item.icon}
          </span>
          {!isCollapsed && (
            <>
              <span className="truncate font-medium">{item.title}</span>
              {item.badge && (
                <span className={clsx(
                  'px-2 py-0.5 text-white text-xs rounded-full font-medium ml-auto transition-all duration-200 shadow-sm',
                  item.badge === 'AI' && 'bg-gradient-to-r from-purple-500 to-pink-500',
                  item.badge === 'VCS' && 'bg-gradient-to-r from-blue-500 to-cyan-500',
                  isActive && 'scale-105 shadow-md'
                )}>
                  {item.badge}
                </span>
              )}
            </>
          )}
        </span>
        {hasChildren && !isCollapsed && (
          <span className="transition-transform duration-200 text-slate-400">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        )}
      </a>
      
      {hasChildren && isExpanded && !isCollapsed && (
        <div className="ml-2 mt-1 space-y-1 animate-fade-in">
          {item.children!.map((child, index) => (
            <NavItemComponent key={index} item={child} level={level + 1} isCollapsed={isCollapsed} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ isOpen = false, onClose, isCollapsed = false }: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile with smooth transition */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-all duration-300 ease-out"
          onClick={onClose}
        />
      )}

      {/* Sidebar with enhanced transitions */}
      <aside
        className={clsx(
          'fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] transform bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800/60 transition-all duration-300 ease-in-out shadow-xl',
          'lg:relative lg:top-0 lg:h-[calc(100vh-4rem)] lg:translate-x-0 lg:z-0 lg:shadow-none',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Navigation with smooth scrolling */}
          <div className="flex-1 overflow-y-auto px-3 py-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
            <nav className="space-y-1">
              {navigationItems.map((item, index) => (
                <NavItemComponent key={index} item={item} isCollapsed={isCollapsed} />
              ))}
            </nav>
          </div>

          {/* Enhanced Footer */}
          {!isCollapsed && (
            <div className="border-t border-slate-200/60 dark:border-slate-800/60 px-4 py-4 bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-blue-900/10">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Version:</span>
                  <span className="px-2 py-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-md text-xs font-medium shadow-sm">
                    v2.1.0
                  </span>
                </div>
                <div className="text-center mb-2">
                  <span className="font-bold font-display bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">KODEX</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span>Online</span>
                  </div>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    <span>Secure</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}