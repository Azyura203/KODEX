import React from 'react';
import { Plus, Minus, FileText } from 'lucide-react';
import { clsx } from 'clsx';

interface DiffViewerProps {
  oldContent: string;
  newContent: string;
  fileName: string;
}

interface DiffLine {
  type: 'add' | 'remove' | 'context';
  content: string;
  lineNumber?: number;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export default function DiffViewer({ oldContent, newContent, fileName }: DiffViewerProps) {
  const generateDiff = (): DiffLine[] => {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    const diff: DiffLine[] = [];

    // Simple diff algorithm
    let oldIndex = 0;
    let newIndex = 0;

    while (oldIndex < oldLines.length || newIndex < newLines.length) {
      const oldLine = oldLines[oldIndex];
      const newLine = newLines[newIndex];

      if (oldIndex >= oldLines.length) {
        diff.push({
          type: 'add',
          content: newLine,
          newLineNumber: newIndex + 1
        });
        newIndex++;
      } else if (newIndex >= newLines.length) {
        diff.push({
          type: 'remove',
          content: oldLine,
          oldLineNumber: oldIndex + 1
        });
        oldIndex++;
      } else if (oldLine === newLine) {
        diff.push({
          type: 'context',
          content: oldLine,
          oldLineNumber: oldIndex + 1,
          newLineNumber: newIndex + 1
        });
        oldIndex++;
        newIndex++;
      } else {
        diff.push({
          type: 'remove',
          content: oldLine,
          oldLineNumber: oldIndex + 1
        });
        diff.push({
          type: 'add',
          content: newLine,
          newLineNumber: newIndex + 1
        });
        oldIndex++;
        newIndex++;
      }
    }

    return diff;
  };

  const diffLines = generateDiff();
  const addedLines = diffLines.filter(line => line.type === 'add').length;
  const removedLines = diffLines.filter(line => line.type === 'remove').length;

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Diff Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {fileName}
            </h3>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-green-600">
              <Plus size={16} />
              {addedLines}
            </span>
            <span className="flex items-center gap-1 text-red-600">
              <Minus size={16} />
              {removedLines}
            </span>
          </div>
        </div>
      </div>

      {/* Diff Content */}
      <div className="font-mono text-sm">
        <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
          <div className="grid grid-cols-12 gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="col-span-1">Old</div>
            <div className="col-span-1">New</div>
            <div className="col-span-10">Content</div>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {diffLines.map((line, index) => (
            <div
              key={index}
              className={clsx(
                'grid grid-cols-12 gap-4 px-4 py-1 hover:bg-gray-50 dark:hover:bg-gray-800',
                line.type === 'add' && 'bg-green-50 dark:bg-green-900/20',
                line.type === 'remove' && 'bg-red-50 dark:bg-red-900/20'
              )}
            >
              <div className="col-span-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                {line.oldLineNumber || ''}
              </div>
              <div className="col-span-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                {line.newLineNumber || ''}
              </div>
              <div className="col-span-10 flex items-center gap-2">
                {line.type === 'add' && (
                  <Plus size={14} className="text-green-600 flex-shrink-0" />
                )}
                {line.type === 'remove' && (
                  <Minus size={14} className="text-red-600 flex-shrink-0" />
                )}
                <span
                  className={clsx(
                    'whitespace-pre-wrap break-all',
                    line.type === 'add' && 'text-green-800 dark:text-green-200',
                    line.type === 'remove' && 'text-red-800 dark:text-red-200',
                    line.type === 'context' && 'text-gray-900 dark:text-gray-100'
                  )}
                >
                  {line.content}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Diff Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            {diffLines.length} lines
          </span>
          <div className="flex items-center gap-4">
            <span className="text-green-600">+{addedLines}</span>
            <span className="text-red-600">-{removedLines}</span>
          </div>
        </div>
      </div>
    </div>
  );
}