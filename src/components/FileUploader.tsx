import React, { useState, useRef } from 'react';
import { Upload, File, Folder, X, Plus, FileText, Code, Image, Archive } from 'lucide-react';
import { clsx } from 'clsx';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  content?: string;
  children?: FileItem[];
  icon?: React.ReactNode;
}

interface FileUploaderProps {
  onFilesUploaded?: (files: FileItem[]) => void;
  className?: string;
}

const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'md':
    case 'markdown':
      return <FileText size={16} className="text-blue-500" />;
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return <Code size={16} className="text-yellow-500" />;
    case 'json':
      return <Code size={16} className="text-green-500" />;
    case 'css':
    case 'scss':
    case 'sass':
      return <Code size={16} className="text-pink-500" />;
    case 'html':
      return <Code size={16} className="text-orange-500" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return <Image size={16} className="text-purple-500" />;
    case 'zip':
    case 'tar':
    case 'gz':
      return <Archive size={16} className="text-gray-500" />;
    default:
      return <File size={16} className="text-gray-500" />;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function FileUploader({ onFilesUploaded, className }: FileUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (fileList: FileList) => {
    setIsUploading(true);
    const newFiles: FileItem[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fileItem: FileItem = {
        id: `${Date.now()}-${i}`,
        name: file.name,
        type: 'file',
        size: file.size,
        icon: getFileIcon(file.name)
      };

      // Read file content for text files
      if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.json')) {
        try {
          const content = await file.text();
          fileItem.content = content;
        } catch (error) {
          console.error('Error reading file:', error);
        }
      }

      newFiles.push(fileItem);
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsUploading(false);

    if (onFilesUploaded) {
      onFilesUploaded(newFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
  };

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Upload Area */}
      <div
        className={clsx(
          'border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200',
          isDragOver
            ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600'
        )}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
            <Upload size={24} className="text-gray-600 dark:text-gray-400" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Upload Files or Folders
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Drag and drop your files here, or click to browse
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
            >
              <Plus size={16} />
              Choose Files
            </button>
            
            <button
              onClick={() => folderInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800 rounded-lg transition-colors font-medium"
            >
              <Folder size={16} />
              Choose Folder
            </button>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Supports: .md, .txt, .json, .js, .ts, .css, .html and more
          </p>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept=".md,.txt,.json,.js,.jsx,.ts,.tsx,.css,.scss,.html,.xml,.yaml,.yml"
      />
      
      <input
        ref={folderInputRef}
        type="file"
        multiple
        webkitdirectory=""
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Uploaded Files ({uploadedFiles.length})
            </h3>
            <button
              onClick={clearAllFiles}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              Clear All
            </button>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {file.icon}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    {file.size && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {file.content && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                      Content loaded
                    </span>
                  )}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isUploading && (
        <div className="flex items-center justify-center p-4">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
            <span>Processing files...</span>
          </div>
        </div>
      )}
    </div>
  );
}