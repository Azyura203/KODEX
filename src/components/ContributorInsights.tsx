import React from 'react';
import { User, GitCommit, TrendingUp, Calendar, Award, Star } from 'lucide-react';

interface Contributor {
  name: string;
  email: string;
  avatar?: string;
  commits: number;
  additions: number;
  deletions: number;
  firstCommit: string;
  lastCommit: string;
}

interface ProjectStats {
  totalCommits: number;
  totalContributors: number;
  totalFiles: number;
  totalLines: number;
  activeBranches: number;
  lastUpdate: string;
  languages: { [key: string]: number };
}

interface ContributorInsightsProps {
  contributors: Contributor[];
  stats: ProjectStats | null;
}

export default function ContributorInsights({ contributors, stats }: ContributorInsightsProps) {
  const sortedContributors = [...contributors].sort((a, b) => b.commits - a.commits);
  const topContributor = sortedContributors[0];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      'Markdown': 'bg-blue-500',
      'TypeScript': 'bg-blue-600',
      'JavaScript': 'bg-yellow-500',
      'JSON': 'bg-green-500',
      'YAML': 'bg-purple-500'
    };
    return colors[language] || 'bg-gray-500';
  };

  return (
    <div className="p-4 space-y-6">
      {/* Project Overview */}
      {stats && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp size={16} />
            Project Stats
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalCommits}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Commits</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalFiles}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Files</p>
            </div>
          </div>

          {/* Language Distribution */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Languages
            </h4>
            <div className="space-y-1">
              {Object.entries(stats.languages).map(([language, percentage]) => (
                <div key={language} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getLanguageColor(language)}`}></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 flex-1">
                    {language}
                  </span>
                  <span className="text-xs text-gray-900 dark:text-white font-medium">
                    {percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Contributor */}
      {topContributor && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Award className="text-yellow-600" size={16} />
            Top Contributor
          </h3>
          
          <div className="flex items-center gap-3">
            <img
              src={topContributor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(topContributor.name)}&size=48`}
              alt={topContributor.name}
              className="w-12 h-12 rounded-full border-2 border-yellow-300"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                {topContributor.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {topContributor.commits} commits
              </p>
            </div>
            <Star className="text-yellow-500" size={20} />
          </div>
        </div>
      )}

      {/* All Contributors */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <User size={16} />
            Contributors ({contributors.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {sortedContributors.map((contributor, index) => (
            <div key={contributor.email} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={contributor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.name)}&size=40`}
                    alt={contributor.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {contributor.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {contributor.email}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                    <GitCommit size={14} />
                    <span className="font-medium">{contributor.commits}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span className="text-green-600">+{contributor.additions}</span>
                    <span className="text-red-600">-{contributor.deletions}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>First: {formatDate(contributor.firstCommit)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>Last: {formatDate(contributor.lastCommit)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}