// Local Database Git System - No external dependencies
export interface Repository {
  id: string;
  name: string;
  description?: string;
  owner: string;
  isPrivate: boolean;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  starsCount: number;
  forksCount: number;
  language?: string;
  topics: string[];
}

export interface Branch {
  id: string;
  repositoryId: string;
  name: string;
  commitSha?: string;
  isDefault: boolean;
  isProtected: boolean;
  aheadCount: number;
  behindCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Commit {
  id: string;
  repositoryId: string;
  branchId: string;
  sha: string;
  message: string;
  description?: string;
  authorName: string;
  authorEmail: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  createdAt: string;
}

export interface WorkingFile {
  id: string;
  repositoryId: string;
  filePath: string;
  content?: string;
  changeType: 'added' | 'modified' | 'deleted' | 'renamed';
  isStaged: boolean;
  additions: number;
  deletions: number;
  createdAt: string;
  updatedAt: string;
}

// Local storage keys
const STORAGE_KEYS = {
  repositories: 'kodex_repositories',
  branches: 'kodex_branches',
  commits: 'kodex_commits',
  workingFiles: 'kodex_working_files',
  currentUser: 'kodex_current_user'
};

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

// Utility functions
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function generateSha(): string {
  return Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

function getFromStorage<T>(key: string): T[] {
  if (!isBrowser) return [];
  
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading from localStorage key ${key}:`, error);
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (!isBrowser) return;
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage key ${key}:`, error);
  }
}

// User management
export const getCurrentUser = () => {
  if (!isBrowser) {
    // Return default user for server-side rendering
    return {
      id: 'user',
      email: 'user@kodex.dev',
      name: 'User'
    };
  }
  
  const stored = localStorage.getItem(STORAGE_KEYS.currentUser);
  if (stored) {
    return JSON.parse(stored);
  }
  
  const user = {
    id: 'user',
    email: 'user@kodex.dev',
    name: 'User'
  };
  
  localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
  return user;
};

