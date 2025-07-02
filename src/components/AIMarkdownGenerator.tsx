import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Loader, Copy, Check, Download, Wand2, FileText, Code, Book, Zap, X, ChevronRight, ChevronDown, Clipboard, ClipboardCheck, Clock, ArrowUp, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { clsx } from 'clsx';

interface AIMarkdownGeneratorProps {
  onGenerated?: (markdown: string) => void;
}

interface PromptTemplate {
  title: string;
  icon: React.ReactNode;
  description: string;
  prompt: string;
  category: 'api' | 'guide' | 'readme' | 'tutorial';
}

const promptTemplates: PromptTemplate[] = [
  {
    title: 'API Documentation',
    icon: <Code size={16} />,
    description: 'Generate comprehensive API documentation',
    prompt: 'Create detailed API documentation for a REST API including endpoints, request/response examples, authentication, and error handling.',
    category: 'api'
  },
  {
    title: 'Getting Started Guide',
    icon: <Zap size={16} />,
    description: 'Create installation and setup instructions',
    prompt: 'Write a comprehensive getting started guide including installation, configuration, and first steps for a new software project.',
    category: 'guide'
  },
  {
    title: 'README Template',
    icon: <FileText size={16} />,
    description: 'Generate a professional README file',
    prompt: 'Create a professional README.md file with project description, features, installation, usage examples, and contribution guidelines.',
    category: 'readme'
  },
  {
    title: 'Tutorial Guide',
    icon: <Book size={16} />,
    description: 'Step-by-step tutorial documentation',
    prompt: 'Write a detailed step-by-step tutorial guide with code examples, explanations, and best practices for learning a new technology.',
    category: 'tutorial'
  },
  {
    title: 'API Reference',
    icon: <Code size={16} />,
    description: 'Detailed API method reference',
    prompt: 'Create a comprehensive API reference documentation with detailed method descriptions, parameters, return values, and examples.',
    category: 'api'
  },
  {
    title: 'User Guide',
    icon: <Book size={16} />,
    description: 'End-user focused documentation',
    prompt: 'Write a user guide that explains how to use the software from an end-user perspective, with screenshots, examples, and troubleshooting.',
    category: 'guide'
  },
  {
    title: 'Architecture Overview',
    icon: <FileText size={16} />,
    description: 'System architecture documentation',
    prompt: 'Create a technical architecture overview document explaining the system components, data flow, and design decisions.',
    category: 'readme'
  },
  {
    title: 'Code Walkthrough',
    icon: <Code size={16} />,
    description: 'Detailed code explanation',
    prompt: 'Write a detailed code walkthrough that explains the implementation details, patterns used, and reasoning behind key decisions.',
    category: 'tutorial'
  }
];

export default function AIMarkdownGenerator({ onGenerated }: AIMarkdownGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [generatedMarkdown, setGeneratedMarkdown] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'api', label: 'API' },
    { id: 'guide', label: 'Guides' },
    { id: 'readme', label: 'README' },
    { id: 'tutorial', label: 'Tutorials' }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? promptTemplates 
    : promptTemplates.filter(template => template.category === selectedCategory);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      // Simulate AI generation with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockMarkdown = `# Generated Documentation

## Overview
This is AI-generated markdown content based on your prompt: "${prompt}"

## Features
- **Feature 1**: Comprehensive documentation structure
- **Feature 2**: Code examples and snippets
- **Feature 3**: Best practices and guidelines

## Installation

\`\`\`bash
npm install your-package
\`\`\`

## Usage

\`\`\`javascript
import { YourComponent } from 'your-package';

const instance = new YourComponent({
  option1: 'value1',
  option2: 'value2'
});
\`\`\`

## API Reference

### Method: \`initialize()\`
Initializes the component with default settings.

**Parameters:**
- \`config\` (Object): Configuration options

**Returns:**
- \`Promise<void>\`: Resolves when initialization is complete

## Examples

Here's a complete example:

\`\`\`typescript
const config = {
  apiKey: 'your-api-key',
  endpoint: 'https://api.example.com'
};

await example.initialize(config);
\`\`\`

## Contributing
Please read our contributing guidelines before submitting pull requests.

## License
MIT License - see LICENSE file for details.
`;

      setGeneratedMarkdown(mockMarkdown);
      onGenerated?.(mockMarkdown);
      
      // Scroll to the output area after generation
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Error generating markdown:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-documentation.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTemplateSelect = (template: PromptTemplate) => {
    setPrompt(template.prompt);
    setShowTemplates(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else if (showTemplates) {
          setShowTemplates(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isFullscreen, showTemplates]);

  return (
    <div className={clsx(
      "ai-generator-container bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300",
      isFullscreen ? "fixed inset-4 z-50" : "h-full"
    )}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Markdown Generator</h2>
              <p className="text-blue-100 text-sm">Generate professional documentation with AI</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Template Section - Collapsed by default */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="p-3">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Wand2 size={16} className="text-purple-500" />
              <span className="font-medium text-gray-700 dark:text-gray-300">Quick Templates</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">{promptTemplates.length} templates</span>
              {showTemplates ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
          </button>
        </div>

        {/* Template Content */}
        {showTemplates && (
          <div className="p-3 animate-slide-up">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={clsx(
                    "px-3 py-1 text-xs rounded-full transition-colors",
                    selectedCategory === category.id
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
              {filteredTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => handleTemplateSelect(template)}
                  className="flex flex-col items-center p-3 text-center bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors group border border-gray-200 dark:border-gray-600"
                >
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors mb-2">
                    {template.icon}
                  </div>
                  <h4 className="text-xs font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {template.title}
                  </h4>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row h-[calc(100%-8rem)]">
        {/* Input Section */}
        <div className="w-full md:w-1/2 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Prompt Input */}
          <div className="flex-1 p-4 flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Describe what you want to generate
            </label>
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="E.g., Create API documentation for a REST API with authentication, CRUD operations, and error handling examples..."
              className="flex-1 w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600"
            />
            <div className="flex items-center justify-between mt-4">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Press Cmd/Ctrl + Enter to generate
              </div>
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Generate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="w-full md:w-1/2 flex flex-col" ref={outputRef}>
          {generatedMarkdown ? (
            <>
              {/* Output Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Generated Markdown
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {copied ? (
                        <>
                          <ClipboardCheck className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Clipboard className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Markdown Preview - Scrollable */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 p-6">
                  <MarkdownRenderer content={generatedMarkdown} />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Empty State */}
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-2xl">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Ready to Generate Documentation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    Choose a template or describe what you want to create. Our AI will generate 
                    professional markdown documentation with proper formatting, code examples, 
                    and best practices.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>API Documentation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span>User Guides</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                      <span>README Files</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Tutorials</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}