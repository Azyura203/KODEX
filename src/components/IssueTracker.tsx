import React, { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Plus, 
  MessageSquare, 
  User, 
  Calendar,
  Tag,
  Search,
  Filter,
  X
} from 'lucide-react';
import { clsx } from 'clsx';

interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'closed' | 'in-progress';
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'bug' | 'feature' | 'documentation' | 'question';
  author: string;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
  comments: number;
  labels: string[];
}

interface IssueTrackerProps {
  issues: Issue[];
  onCreateIssue?: (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => void;
  onUpdateIssue?: (issueId: string, updates: Partial<Issue>) => void;
}

export default function IssueTracker({ issues, onCreateIssue, onUpdateIssue }: IssueTrackerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('open');
  const [searchQuery, setSearchQuery] = useState('');
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    type: 'bug' as const,
    labels: [] as string[]
  });

  const filteredIssues = issues.filter(issue => {
    const matchesFilter = filter === 'all' || issue.status === filter;
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status: Issue['status']) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="text-red-500" size={16} />;
      case 'closed':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'in-progress':
        return <Clock className="text-yellow-500" size={16} />;
    }
  };

  const getPriorityColor = (priority: Issue['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    }
  };

  const getTypeColor = (type: Issue['type']) => {
    switch (type) {
      case 'bug':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'feature':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'documentation':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      case 'question':
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400';
    }
  };

  const handleCreateIssue = () => {
    if (!newIssue.title.trim()) return;

    const issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'comments'> = {
      ...newIssue,
      status: 'open',
      author: 'Current User',
      assignee: undefined
    };

    onCreateIssue?.(issue);
    setNewIssue({
      title: '',
      description: '',
      priority: 'medium',
      type: 'bug',
      labels: []
    });
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Issues
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Track bugs, features, and documentation improvements
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
        >
          <Plus size={16} />
          New Issue
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Issues</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Create Issue Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Create New Issue
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newIssue.title}
                onChange={(e) => setNewIssue(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief description of the issue"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={newIssue.description}
                onChange={(e) => setNewIssue(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the issue..."
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Type
                </label>
                <select
                  value={newIssue.type}
                  onChange={(e) => setNewIssue(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bug">Bug</option>
                  <option value="feature">Feature Request</option>
                  <option value="documentation">Documentation</option>
                  <option value="question">Question</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Priority
                </label>
                <select
                  value={newIssue.priority}
                  onChange={(e) => setNewIssue(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={handleCreateIssue}
                disabled={!newIssue.title.trim()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Create Issue
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issues List */}
      <div className="space-y-3">
        {filteredIssues.map((issue) => (
          <div
            key={issue.id}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              {getStatusIcon(issue.status)}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                      {issue.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', getTypeColor(issue.type))}>
                        {issue.type}
                      </span>
                      <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', getPriorityColor(issue.priority))}>
                        {issue.priority}
                      </span>
                      {issue.labels.map((label) => (
                        <span
                          key={label}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs"
                        >
                          {label}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                      {issue.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <User size={12} />
                        <span>{issue.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare size={12} />
                        <span>{issue.comments} comments</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {issue.assignee && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <User size={12} />
                        <span>{issue.assignee}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredIssues.length === 0 && (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <AlertCircle className="mx-auto mb-4 text-slate-400" size={48} />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              {searchQuery ? 'No matching issues' : 'No issues yet'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms or filters'
                : 'Create your first issue to start tracking bugs and feature requests.'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Create First Issue
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}