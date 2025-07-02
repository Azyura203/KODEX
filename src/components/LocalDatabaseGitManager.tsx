import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  GitCommit, 
  Plus, 
  Minus, 
  FileText, 
  Check, 
  Clock, 
  User, 
  Calendar,
  Upload,
  Download,
  RefreshCw,
  Eye,
  Trash2,
  Copy,
  AlertCircle,
  CheckCircle,
  Database,
  Save,
  FolderPlus,
  Star,
  GitFork,
  Lock,
  Unlock,
  Loader,
  Search,
  Filter,
  MoreHorizontal,
  Settings,
  Terminal
} from 'lucide-react';
import { clsx } from 'clsx';
import { 
  repositoryService,
  branchService,
  commitService,
  workingDirectoryService,
  getCurrentUser,
  initializeSampleData,
  type Repository,
  type Branch,
  type Commit,
  type WorkingFile
} from '../lib/localDatabase';

export default function LocalDatabaseGitManager() {
  const [user] = useState(() => getCurrentUser());
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [currentRepository, setCurrentRepository] = useState<Repository | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [workingFiles, setWorkingFiles] = useState<WorkingFile[]>([]);
  
  const [commitMessage, setCommitMessage] = useState('');
  const [commitDescription, setCommitDescription] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDescription, setNewRepoDescription] = useState('');
  const [showNewBranch, setShowNewBranch] = useState(false);
  const [showNewRepo, setShowNewRepo] = useState(false);
  const [activeTab, setActiveTab] = useState<'repositories' | 'changes' | 'history' | 'branches'>('repositories');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    initializeSampleData();
    loadRepositories();
  }, []);

  // Load repository data when current repository changes
  useEffect(() => {
    if (currentRepository) {
      loadBranches();
      loadCommits();
      loadWorkingFiles();
    }
  }, [currentRepository]);

  // Load branch data when current branch changes
  useEffect(() => {
    if (currentBranch) {
      loadCommits();
    }
  }, [currentBranch]);

  const loadRepositories = () => {
    try {
      const repos = repositoryService.getAll();
      setRepositories(repos);
      if (repos.length > 0 && !currentRepository) {
        setCurrentRepository(repos[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repositories');
    }
  };

  const loadBranches = () => {
    if (!currentRepository) return;
    
    try {
      const branchData = branchService.getByRepository(currentRepository.id);
      setBranches(branchData);
      const defaultBranch = branchData.find(b => b.isDefault) || branchData[0];
      if (defaultBranch && !currentBranch) {
        setCurrentBranch(defaultBranch);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load branches');
    }
  };

  const loadCommits = () => {
    if (!currentRepository) return;
    
    try {
      const commitData = commitService.getByRepository(currentRepository.id);
      setCommits(commitData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load commits');
    }
  };

  const loadWorkingFiles = () => {
    if (!currentRepository) return;
    
    try {
      const files = workingDirectoryService.getFiles(currentRepository.id);
      setWorkingFiles(files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load working files');
    }
  };

  const createRepository = () => {
    if (!newRepoName.trim()) return;
    
    try {
      setLoading(true);
      const repo = repositoryService.create({
        name: newRepoName,
        description: newRepoDescription,
        language: 'TypeScript'
      });
      
      setRepositories(prev => [repo, ...prev]);
      setCurrentRepository(repo);
      setNewRepoName('');
      setNewRepoDescription('');
      setShowNewRepo(false);
      loadBranches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create repository');
    } finally {
      setLoading(false);
    }
  };

  const createBranch = () => {
    if (!newBranchName.trim() || !currentRepository) return;
    
    try {
      const branch = branchService.create({
        repositoryId: currentRepository.id,
        name: newBranchName,
        isDefault: false
      });
      
      setBranches(prev => [...prev, branch]);
      setNewBranchName('');
      setShowNewBranch(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create branch');
    }
  };

  const switchBranch = (branch: Branch) => {
    setCurrentBranch(branch);
  };

  const stageFile = (file: WorkingFile) => {
    try {
      workingDirectoryService.stageFile(file.id);
      loadWorkingFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stage file');
    }
  };

  const unstageFile = (file: WorkingFile) => {
    try {
      workingDirectoryService.unstageFile(file.id);
      loadWorkingFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unstage file');
    }
  };

  const stageAllFiles = () => {
    if (!currentRepository) return;
    
    try {
      workingDirectoryService.stageAllFiles(currentRepository.id);
      loadWorkingFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stage all files');
    }
  };

  const unstageAllFiles = () => {
    if (!currentRepository) return;
    
    try {
      workingDirectoryService.unstageAllFiles(currentRepository.id);
      loadWorkingFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unstage all files');
    }
  };

  const handleCommit = () => {
    if (!commitMessage.trim() || !currentRepository || !currentBranch) return;
    
    const stagedFiles = workingFiles.filter(f => f.isStaged);
    if (stagedFiles.length === 0) return;
    
    try {
      setLoading(true);
      commitService.create(
        currentRepository.id,
        currentBranch.name,
        commitMessage,
        commitDescription || undefined
      );
      
      setCommitMessage('');
      setCommitDescription('');
      loadCommits();
      loadWorkingFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create commit');
    } finally {
      setLoading(false);
    }
  };

  const addSampleFile = () => {
    if (!currentRepository) return;
    
    try {
      const fileName = `sample-${Date.now()}.md`;
      const content = `# Sample File

This is a sample file created at ${new Date().toISOString()}.

## Features
- Local storage database
- Git-like functionality
- Real-time updates

\`\`\`javascript
console.log('Hello from KaneDocs!');
\`\`\`
`;
      
      workingDirectoryService.addFile(
        currentRepository.id,
        fileName,
        content,
        'added'
      );
      
      loadWorkingFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add sample file');
    }
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const stagedFiles = workingFiles.filter(f => f.isStaged);
  const unstagedFiles = workingFiles.filter(f => !f.isStaged);

  const getStatusIcon = (changeType: string) => {
    switch (changeType) {
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

  const getStatusColor = (changeType: string) => {
    switch (changeType) {
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

  const filteredRepositories = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Enhanced Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <Database className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Local Git Manager
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Git-like version control with local storage
                </p>
              </div>
            </div>
            
            {/* Enhanced Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-sm text-green-700 dark:text-green-300">Local Storage</span>
              </div>
              
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {user.email}
              </span>

              {currentRepository && (
                <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <GitBranch size={16} className="text-slate-500" />
                  <span className="font-medium text-slate-900 dark:text-white">
                    {currentRepository.name}
                  </span>
                  {currentBranch && (
                    <>
                      <span className="text-slate-400">/</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {currentBranch.name}
                      </span>
                    </>
                  )}
                </div>
              )}
              
              <button
                onClick={() => setShowNewRepo(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                <FolderPlus size={16} />
                <span className="hidden sm:inline">New Repository</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-300 dark:border-slate-600 rounded-lg transition-colors"
                >
                  <MoreHorizontal size={16} />
                </button>

                {showOptions && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-10">
                    <button
                      onClick={() => {
                        setShowOptions(false);
                        // Add refresh functionality
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <RefreshCw size={14} />
                      Refresh Data
                    </button>
                    <button
                      onClick={() => {
                        setShowOptions(false);
                        clearAllData();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 size={14} />
                      Clear All Data
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-red-500" size={16} />
                <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )}

          {/* New Repository Modal */}
          {showNewRepo && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h4 className="font-medium text-slate-900 dark:text-white mb-3">
                Create new repository
              </h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value)}
                  placeholder="Repository name"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <textarea
                  value={newRepoDescription}
                  onChange={(e) => setNewRepoDescription(e.target.value)}
                  placeholder="Description (optional)"
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={createRepository}
                    disabled={!newRepoName.trim() || loading}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    {loading ? 'Creating...' : 'Create Repository'}
                  </button>
                  <button
                    onClick={() => setShowNewRepo(false)}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Tab Navigation */}
          <div className="flex space-x-1 bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
            {[
              { id: 'repositories', label: 'Repositories', icon: <Database size={16} />, count: repositories.length },
              { id: 'changes', label: 'Changes', icon: <FileText size={16} />, count: workingFiles.length },
              { id: 'history', label: 'History', icon: <Clock size={16} />, count: commits.length },
              { id: 'branches', label: 'Branches', icon: <GitBranch size={16} />, count: branches.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                disabled={tab.id !== 'repositories' && !currentRepository}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
                  tab.id !== 'repositories' && !currentRepository && 'opacity-50 cursor-not-allowed'
                )}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.count > 0 && (
                  <span className={clsx(
                    'px-2 py-0.5 text-xs rounded-full font-medium',
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-400'
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'repositories' && (
          <div className="p-4 lg:p-6">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search repositories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRepositories.map((repo) => (
                <div
                  key={repo.id}
                  className={clsx(
                    'p-6 border rounded-xl cursor-pointer transition-all hover:shadow-lg group',
                    currentRepository?.id === repo.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                  )}
                  onClick={() => setCurrentRepository(repo)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Database size={20} className="text-blue-600" />
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {repo.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1">
                      {repo.isPrivate ? (
                        <Lock size={16} className="text-slate-400" />
                      ) : (
                        <Unlock size={16} className="text-slate-400" />
                      )}
                    </div>
                  </div>
                  
                  {repo.description && (
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                      {repo.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star size={14} />
                        <span>{repo.starsCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GitFork size={14} />
                        <span>{repo.forksCount}</span>
                      </div>
                      {repo.language && (
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs">
                          {repo.language}
                        </span>
                      )}
                    </div>
                    <span>{new Date(repo.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredRepositories.length === 0 && (
              <div className="text-center py-12">
                <Database className="mx-auto mb-4 text-slate-400" size={48} />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  {searchQuery ? 'No repositories found' : 'No repositories yet'}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {searchQuery ? 'Try adjusting your search terms' : 'Create your first repository to get started with local version control.'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setShowNewRepo(true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Create Repository
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'changes' && currentRepository && (
          <div className="h-full flex flex-col lg:flex-row">
            {/* File Changes */}
            <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-700">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Changes ({workingFiles.length})
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={addSampleFile}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Add sample
                    </button>
                    <button
                      onClick={stageAllFiles}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Stage all
                    </button>
                    <button
                      onClick={unstageAllFiles}
                      className="text-sm text-slate-600 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                    >
                      Unstage all
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* Staged Files */}
                {stagedFiles.length > 0 && (
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-500" />
                      Staged Changes ({stagedFiles.length})
                    </h4>
                    <div className="space-y-2">
                      {stagedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                        >
                          {getStatusIcon(file.changeType)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                              {file.filePath}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                              <span className={`px-2 py-1 rounded-full ${getStatusColor(file.changeType)}`}>
                                {file.changeType}
                              </span>
                              <span className="text-green-600">+{file.additions}</span>
                              <span className="text-red-600">-{file.deletions}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => unstageFile(file)}
                            className="p-1 text-green-600 hover:text-green-700 transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Unstaged Files */}
                {unstagedFiles.length > 0 && (
                  <div className="p-4">
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <AlertCircle size={16} className="text-yellow-500" />
                      Unstaged Changes ({unstagedFiles.length})
                    </h4>
                    <div className="space-y-2">
                      {unstagedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          {getStatusIcon(file.changeType)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                              {file.filePath}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                              <span className={`px-2 py-1 rounded-full ${getStatusColor(file.changeType)}`}>
                                {file.changeType}
                              </span>
                              <span className="text-green-600">+{file.additions}</span>
                              <span className="text-red-600">-{file.deletions}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => stageFile(file)}
                            className="p-1 text-slate-600 hover:text-green-600 transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {workingFiles.length === 0 && (
                  <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center">
                      <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                        No changes
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Your working directory is clean
                      </p>
                      <button
                        onClick={addSampleFile}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Add Sample File
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Commit Panel */}
            <div className="w-full lg:w-96 flex flex-col bg-slate-50 dark:bg-slate-800">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Commit Changes
                </h3>
              </div>

              <div className="flex-1 p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Commit message *
                  </label>
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="feat: add new feature"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={commitDescription}
                    onChange={(e) => setCommitDescription(e.target.value)}
                    placeholder="Add more details about this commit..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Commit summary:
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>{stagedFiles.length} files changed</span>
                    <div className="flex gap-3">
                      <span className="text-green-600">
                        +{stagedFiles.reduce((sum, file) => sum + file.additions, 0)}
                      </span>
                      <span className="text-red-600">
                        -{stagedFiles.reduce((sum, file) => sum + file.deletions, 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCommit}
                  disabled={!commitMessage.trim() || stagedFiles.length === 0 || loading}
                  className={clsx(
                    'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all',
                    commitMessage.trim() && stagedFiles.length > 0 && !loading
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                  )}
                >
                  <GitCommit size={16} />
                  {loading ? 'Committing...' : `Commit to ${currentBranch?.name || 'main'}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && currentRepository && (
          <div className="p-4 lg:p-6">
            <div className="space-y-4">
              {commits.map((commit) => (
                <div
                  key={commit.id}
                  className="flex items-start gap-4 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <GitCommit size={16} className="text-slate-600 dark:text-slate-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-slate-900 dark:text-white truncate">
                        {commit.message}
                      </h4>
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded font-mono">
                        {commit.sha.substring(0, 7)}
                      </span>
                    </div>
                    
                    {commit.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {commit.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>{commit.authorName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{new Date(commit.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>{commit.filesChanged} files</span>
                        <span className="text-green-600">+{commit.additions}</span>
                        <span className="text-red-600">-{commit.deletions}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => navigator.clipboard.writeText(commit.sha)}
                      className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              ))}
              
              {commits.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="mx-auto mb-4 text-slate-400" size={48} />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    No commits yet
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Make your first commit to see the history here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'branches' && currentRepository && (
          <div className="p-4 lg:p-6">
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
                <h4 className="font-medium text-slate-900 dark:text-white mb-3">
                  Create new branch
                </h4>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    placeholder="feature/new-feature"
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={createBranch}
                    disabled={!newBranchName.trim()}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setShowNewBranch(false)}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className={clsx(
                    'flex items-center justify-between p-4 border rounded-lg transition-all',
                    currentBranch?.id === branch.id
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <GitBranch 
                      size={16} 
                      className={currentBranch?.id === branch.id ? 'text-green-600' : 'text-slate-600 dark:text-slate-400'} 
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {branch.name}
                        </span>
                        {branch.isDefault && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                            default
                          </span>
                        )}
                        {currentBranch?.id === branch.id && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full">
                            current
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <span>Updated {new Date(branch.updatedAt).toLocaleDateString()}</span>
                        {(branch.aheadCount > 0 || branch.behindCount > 0) && (
                          <div className="flex items-center gap-2">
                            {branch.aheadCount > 0 && (
                              <span className="text-green-600">↑{branch.aheadCount}</span>
                            )}
                            {branch.behindCount > 0 && (
                              <span className="text-red-600">↓{branch.behindCount}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentBranch?.id !== branch.id && (
                      <button
                        onClick={() => switchBranch(branch)}
                        className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded transition-colors"
                      >
                        Switch
                      </button>
                    )}
                    {!branch.isDefault && (
                      <button className="p-2 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors">
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
      {showOptions && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  );
}