// Repository operations
export const repositoryService = {
  create(data: Partial<Repository>): Repository {
    const repositories = getFromStorage<Repository>(STORAGE_KEYS.repositories);
    const user = getCurrentUser();
    
    const repository: Repository = {
      id: generateId(),
      name: data.name || 'Untitled Repository',
      description: data.description,
      owner: user.email,
      isPrivate: data.isPrivate || false,
      defaultBranch: data.defaultBranch || 'main',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      starsCount: 0,
      forksCount: 0,
      language: data.language,
      topics: data.topics || [],
      ...data
    };
    
    repositories.push(repository);
    saveToStorage(STORAGE_KEYS.repositories, repositories);
    
    // Create default branch
    branchService.create({
      repositoryId: repository.id,
      name: repository.defaultBranch,
      isDefault: true
    });
    
    return repository;
  },

  getAll(): Repository[] {
    return getFromStorage<Repository>(STORAGE_KEYS.repositories);
  },

  getById(id: string): Repository | null {
    const repositories = getFromStorage<Repository>(STORAGE_KEYS.repositories);
    return repositories.find(repo => repo.id === id) || null;
  },

  update(id: string, data: Partial<Repository>): Repository | null {
    const repositories = getFromStorage<Repository>(STORAGE_KEYS.repositories);
    const index = repositories.findIndex(repo => repo.id === id);
    
    if (index === -1) return null;
    
    repositories[index] = {
      ...repositories[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    saveToStorage(STORAGE_KEYS.repositories, repositories);
    return repositories[index];
  },

  delete(id: string): boolean {
    const repositories = getFromStorage<Repository>(STORAGE_KEYS.repositories);
    const filtered = repositories.filter(repo => repo.id !== id);
    
    if (filtered.length === repositories.length) return false;
    
    saveToStorage(STORAGE_KEYS.repositories, filtered);
    
    // Clean up related data
    const branches = getFromStorage<Branch>(STORAGE_KEYS.branches).filter(b => b.repositoryId !== id);
    saveToStorage(STORAGE_KEYS.branches, branches);
    
    const commits = getFromStorage<Commit>(STORAGE_KEYS.commits).filter(c => c.repositoryId !== id);
    saveToStorage(STORAGE_KEYS.commits, commits);
    
    const workingFiles = getFromStorage<WorkingFile>(STORAGE_KEYS.workingFiles).filter(f => f.repositoryId !== id);
    saveToStorage(STORAGE_KEYS.workingFiles, workingFiles);
    
    return true;
  }
};

// Branch operations
export const branchService = {
  create(data: Partial<Branch>): Branch {
    const branches = getFromStorage<Branch>(STORAGE_KEYS.branches);
    
    const branch: Branch = {
      id: generateId(),
      repositoryId: data.repositoryId || '',
      name: data.name || 'new-branch',
      commitSha: data.commitSha,
      isDefault: data.isDefault || false,
      isProtected: data.isProtected || false,
      aheadCount: data.aheadCount || 0,
      behindCount: data.behindCount || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    
    branches.push(branch);
    saveToStorage(STORAGE_KEYS.branches, branches);
    return branch;
  },

  getByRepository(repositoryId: string): Branch[] {
    const branches = getFromStorage<Branch>(STORAGE_KEYS.branches);
    return branches.filter(branch => branch.repositoryId === repositoryId);
  },

  update(id: string, data: Partial<Branch>): Branch | null {
    const branches = getFromStorage<Branch>(STORAGE_KEYS.branches);
    const index = branches.findIndex(branch => branch.id === id);
    
    if (index === -1) return null;
    
    branches[index] = {
      ...branches[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    saveToStorage(STORAGE_KEYS.branches, branches);
    return branches[index];
  },

  delete(id: string): boolean {
    const branches = getFromStorage<Branch>(STORAGE_KEYS.branches);
    const filtered = branches.filter(branch => branch.id !== id);
    
    if (filtered.length === branches.length) return false;
    
    saveToStorage(STORAGE_KEYS.branches, filtered);
    return true;
  }
};

// Commit operations
export const commitService = {
  create(repositoryId: string, branchName: string, message: string, description?: string): Commit {
    const commits = getFromStorage<Commit>(STORAGE_KEYS.commits);
    const branches = getFromStorage<Branch>(STORAGE_KEYS.branches);
    const workingFiles = getFromStorage<WorkingFile>(STORAGE_KEYS.workingFiles);
    const user = getCurrentUser();
    
    // Find the branch
    const branch = branches.find(b => b.repositoryId === repositoryId && b.name === branchName);
    if (!branch) {
      throw new Error(`Branch ${branchName} not found`);
    }
    
    // Get staged files
    const stagedFiles = workingFiles.filter(f => f.repositoryId === repositoryId && f.isStaged);
    
    const commit: Commit = {
      id: generateId(),
      repositoryId,
      branchId: branch.id,
      sha: generateSha(),
      message,
      description,
      authorName: user.name,
      authorEmail: user.email,
      filesChanged: stagedFiles.length,
      additions: stagedFiles.reduce((sum, file) => sum + file.additions, 0),
      deletions: stagedFiles.reduce((sum, file) => sum + file.deletions, 0),
      createdAt: new Date().toISOString()
    };
    
    commits.push(commit);
    saveToStorage(STORAGE_KEYS.commits, commits);
    
    // Update branch commit SHA
    branch.commitSha = commit.sha;
    branch.updatedAt = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.branches, branches);
    
    // Remove staged files
    const remainingFiles = workingFiles.filter(f => !(f.repositoryId === repositoryId && f.isStaged));
    saveToStorage(STORAGE_KEYS.workingFiles, remainingFiles);
    
    return commit;
  },

  getByRepository(repositoryId: string, limit = 50): Commit[] {
    const commits = getFromStorage<Commit>(STORAGE_KEYS.commits);
    return commits
      .filter(commit => commit.repositoryId === repositoryId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },

  getById(id: string): Commit | null {
    const commits = getFromStorage<Commit>(STORAGE_KEYS.commits);
    return commits.find(commit => commit.id === id) || null;
  }
};

// Working directory operations
export const workingDirectoryService = {
  addFile(repositoryId: string, filePath: string, content: string, changeType: 'added' | 'modified' | 'deleted'): WorkingFile {
    const workingFiles = getFromStorage<WorkingFile>(STORAGE_KEYS.workingFiles);
    
    // Remove existing file with same path
    const filtered = workingFiles.filter(f => !(f.repositoryId === repositoryId && f.filePath === filePath));
    
    // Calculate additions/deletions
    const lines = content.split('\n').length;
    const additions = changeType === 'deleted' ? 0 : lines;
    const deletions = changeType === 'added' ? 0 : (changeType === 'deleted' ? lines : Math.floor(lines * 0.3));
    
    const workingFile: WorkingFile = {
      id: generateId(),
      repositoryId,
      filePath,
      content,
      changeType,
      isStaged: false,
      additions,
      deletions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    filtered.push(workingFile);
    saveToStorage(STORAGE_KEYS.workingFiles, filtered);
    return workingFile;
  },

  getFiles(repositoryId: string): WorkingFile[] {
    const workingFiles = getFromStorage<WorkingFile>(STORAGE_KEYS.workingFiles);
    return workingFiles.filter(file => file.repositoryId === repositoryId);
  },

  stageFile(id: string): WorkingFile | null {
    const workingFiles = getFromStorage<WorkingFile>(STORAGE_KEYS.workingFiles);
    const index = workingFiles.findIndex(file => file.id === id);
    
    if (index === -1) return null;
    
    workingFiles[index].isStaged = true;
    workingFiles[index].updatedAt = new Date().toISOString();
    
    saveToStorage(STORAGE_KEYS.workingFiles, workingFiles);
    return workingFiles[index];
  },

  unstageFile(id: string): WorkingFile | null {
    const workingFiles = getFromStorage<WorkingFile>(STORAGE_KEYS.workingFiles);
    const index = workingFiles.findIndex(file => file.id === id);
    
    if (index === -1) return null;
    
    workingFiles[index].isStaged = false;
    workingFiles[index].updatedAt = new Date().toISOString();
    
    saveToStorage(STORAGE_KEYS.workingFiles, workingFiles);
    return workingFiles[index];
  },

  stageAllFiles(repositoryId: string): WorkingFile[] {
    const workingFiles = getFromStorage<WorkingFile>(STORAGE_KEYS.workingFiles);
    const updated = workingFiles.map(file => {
      if (file.repositoryId === repositoryId) {
        return {
          ...file,
          isStaged: true,
          updatedAt: new Date().toISOString()
        };
      }
      return file;
    });
    
    saveToStorage(STORAGE_KEYS.workingFiles, updated);
    return updated.filter(file => file.repositoryId === repositoryId);
  },

  unstageAllFiles(repositoryId: string): WorkingFile[] {
    const workingFiles = getFromStorage<WorkingFile>(STORAGE_KEYS.workingFiles);
    const updated = workingFiles.map(file => {
      if (file.repositoryId === repositoryId) {
        return {
          ...file,
          isStaged: false,
          updatedAt: new Date().toISOString()
        };
      }
      return file;
    });
    
    saveToStorage(STORAGE_KEYS.workingFiles, updated);
    return updated.filter(file => file.repositoryId === repositoryId);
  },

  deleteFile(id: string): boolean {
    const workingFiles = getFromStorage<WorkingFile>(STORAGE_KEYS.workingFiles);
    const filtered = workingFiles.filter(file => file.id !== id);
    
    if (filtered.length === workingFiles.length) return false;
    
    saveToStorage(STORAGE_KEYS.workingFiles, filtered);
    return true;
  }
};

// Initialize with empty data
export const initializeSampleData = () => {
  if (!isBrowser) return; // Don't initialize on server-side
  
  // Clear any existing data to start fresh
  localStorage.removeItem(STORAGE_KEYS.repositories);
  localStorage.removeItem(STORAGE_KEYS.branches);
  localStorage.removeItem(STORAGE_KEYS.commits);
  localStorage.removeItem(STORAGE_KEYS.workingFiles);
  
  // Create default user if not exists
  if (!localStorage.getItem(STORAGE_KEYS.currentUser)) {
    const user = {
      id: 'user',
      email: 'user@kodex.dev',
      name: 'User'
    };
    localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
  }
};

// Export storage keys for debugging
export { STORAGE_KEYS };
