import React from 'react';
import { GitCommit, Calendar, TrendingUp } from 'lucide-react';

interface Version {
  id: string;
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
  timestamp: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  branch: string;
}

interface CommitGraphProps {
  commits: Version[];
}

export default function CommitGraph({ commits }: CommitGraphProps) {
  // Group commits by date
  const commitsByDate = commits.reduce((acc, commit) => {
    const date = new Date(commit.timestamp).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(commit);
    return acc;
  }, {} as Record<string, Version[]>);

  const dates = Object.keys(commitsByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Calculate activity metrics
  const totalCommits = commits.length;
  const totalAdditions = commits.reduce((sum, commit) => sum + commit.additions, 0);
  const totalDeletions = commits.reduce((sum, commit) => sum + commit.deletions, 0);
  const avgCommitsPerDay = totalCommits / Math.max(dates.length, 1);

  return (
    <div className="space-y-6">
      {/* Activity Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <GitCommit className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalCommits}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Commits
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                +{totalAdditions}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Added
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <TrendingUp className="text-red-600 transform rotate-180" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                -{totalDeletions}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Removed
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Calendar className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {avgCommitsPerDay.toFixed(1)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Avg/Day
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Commit Timeline */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h3>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto">
          <div className="space-y-6">
            {dates.slice(0, 5).map((date) => (
              <div key={date} className="relative">
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h4>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                    {commitsByDate[date].length} commits
                  </span>
                </div>

                {/* Commits for this date */}
                <div className="ml-6 space-y-3">
                  {commitsByDate[date].map((commit) => (
                    <div
                      key={commit.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <img
                        src={commit.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(commit.author.name)}&size=32`}
                        alt={commit.author.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {commit.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>{commit.author.name}</span>
                          <span className="font-mono">{commit.sha.substring(0, 7)}</span>
                          <span>{new Date(commit.timestamp).toLocaleTimeString()}</span>
                          <span className="text-green-600">+{commit.additions}</span>
                          <span className="text-red-600">-{commit.deletions}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Timeline line */}
                {date !== dates[dates.length - 1] && (
                  <div className="absolute left-1.5 top-8 w-0.5 h-6 bg-gray-300 dark:bg-gray-600"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}