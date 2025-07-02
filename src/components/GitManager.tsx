import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  GitCommit, 
  GitMerge, 
  Plus, 
  Minus, 
  FileText, 
  Folder, 
  Check, 
  X, 
  Clock, 
  User, 
  Calendar,
  Upload,
  Download,
  RefreshCw,
  Settings,
  Terminal,
  Eye,
  Edit3,
  Trash2,
  Copy,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  GitPullRequest,
  Filter,
  Search,
  MoreHorizontal,
  ChevronDown
} from 'lucide-react';
import { clsx } from 'clsx';

interface FileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
  staged: boolean;
}

interface Commit {
  id: string;
  message: string;
  author: string;
  date: string;
  files: number;
  additions: number;
  deletions: number;
}

interface Branch {
  name: string;
  current: boolean;
  lastCommit: string;
  ahead: number;
  behind: number;
}

export default function GitManager() {
  const [currentBranch, setCurrentBranch] = useState('main');
  const [branches, setBranches] = useState<Branch[]>([
    { name: 'main', current: true, lastCommit: 'just now', ahead: 0, behind: 0 }
  ]);
  
  const [fileChanges, setFileChanges] = useState<FileChange[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [commitMessage, setCommitMessage] = useState('');
  const [commitDescription, setCommitDescription] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [showNewBranch, setShowNewBranch] = useState(false);
  const [activeTab, setActiveTab] = useState<'changes' | 'history' | 'branches'>('changes');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'staged' | 'unstaged'>('all');
  const [showCommitOptions, setShowCommitOptions] = useState(false);

  const stagedFiles = fileChanges.filter(file => file.staged);
  const unstagedFiles = fileChanges.filter(file => !file.staged);

  // Filter files based on search and status
  const filteredFiles = fileChanges.filter(file => {
    const matchesSearch = file.path.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'staged' && file.staged) ||
      (filterStatus === 'unstaged' && !file.staged);
    return matchesSearch && matchesFilter;
  });

  const toggleFileStaging = (path: string) => {
    setFileChanges(prev => 
      prev.map(file => 
        file.path === path ? { ...file, staged: !file.staged } : file
      )
    );
  };

  const stageAllFiles = () => {
    setFileChanges(prev => prev.map(file => ({ ...file, staged: true })));
  };

  const unstageAllFiles = () => {
    setFileChanges(prev => prev.map(file => ({ ...file, staged: false })));
  };

  const handleCommit = () => {
    if (!commitMessage.trim() || stagedFiles.length === 0) return;

    const newCommit: Commit = {
      id: Math.random().toString(36).substr(2, 7),
      message: commitMessage,
      author: 'You',
      date: 'just now',
      files: stagedFiles.length,
      additions: stagedFiles.reduce((sum, file) => sum + file.additions, 0),
      deletions: stagedFiles.reduce((sum, file) => sum + file.deletions, 0)
    };

    setCommits(prev => [newCommit, ...prev]);
    setFileChanges(prev => prev.filter(file => !file.staged));
    setCommitMessage('');
    setCommitDescription('');
    setShowCommitOptions(false);
  };

  const createBranch = () => {
    if (!newBranchName.trim()) return;

    const newBranch: Branch = {
      name: newBranchName,
      current: false,
      lastCommit: 'just now',
      ahead: 0,
      behind: 0
    };

    setBranches(prev => [...prev, newBranch]);
    setNewBranchName('');
    setShowNewBranch(false);
  };

  const switchBranch = (branchName: string) => {
    setBranches(prev => 
      prev.map(branch => ({
        ...branch,
        current: branch.name === branchName
      }))
    );
    setCurrentBranch(branchName);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'added':
        return <Plus className="text-green-500" size={16} />;
      case 'modified':
        return <FileText className="text-yellow-500" size={16} />;
      case 'deleted':
        return <Minus className="text-red-500" size={16} />;
      default:
        return <FileText className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'added':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'modified':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'deleted':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  // Function to handle pull operation
  const handlePull = () => {
    alert("Pull operation would fetch and merge changes from remote repository");
  };

  // Function to handle push operation
  const handlePush = () => {
    alert("Push operation would upload local commits to remote repository");
  };

  // Function to handle sync operation
  const handleSync = () => {
    alert("Sync operation would synchronize local and remote repositories");
    setShowCommitOptions(false);
  };

  // Function to handle repository settings
  const handleRepoSettings = () => {
    alert("Repository settings would allow configuration of repository options");
    setShowCommitOptions(false);
  };

  // Function to handle terminal
  const handleOpenTerminal = () => {
    alert("Terminal would allow running git commands directly");
    setShowCommitOptions(false);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Enhanced Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg">
                <GitBranch className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Git Manager
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your repository like GitHub
                </p>
              </div>
            </div>
            
            {/* Enhanced Action Bar */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <GitBranch size={16} className="text-gray-500" />
                <span className="font-medium text-gray-900 dark:text-white">{currentBranch}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePull}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  <Download size={16} />
                  Pull
                </button>
                
                <button 
                  onClick={handlePush}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                >
                  <Upload size={16} />
                  Push
                </button>

                <div className="relative">
                  <button 
                    onClick={() => setShowCommitOptions(!showCommitOptions)}
                    className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
                  >
                    <MoreHorizontal size={16} />
                  </button>

                  {showCommitOptions && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10">
                      <button 
                        onClick={handleSync}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <RefreshCw size={14} />
                        Sync Changes
                      </button>
                      <button 
                        onClick={handleRepoSettings}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Settings size={14} />
                        Repository Settings
                      </button>
                      <button 
                        onClick={handleOpenTerminal}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Terminal size={14} />
                        Open Terminal
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Tab Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
              {[
                { id: 'changes', label: 'Changes', icon: <FileText size={16} />, count: fileChanges.length },
                { id: 'history', label: 'History', icon: <Clock size={16} />, count: commits.length },
                { id: 'branches', label: 'Branches', icon: <GitBranch size={16} />, count: branches.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={clsx(
                      'px-2 py-0.5 text-xs rounded-full font-medium',
                      activeTab === tab.id
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                    )}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search and Filter */}
            {activeTab === 'changes' && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Files</option>
                  <option value="staged">Staged</option>
                  <option value="unstaged">Unstaged</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'changes' && (
          <div className="h-full flex">
            {/* Empty State for Changes */}
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md p-8">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Working Directory Clean
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  There are no changes to commit. Create or modify files to start tracking changes.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    <Plus size={16} />
                    Create File
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Edit3 size={16} />
                    Modify File
                  </button>
                </div>
              </div>
            </div>

            {/* Commit Panel */}
            <div className="w-96 flex flex-col bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <GitCommit size={16} />
                  Commit Changes
                </h3>
              </div>

              <div className="flex-1 p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Commit message *
                  </label>
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="feat: add new feature"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Use conventional commits: feat, fix, docs, style, refactor, test, chore
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={commitDescription}
                    onChange={(e) => setCommitDescription(e.target.value)}
                    placeholder="Add more details about this commit..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Commit summary:
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Files changed:</span>
                      <span className="font-medium">{stagedFiles.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Additions:</span>
                      <span className="text-green-600 font-medium">
                        +{stagedFiles.reduce((sum, file) => sum + file.additions, 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Deletions:</span>
                      <span className="text-red-600 font-medium">
                        -{stagedFiles.reduce((sum, file) => sum + file.deletions, 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCommit}
                  disabled={!commitMessage.trim() || stagedFiles.length === 0}
                  className={clsx(
                    'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all',
                    commitMessage.trim() && stagedFiles.length > 0
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  )}
                >
                  <GitCommit size={16} />
                  Commit to {currentBranch}
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Stage files to enable committing
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-6">
            {/* Empty State for History */}
            <div className="text-center py-12">
              <Clock className="mx-auto mb-4 text-slate-400" size={48} />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No Commit History
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Your commit history will appear here after you make your first commit.
              </p>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Create First Commit
              </button>
            </div>
          </div>
        )}

        {activeTab === 'branches' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Branches ({branches.length})
              </h3>
              <button
                onClick={() => setShowNewBranch(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                <Plus size={16} />
                New Branch
              </button>
            </div>

            {showNewBranch && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Create new branch
                </h4>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    placeholder="feature/new-feature"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={createBranch}
                    disabled={!newBranchName.trim()}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setShowNewBranch(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {branches.map((branch) => (
                <div
                  key={branch.name}
                  className={clsx(
                    'flex items-center justify-between p-4 border rounded-lg transition-all',
                    branch.current
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <GitBranch 
                      size={16} 
                      className={branch.current ? 'text-green-600' : 'text-gray-600 dark:text-gray-400'} 
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {branch.name}
                        </span>
                        {branch.current && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full">
                            current
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>Last commit {branch.lastCommit}</span>
                        {(branch.ahead > 0 || branch.behind > 0) && (
                          <div className="flex items-center gap-2">
                            {branch.ahead > 0 && (
                              <span className="text-green-600">↑{branch.ahead}</span>
                            )}
                            {branch.behind > 0 && (
                              <span className="text-red-600">↓{branch.behind}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!branch.current && (
                      <button
                        onClick={() => switchBranch(branch.name)}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        Switch
                      </button>
                    )}
                    {branch.name !== 'main' && (
                      <button className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {showCommitOptions && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowCommitOptions(false)}
        />
      )}
    </div>
  );
}