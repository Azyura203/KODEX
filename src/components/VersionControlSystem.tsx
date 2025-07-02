import React, { useState } from 'react';
import { 
  GitBranch, 
  GitCommit, 
  Clock, 
  User, 
  Calendar,
  Eye,
  Copy,
  Tag,
  FileText,
  Code,
  Folder,
  Plus,
  Minus,
  Edit3,
  Download,
  ExternalLink,
  Activity,
  Users,
  Hash,
  CheckCircle,
  AlertCircle,
  Upload
} from 'lucide-react';
import { clsx } from 'clsx';
import MarkdownRenderer from './MarkdownRenderer';
import DiffViewer from './DiffViewer';
import CommitGraph from './CommitGraph';
import ContributorInsights from './ContributorInsights';
import FileExplorer from './FileExplorer';

interface Version {
  id: string;
  sha: string;
  message: string;
  description?: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
  timestamp: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  tags: string[];
  branch: string;
}

interface DocumentFile {
  id: string;
  path: string;
  name: string;
  content: string;
  type: 'markdown' | 'text' | 'code';
  language?: string;
  size: number;
  lastModified: string;
  versions: Version[];
}

interface Branch {
  name: string;
  isDefault: boolean;
  lastCommit: Version;
  ahead: number;
  behind: number;
  isProtected: boolean;
}

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

export default function VersionControlSystem() {
  const [currentFile, setCurrentFile] = useState<DocumentFile | null>(null);
  const [currentVersion, setCurrentVersion] = useState<Version | null>(null);
  const [currentBranch, setBranch] = useState('main');
  const [activeTab, setActiveTab] = useState<'files' | 'history' | 'insights' | 'branches'>('files');
  const [showDiff, setShowDiff] = useState(false);
  const [compareVersion, setCompareVersion] = useState<Version | null>(null);
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (file: DocumentFile) => {
    setCurrentFile(file);
    if (file.versions && file.versions.length > 0) {
      setCurrentVersion(file.versions[0]);
    }
    setShowDiff(false);
  };

  const handleVersionSelect = (version: Version) => {
    setCurrentVersion(version);
    setShowDiff(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 transition-all duration-300">
      {/* Clean Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20">
        <div className="p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl shadow-lg">
                <GitBranch className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  Version Control
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Track changes and manage documentation versions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Branch Selector */}
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <GitBranch size={16} className="text-slate-500" />
                <select
                  value={currentBranch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none font-medium"
                >
                  <option value="main">main</option>
                </select>
              </div>

              {/* Actions */}
              <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-300 dark:border-slate-600 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-105">
                <Edit3 size={16} />
                <span className="hidden sm:inline">Edit</span>
              </button>
            </div>
          </div>

          {/* Fixed Tab Navigation - Consistent styling across all pages */}
          <div className="flex mt-6 bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-700">
            {[
              { id: 'files', label: 'Files', icon: <Folder size={16} /> },
              { id: 'history', label: 'History', icon: <Clock size={16} /> },
              { id: 'insights', label: 'Insights', icon: <Activity size={16} /> },
              { id: 'branches', label: 'Branches', icon: <GitBranch size={16} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 relative flex-1 justify-center',
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-md transform scale-105'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                )}
              >
                <span className={clsx(
                  'transition-transform duration-200',
                  activeTab === tab.id && 'scale-110'
                )}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content with smooth transitions */}
      <div className="flex-1 flex overflow-hidden">
        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/20">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full shadow-xl flex items-center justify-center mx-auto mb-6 border-4 border-slate-100 dark:border-slate-700">
              <GitCommit className="w-12 h-12 text-primary-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Welcome to Version Control
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              Track changes to your documentation with Git-like version control. Create files, make commits, and manage branches to keep your documentation organized.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-medium">
                <Plus size={18} />
                Create First File
              </button>
              <button className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 font-medium">
                <Upload size={18} />
                Upload Files
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}