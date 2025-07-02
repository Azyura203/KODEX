import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface GitHubContentProps {
  repo: string;
  path: string;
  fallbackContent?: string;
}

interface GitHubFile {
  content: string;
  sha: string;
  size: number;
  name: string;
  path: string;
  encoding: string;
}

export default function GitHubContent({ repo, path, fallbackContent }: GitHubContentProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);

        // GitHub API endpoint
        const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;
        
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'KaneDocs',
          },
        });

        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }

        const data: GitHubFile = await response.json();
        
        if (data.encoding === 'base64') {
          const decodedContent = atob(data.content.replace(/\n/g, ''));
          setContent(decodedContent);
        } else {
          setContent(data.content);
        }
      } catch (err) {
        console.error('Error fetching GitHub content:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch content');
        
        // Use fallback content if available
        if (fallbackContent) {
          setContent(fallbackContent);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [repo, path, fallbackContent]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <Loader className="animate-spin" size={20} />
          <span>Loading content...</span>
        </div>
      </div>
    );
  }

  if (error && !content) {
    return (
      <div className="flex items-center gap-3 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
        <div>
          <h3 className="font-medium text-red-800 dark:text-red-200">Failed to load content</h3>
          <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {error && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Using fallback content. GitHub API error: {error}
          </p>
        </div>
      )}
      <MarkdownRenderer content={content} />
    </div>
  );
}