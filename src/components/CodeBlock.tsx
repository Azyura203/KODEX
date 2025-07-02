import React, { useState } from 'react';
import { Copy, Check, Download, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  maxHeight?: string;
  className?: string;
}

export default function CodeBlock({
  code,
  language = 'text',
  filename,
  showLineNumbers = true,
  highlightLines = [],
  maxHeight = '400px',
  className
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `code.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const lines = code.split('\n');

  return (
    <div className={clsx('relative group', className)}>
      {/* Header */}
      {(filename || language) && (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800 dark:bg-slate-900 border-b border-slate-700 rounded-t-lg">
          <div className="flex items-center gap-3">
            {filename && (
              <span className="text-sm font-medium text-slate-300">{filename}</span>
            )}
            {language && (
              <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full font-mono">
                {language}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={copyToClipboard}
              className="p-1.5 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Copy code"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
            {filename && (
              <button
                onClick={downloadCode}
                className="p-1.5 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Download file"
              >
                <Download size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Code Content */}
      <div 
        className="relative bg-slate-900 dark:bg-slate-950 rounded-b-lg overflow-hidden"
        style={{ maxHeight }}
      >
        <div className="overflow-auto">
          <pre className="p-4 text-sm leading-relaxed">
            <code className={`language-${language} text-slate-100`}>
              {showLineNumbers ? (
                <div className="flex">
                  {/* Line Numbers */}
                  <div className="select-none text-slate-500 text-right pr-4 border-r border-slate-700 mr-4">
                    {lines.map((_, index) => (
                      <div
                        key={index}
                        className={clsx(
                          'leading-relaxed',
                          highlightLines.includes(index + 1) && 'text-yellow-400'
                        )}
                      >
                        {index + 1}
                      </div>
                    ))}
                  </div>
                  
                  {/* Code Lines */}
                  <div className="flex-1">
                    {lines.map((line, index) => (
                      <div
                        key={index}
                        className={clsx(
                          'leading-relaxed',
                          highlightLines.includes(index + 1) && 'bg-yellow-400/10 -mx-4 px-4'
                        )}
                      >
                        {line || '\u00A0'}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                code
              )}
            </code>
          </pre>
        </div>

        {/* Copy Button (when no header) */}
        {!filename && !language && (
          <button
            onClick={copyToClipboard}
            className="absolute top-3 right-3 p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all duration-200 opacity-0 group-hover:opacity-100"
            title="Copy code"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}