import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Eye, 
  Edit3, 
  FileText, 
  Upload, 
  Download, 
  Sparkles,
  Bold,
  Italic,
  Code,
  Link,
  List,
  ListOrdered,
  Quote,
  Image,
  Table,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Copy,
  Scissors,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MoreHorizontal
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import AIMarkdownGenerator from './AIMarkdownGenerator';
import { clsx } from 'clsx';

interface DocumentationEditorProps {
  initialContent?: string;
  onSave?: (content: string) => void;
  readOnly?: boolean;
}

interface ToolbarButton {
  icon: React.ReactNode;
  label: string;
  action: () => void;
  shortcut?: string;
  separator?: boolean;
  active?: boolean;
}

export default function DocumentationEditor({ 
  initialContent = '', 
  onSave,
  readOnly = false 
}: DocumentationEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isPreview, setIsPreview] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [showMoreTools, setShowMoreTools] = useState(false);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleContentChange = (value: string) => {
    setContent(value);
    setIsDirty(value !== initialContent);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(content);
      setIsDirty(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/markdown') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        handleContentChange(text);
      };
      reader.readAsText(file);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'documentation.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAIGenerated = (generatedMarkdown: string) => {
    handleContentChange(generatedMarkdown);
    setShowAIGenerator(false);
  };

  // Markdown formatting functions
  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    if (!textareaRef) return;

    const start = textareaRef.selectionStart;
    const end = textareaRef.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = selectedText || placeholder;
    
    const newContent = 
      content.substring(0, start) + 
      before + replacement + after + 
      content.substring(end);
    
    handleContentChange(newContent);
    
    // Set cursor position
    setTimeout(() => {
      if (textareaRef) {
        const newPosition = start + before.length + replacement.length;
        textareaRef.setSelectionRange(newPosition, newPosition);
        textareaRef.focus();
      }
    }, 0);
  };

  const insertAtNewLine = (text: string) => {
    if (!textareaRef) return;

    const start = textareaRef.selectionStart;
    const beforeCursor = content.substring(0, start);
    const afterCursor = content.substring(start);
    
    // Check if we need to add newlines
    const needsNewlineBefore = beforeCursor.length > 0 && !beforeCursor.endsWith('\n');
    const needsNewlineAfter = afterCursor.length > 0 && !afterCursor.startsWith('\n');
    
    const insertion = 
      (needsNewlineBefore ? '\n' : '') + 
      text + 
      (needsNewlineAfter ? '\n' : '');
    
    const newContent = beforeCursor + insertion + afterCursor;
    handleContentChange(newContent);
    
    setTimeout(() => {
      if (textareaRef) {
        const newPosition = start + insertion.length;
        textareaRef.setSelectionRange(newPosition, newPosition);
        textareaRef.focus();
      }
    }, 0);
  };

  // Toolbar actions
  const toolbarActions = {
    bold: () => insertText('**', '**', 'bold text'),
    italic: () => insertText('*', '*', 'italic text'),
    code: () => insertText('`', '`', 'code'),
    link: () => insertText('[', '](url)', 'link text'),
    heading1: () => insertAtNewLine('# Heading 1'),
    heading2: () => insertAtNewLine('## Heading 2'),
    heading3: () => insertAtNewLine('### Heading 3'),
    unorderedList: () => insertAtNewLine('- List item'),
    orderedList: () => insertAtNewLine('1. List item'),
    quote: () => insertAtNewLine('> Quote'),
    codeBlock: () => insertAtNewLine('```\ncode block\n```'),
    table: () => insertAtNewLine('| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |'),
    image: () => insertText('![', '](image-url)', 'alt text'),
    horizontalRule: () => insertAtNewLine('---'),
  };

  // Primary toolbar buttons
  const primaryButtons: ToolbarButton[] = [
    {
      icon: <Bold size={16} />,
      label: 'Bold',
      action: toolbarActions.bold,
      shortcut: '⌘B'
    },
    {
      icon: <Italic size={16} />,
      label: 'Italic',
      action: toolbarActions.italic,
      shortcut: '⌘I'
    },
    {
      icon: <Code size={16} />,
      label: 'Inline Code',
      action: toolbarActions.code,
      shortcut: '⌘`'
    },
    {
      icon: <Link size={16} />,
      label: 'Link',
      action: toolbarActions.link,
      shortcut: '⌘K',
      separator: true
    },
    {
      icon: <Heading1 size={16} />,
      label: 'Heading 1',
      action: toolbarActions.heading1
    },
    {
      icon: <Heading2 size={16} />,
      label: 'Heading 2',
      action: toolbarActions.heading2
    },
    {
      icon: <List size={16} />,
      label: 'Bullet List',
      action: toolbarActions.unorderedList
    },
    {
      icon: <ListOrdered size={16} />,
      label: 'Numbered List',
      action: toolbarActions.orderedList,
      separator: true
    },
    {
      icon: <Quote size={16} />,
      label: 'Quote',
      action: toolbarActions.quote
    },
    {
      icon: <Image size={16} />,
      label: 'Image',
      action: toolbarActions.image
    }
  ];

  // Secondary toolbar buttons (in dropdown)
  const secondaryButtons: ToolbarButton[] = [
    {
      icon: <Heading3 size={16} />,
      label: 'Heading 3',
      action: toolbarActions.heading3
    },
    {
      icon: <Code size={16} />,
      label: 'Code Block',
      action: toolbarActions.codeBlock
    },
    {
      icon: <Table size={16} />,
      label: 'Table',
      action: toolbarActions.table
    },
    {
      icon: <AlignCenter size={16} />,
      label: 'Horizontal Rule',
      action: toolbarActions.horizontalRule
    }
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            toolbarActions.bold();
            break;
          case 'i':
            e.preventDefault();
            toolbarActions.italic();
            break;
          case '`':
            e.preventDefault();
            toolbarActions.code();
            break;
          case 'k':
            e.preventDefault();
            toolbarActions.link();
            break;
          case 's':
            e.preventDefault();
            handleSave();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [content]);

  if (readOnly) {
    return <MarkdownRenderer content={content} />;
  }

  if (showAIGenerator) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles size={16} />
            AI Markdown Generator
          </h2>
          <button
            onClick={() => setShowAIGenerator(false)}
            className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Back to Editor
          </button>
        </div>
        
        <div className="flex-1">
          <AIMarkdownGenerator onGenerated={handleAIGenerated} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Enhanced Toolbar - Consistent with other pages */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        {/* Main Toolbar */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-1">
            {/* View Toggle -  Consistent with other components */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mr-3">
              <button
                onClick={() => setIsPreview(false)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                  !isPreview
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <Edit3 size={14} />
                Edit
              </button>
              <button
                onClick={() => setIsPreview(true)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                  isPreview
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <Eye size={14} />
                Preview
              </button>
            </div>

            {/* Formatting Buttons */}
            {!isPreview && (
              <div className="flex items-center gap-1">
                {primaryButtons.map((button, index) => (
                  <React.Fragment key={index}>
                    <button
                      onClick={button.action}
                      title={`${button.label}${button.shortcut ? ` (${button.shortcut})` : ''}`}
                      className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                    >
                      {button.icon}
                    </button>
                    {button.separator && (
                      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                    )}
                  </React.Fragment>
                ))}

                {/* More Tools Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowMoreTools(!showMoreTools)}
                    className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                    title="More formatting options"
                  >
                    <MoreHorizontal size={16} />
                  </button>

                  {showMoreTools && (
                    <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
                      {secondaryButtons.map((button, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            button.action();
                            setShowMoreTools(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          {button.icon}
                          {button.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAIGenerator(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:from-primary-700 hover:to-accent-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Sparkles size={14} />
              AI Generate
            </button>
            
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
            
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer">
              <Upload size={14} />
              Upload
              <input
                type="file"
                accept=".md,.markdown"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <Download size={14} />
              Download
            </button>

            {onSave && (
              <>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
                <button
                  onClick={handleSave}
                  disabled={!isDirty}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    isDirty
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  )}
                >
                  <Save size={14} />
                  Save
                  {isDirty && (
                    <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Status Bar */}
        {!isPreview && (
          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span>Lines: {content.split('\n').length}</span>
                <span>Words: {content.split(/\s+/).filter(word => word.length > 0).length}</span>
                <span>Characters: {content.length}</span>
              </div>
              <div className="flex items-center gap-4">
                {isDirty && (
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    Unsaved changes
                  </span>
                )}
                <span>Markdown</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex">
        {!isPreview ? (
          <div className="flex-1 flex">
            <textarea
              ref={setTextareaRef}
              value={content}
              onChange={(e) => {
                handleContentChange(e.target.value);
                setSelectionStart(e.target.selectionStart);
                setSelectionEnd(e.target.selectionEnd);
              }}
              onSelect={(e) => {
                const target = e.target as HTMLTextAreaElement;
                setSelectionStart(target.selectionStart);
                setSelectionEnd(target.selectionEnd);
              }}
              placeholder="# Start writing your documentation...

## Getting Started

Write your documentation in Markdown format. You can use the toolbar above for quick formatting or keyboard shortcuts:

- **Bold**: ⌘B or Ctrl+B
- *Italic*: ⌘I or Ctrl+I
- `Code`: ⌘` or Ctrl+`
- [Link](url): ⌘K or Ctrl+K

```javascript
console.log('Hello, KaneDocs!');
```

💡 **Tip:** Use the AI Generate button to create documentation automatically!"
              className="flex-1 p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm leading-relaxed resize-none focus:outline-none border-r border-gray-200 dark:border-gray-700 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600"
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
            />
            <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-800 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
              <MarkdownRenderer content={content} />
            </div>
          </div>
        ) : (
          <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
            <MarkdownRenderer content={content} />
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showMoreTools && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowMoreTools(false)}
        />
      )}
    </div>
  );
}