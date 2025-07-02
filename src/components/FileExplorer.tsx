import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  Code, 
  ChevronRight, 
  ChevronDown,
  Clock,
  User
} from 'lucide-react';
import { clsx } from 'clsx';

interface DocumentFile {
  id: string;
  path: string;
  name: string;
  content: string;
  type: 'markdown' | 'text' | 'code';
  language?: string;
  size: number;
  lastModified: string;
  versions: any[];
}

interface FileExplorerProps {
  files: DocumentFile[];
  currentFile: DocumentFile | null;
  onFileSelect: (file: DocumentFile) => void;
}

interface FileTreeNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  file?: DocumentFile;
  children?: FileTreeNode[];
}

export default function FileExplorer({ files, currentFile, onFileSelect }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['docs']));

  // Build file tree structure
  const buildFileTree = (files: DocumentFile[]): FileTreeNode[] => {
    const tree: FileTreeNode[] = [];
    const folderMap = new Map<string, FileTreeNode>();

    files.forEach(file => {
      const pathParts = file.path.split('/');
      let currentPath = '';
      
      pathParts.forEach((part, index) => {
        const isLast = index === pathParts.length - 1;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (isLast) {
          // This is a file
          const fileNode: FileTreeNode = {
            name: part,
            type: 'file',
            path: currentPath,
            file
          };
          
          if (index === 0) {
            tree.push(fileNode);
          } else {
            const parentPath = pathParts.slice(0, index).join('/');
            const parent = folderMap.get(parentPath);
            if (parent) {
              parent.children = parent.children || [];
              parent.children.push(fileNode);
            }
          }
        } else {
          // This is a folder
          if (!folderMap.has(currentPath)) {
            const folderNode: FileTreeNode = {
              name: part,
              type: 'folder',
              path: currentPath,
              children: []
            };
            
            folderMap.set(currentPath, folderNode);
            
            if (index === 0) {
              tree.push(folderNode);
            } else {
              const parentPath = pathParts.slice(0, index).join('/');
              const parent = folderMap.get(parentPath);
              if (parent) {
                parent.children = parent.children || [];
                parent.children.push(folderNode);
              }
            }
          }
        }
      });
    });

    return tree;
  };

  const fileTree = buildFileTree(files);

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (file: DocumentFile) => {
    switch (file.type) {
      case 'markdown':
        return <FileText size={16} className="text-blue-500" />;
      case 'code':
        return <Code size={16} className="text-green-500" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const renderTreeNode = (node: FileTreeNode, level = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = currentFile?.id === node.file?.id;

    return (
      <div key={node.path}>
        <div
          className={clsx(
            'flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
            isSelected && 'bg-primary-50 dark:bg-primary-900/20 border-r-2 border-primary-500',
            level > 0 && 'ml-4'
          )}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(node.path);
            } else if (node.file) {
              onFileSelect(node.file);
            }
          }}
        >
          {node.type === 'folder' ? (
            <>
              {isExpanded ? (
                <ChevronDown size={16} className="text-gray-400" />
              ) : (
                <ChevronRight size={16} className="text-gray-400" />
              )}
              {isExpanded ? (
                <FolderOpen size={16} className="text-blue-500" />
              ) : (
                <Folder size={16} className="text-blue-500" />
              )}
              <span className="font-medium text-gray-900 dark:text-white">
                {node.name}
              </span>
            </>
          ) : (
            <>
              <div className="w-4" /> {/* Spacer for alignment */}
              {node.file && getFileIcon(node.file)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {node.name}
                </p>
                {node.file && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatFileSize(node.file.size)}</span>
                    <span>•</span>
                    <span>{formatDate(node.file.lastModified)}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {node.type === 'folder' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Folder size={16} />
          Files ({files.length})
        </h3>
      </div>

      {/* File Tree */}
      <div className="overflow-y-auto">
        {fileTree.map(node => renderTreeNode(node))}
      </div>

      {/* Current File Info */}
      {currentFile && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            File Details
          </h4>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <FileText size={14} />
              <span className="truncate">{currentFile.path}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>Modified {formatDate(currentFile.lastModified)}</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={14} />
              <span>{currentFile.versions.length} versions</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}