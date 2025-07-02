import React from 'react';
import { Github, ExternalLink, Star, GitFork, Calendar } from 'lucide-react';

interface ProjectCardProps {
  name: string;
  description: string;
  githubUrl: string;
  liveUrl?: string;
  stars?: number;
  forks?: number;
  language: string;
  lastUpdated: string;
  topics?: string[];
}

export default function ProjectCard({
  name,
  description,
  githubUrl,
  liveUrl,
  stars = 0,
  forks = 0,
  language,
  lastUpdated,
  topics = []
}: ProjectCardProps) {
  const languageColors: Record<string, string> = {
    JavaScript: 'bg-yellow-400',
    TypeScript: 'bg-blue-500',
    Python: 'bg-green-500',
    React: 'bg-cyan-400',
    Vue: 'bg-green-400',
    Svelte: 'bg-orange-500',
    Go: 'bg-cyan-500',
    Rust: 'bg-orange-600',
    Java: 'bg-red-500',
    'C++': 'bg-blue-600',
    PHP: 'bg-purple-500',
    Ruby: 'bg-red-600',
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Topics */}
      {topics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {topics.slice(0, 3).map((topic) => (
            <span
              key={topic}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
            >
              {topic}
            </span>
          ))}
          {topics.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-full">
              +{topics.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <div className={`w-3 h-3 rounded-full ${languageColors[language] || 'bg-gray-400'}`} />
          <span>{language}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star size={14} />
          <span>{stars}</span>
        </div>
        <div className="flex items-center gap-1">
          <GitFork size={14} />
          <span>{forks}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>{lastUpdated}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
        >
          <Github size={16} />
          View Code
        </a>
        {liveUrl && (
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            <ExternalLink size={16} />
            Live Demo
          </a>
        )}
      </div>
    </div>
  );
}