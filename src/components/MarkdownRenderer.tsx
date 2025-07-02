import React, { useEffect, useState } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { Copy, Check, Download, ExternalLink } from 'lucide-react';

// Configure marked with enhanced syntax highlighting
marked.setOptions({
  breaks: true,
  gfm: true,
});
marked.use({
  renderer: {
    code(code: string, infostring: string | undefined, escaped: boolean) {
      const lang = (infostring || '').match(/\S*/)?.[0];
      let highlighted = '';
      if (lang && hljs.getLanguage(lang)) {
        try {
          highlighted = hljs.highlight(code, { language: lang }).value;
        } catch (err) {
          console.error('Highlight.js error:', err);
          highlighted = hljs.highlightAuto(code).value;
        }
      } else {
        highlighted = hljs.highlightAuto(code).value;
      }
      return `<pre><code class="language-${lang}">${highlighted}</code></pre>`;
    }
  }
});

marked.use({
  async: false,
});

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    const parseMarkdown = async () => {
      try {
        const html = await marked.parse(content);
        setHtmlContent(html);
      } catch (err) {
        console.error('Markdown parsing error:', err);
        setHtmlContent(`<p>Error parsing markdown content</p>`);
      }
    };

    parseMarkdown();
  }, [content]);

  useEffect(() => {
    // Enhanced code block functionality
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach((block, index) => {
      const pre = block.parentElement;
      if (pre && !pre.querySelector('.code-header')) {
        pre.style.position = 'relative';
        pre.classList.add('group');
        
        // Detect language
        const className = block.className;
        const langMatch = className.match(/language-(\w+)/);
        const language = langMatch ? langMatch[1] : 'text';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'code-header flex items-center justify-between px-4 py-2 bg-slate-800 dark:bg-slate-900 border-b border-slate-700 text-sm';
        header.innerHTML = `
          <div class="flex items-center gap-3">
            <span class="text-slate-300 font-medium">Code</span>
            <span class="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full font-mono">${language}</span>
          </div>
          <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button class="copy-btn p-1.5 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" title="Copy code">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                <path d="M4 16c-1.1 0-2-.9-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
              </svg>
            </button>
            <button class="download-btn p-1.5 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" title="Download code">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7,10 12,15 17,10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
          </div>
        `;
        
        // Style the pre element
        pre.classList.add('bg-slate-900', 'dark:bg-slate-950', 'rounded-lg', 'overflow-hidden', 'border', 'border-slate-700', 'my-6');
        pre.style.margin = '1.5rem 0';
        
        // Insert header
        pre.insertBefore(header, block);
        
        // Style the code block
        block.parentElement!.style.background = 'rgb(15 23 42)';
        block.parentElement!.style.padding = '1rem';
        block.parentElement!.style.margin = '0';
        block.parentElement!.style.borderRadius = '0 0 0.5rem 0.5rem';
        
        // Add copy functionality
        const copyBtn = header.querySelector('.copy-btn');
        const downloadBtn = header.querySelector('.download-btn');
        
        copyBtn?.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(block.textContent || '');
            copyBtn.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
            `;
            setTimeout(() => {
              copyBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                  <path d="M4 16c-1.1 0-2-.9-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                </svg>
              `;
            }, 2000);
          } catch (err) {
            console.error('Failed to copy:', err);
          }
        });
        
        downloadBtn?.addEventListener('click', () => {
          const blob = new Blob([block.textContent || ''], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `code.${language}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      }
    });

    // Enhanced table styling
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
      table.classList.add('w-full', 'border-collapse', 'border', 'border-slate-300', 'dark:border-slate-600', 'rounded-lg', 'overflow-hidden', 'my-6');
      
      const thead = table.querySelector('thead');
      if (thead) {
        thead.classList.add('bg-slate-50', 'dark:bg-slate-800');
      }
      
      const ths = table.querySelectorAll('th');
      ths.forEach(th => {
        th.classList.add('px-4', 'py-3', 'text-left', 'font-semibold', 'text-slate-900', 'dark:text-white', 'border-b', 'border-slate-300', 'dark:border-slate-600');
      });
      
      const tds = table.querySelectorAll('td');
      tds.forEach(td => {
        td.classList.add('px-4', 'py-3', 'border-b', 'border-slate-200', 'dark:border-slate-700');
      });
    });

    // Enhanced blockquote styling
    const blockquotes = document.querySelectorAll('blockquote');
    blockquotes.forEach(blockquote => {
      blockquote.classList.add('border-l-4', 'border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20', 'p-4', 'rounded-r-lg', 'my-6');
    });

    // Enhanced link styling
    const links = document.querySelectorAll('a');
    links.forEach(link => {
      link.classList.add('text-blue-600', 'dark:text-blue-400', 'hover:text-blue-800', 'dark:hover:text-blue-300', 'underline', 'transition-colors');
      
      // Add external link icon for external links
      if (link.hostname && link.hostname !== window.location.hostname) {
        link.classList.add('inline-flex', 'items-center', 'gap-1');
        link.innerHTML += `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15,3 21,3 21,9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        `;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
    });

    // Enhanced heading styling
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => {
      heading.classList.add('font-bold', 'text-slate-900', 'dark:text-white', 'scroll-mt-20');
      
      // Add anchor links to headings
      if (!heading.id) return;
      
      const anchor = document.createElement('a');
      anchor.href = `#${heading.id}`;
      anchor.classList.add('ml-2', 'text-slate-400', 'hover:text-slate-600', 'dark:hover:text-slate-300', 'opacity-0', 'group-hover:opacity-100', 'transition-opacity');
      anchor.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
      `;
      
      heading.classList.add('group', 'flex', 'items-center');
      heading.appendChild(anchor);
    });

    // Enhance lists
    const lists = document.querySelectorAll('ul, ol');
    lists.forEach(list => {
      list.classList.add('my-4', 'pl-6');
      
      const items = list.querySelectorAll('li');
      items.forEach(item => {
        item.classList.add('mb-2');
      });
    });

    // Enhance code inline
    const inlineCode = document.querySelectorAll('code:not(pre code)');
    inlineCode.forEach(code => {
      code.classList.add('px-1.5', 'py-0.5', 'bg-slate-100', 'dark:bg-slate-800', 'rounded', 'text-slate-800', 'dark:text-slate-200', 'text-sm', 'font-mono');
    });

    // Add smooth scrolling to anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLAnchorElement;
        const targetId = target.getAttribute('href')?.substring(1);
        if (!targetId) return;
        
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Update URL without page jump
          history.pushState(null, '', `#${targetId}`);
        }
      });
    });
  }, [htmlContent]);

  return (
    <div
      className={`prose prose-slate dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{
        '--tw-prose-body': 'rgb(51 65 85)',
        '--tw-prose-headings': 'rgb(15 23 42)',
        '--tw-prose-lead': 'rgb(71 85 105)',
        '--tw-prose-links': 'rgb(37 99 235)',
        '--tw-prose-bold': 'rgb(15 23 42)',
        '--tw-prose-counters': 'rgb(100 116 139)',
        '--tw-prose-bullets': 'rgb(203 213 225)',
        '--tw-prose-hr': 'rgb(226 232 240)',
        '--tw-prose-quotes': 'rgb(15 23 42)',
        '--tw-prose-quote-borders': 'rgb(226 232 240)',
        '--tw-prose-captions': 'rgb(100 116 139)',
        '--tw-prose-code': 'rgb(15 23 42)',
        '--tw-prose-pre-code': 'rgb(226 232 240)',
        '--tw-prose-pre-bg': 'rgb(15 23 42)',
        '--tw-prose-th-borders': 'rgb(203 213 225)',
        '--tw-prose-td-borders': 'rgb(226 232 240)',
        '--tw-prose-invert-body': 'rgb(203 213 225)',
        '--tw-prose-invert-headings': 'rgb(248 250 252)',
        '--tw-prose-invert-lead': 'rgb(148 163 184)',
        '--tw-prose-invert-links': 'rgb(96 165 250)',
        '--tw-prose-invert-bold': 'rgb(248 250 252)',
        '--tw-prose-invert-counters': 'rgb(148 163 184)',
        '--tw-prose-invert-bullets': 'rgb(71 85 105)',
        '--tw-prose-invert-hr': 'rgb(51 65 85)',
        '--tw-prose-invert-quotes': 'rgb(241 245 249)',
        '--tw-prose-invert-quote-borders': 'rgb(51 65 85)',
        '--tw-prose-invert-captions': 'rgb(148 163 184)',
        '--tw-prose-invert-code': 'rgb(248 250 252)',
        '--tw-prose-invert-pre-code': 'rgb(203 213 225)',
        '--tw-prose-invert-pre-bg': 'rgb(0 0 0 / 0.5)',
        '--tw-prose-invert-th-borders': 'rgb(71 85 105)',
        '--tw-prose-invert-td-borders': 'rgb(51 65 85)',
      } as React.CSSProperties}
    />
  );
}