import React, { useState } from 'react';
import { 
  FileText, 
  Code, 
  Image, 
  Download, 
  Eye, 
  Edit3, 
  Copy, 
  ExternalLink,
  Calendar,
  User,
  GitCommit,
  History,
  Star,
  MoreHorizontal
} from 'lucide-react';
import { clsx } from 'clsx';
import MarkdownRenderer from './MarkdownRenderer';
import CodeBlock from './CodeBlock';

interface FileViewerProps {
  file: {
    name: string;
    path: string;
    content: string;
    size: number;
    type: 'markdown' | 'code' | 'text' | 'image' | 'binary';
    language?: string;
    lastModified: string;
    author?: string;
    commits?: number;
  };
  onEdit?: () => void;
  onDownload?: () => void;
  showMetadata?: boolean;
}

export default function FileViewer({ 
  file, 
  onEdit, 
  onDownload, 
  showMetadata = true 
}: FileViewerProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'raw'>('preview');
  const [showActions, setShowActions] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = () => {
    switch (file.type) {
      case 'markdown':
        return <FileText className="text-blue-500" size={20} />;
      case 'code':
        return <Code className="text-green-500" size={20} />;
      case 'image':
        return <Image className="text-purple-500" size={20} />;
      default:
        return <FileText className="text-slate-500" size={20} />;
    }
  };

  const renderContent = () => {
    if (file.type === 'image') {
      return (
        <div className="flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <img 
            src={file.content} 
            alt={file.name}
            className="max-w-full max-h-96 rounded-lg shadow-lg"
          />
        </div>
      );
    }

    if (file.type === 'binary') {
      return (
        <div className="flex items-center justify-center p-12 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div className="text-center">
            <FileText className="mx-auto mb-4 text-slate-400" size={48} />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              Binary File
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              This file cannot be displayed in the browser.
            </p>
            <button
              onClick={onDownload}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Download File
            </button>
          </div>
        </div>
      );
    }

    if (viewMode === 'raw' || file.type === 'text') {
      return (
        <CodeBlock
          code={file.content}
          language={file.language || 'text'}
          filename={file.name}
          showLineNumbers={true}
        />
      );
    }

    if (file.type === 'markdown') {
      return (
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <MarkdownRenderer content={file.content} />
        </div>
      );
    }

    if (file.type === 'code') {
      return (
        <CodeBlock
          code={file.content}
          language={file.language || 'text'}
          filename={file.name}
          showLineNumbers={true}
        />
      );
    }

    return (
      <pre className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg overflow-auto text-sm">
        {file.content}
      </pre>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      {/* File Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {getFileIcon()}
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {file.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {file.path}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            {(file.type === 'markdown' || file.type === 'code') && (
              <div className="flex items-center bg-white dark:bg-slate-700 rounded-lg p-1 border border-slate-200 dark:border-slate-600">
                <button
                  onClick={() => setViewMode('preview')}
                  className={clsx(
                    'px-3 py-1 rounded-md text-sm font-medium transition-all',
                    viewMode === 'preview'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  <Eye size={14} className="mr-1 inline" />
                  Preview
                </button>
                <button
                  onClick={() => setViewMode('raw')}
                  className={clsx(
                    'px-3 py-1 rounded-md text-sm font-medium transition-all',
                    viewMode === 'raw'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  <Code size={14} className="mr-1 inline" />
                  Raw
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                  title="Edit file"
                >
                  <Edit3 size={16} />
                </button>
              )}
              
              <button
                onClick={onDownload}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                title="Download file"
              >
                <Download size={16} />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                  title="More actions"
                >
                  <MoreHorizontal size={16} />
                </button>

                {showActions && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-10">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                      <Copy size={14} />
                      Copy path
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                      <History size={14} />
                      View history
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                      <ExternalLink size={14} />
                      Open in new tab
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* File Metadata */}
        {showMetadata && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <span>{formatFileSize(file.size)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>Modified {new Date(file.lastModified).toLocaleDateString()}</span>
              </div>
              {file.author && (
                <div className="flex items-center gap-1">
                  <User size={14} />
                  <span>{file.author}</span>
                </div>
              )}
              {file.commits && (
                <div className="flex items-center gap-1">
                  <GitCommit size={14} />
                  <span>{file.commits} commits</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* File Content */}
      <div className="p-6">
        {renderContent()}
      </div>

      {/* Click outside to close actions */}
      {showActions && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
}