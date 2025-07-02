import React, { useState } from 'react';
import { Tag, Plus, X, Calendar, GitCommit, Download, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';

interface TagData {
  id: string;
  name: string;
  version: string;
  commitSha: string;
  message: string;
  author: string;
  date: string;
  isPrerelease: boolean;
  downloads?: number;
}

interface TagManagerProps {
  tags: TagData[];
  onCreateTag?: (tag: Omit<TagData, 'id'>) => void;
  onDeleteTag?: (tagId: string) => void;
}

export default function TagManager({ tags, onCreateTag, onDeleteTag }: TagManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTag, setNewTag] = useState({
    name: '',
    version: '',
    message: '',
    isPrerelease: false
  });

  const handleCreateTag = () => {
    if (!newTag.name.trim() || !newTag.version.trim()) return;

    const tag: Omit<TagData, 'id'> = {
      name: newTag.name,
      version: newTag.version,
      commitSha: 'abc123def', // This would come from current commit
      message: newTag.message || `Release ${newTag.version}`,
      author: 'Current User',
      date: new Date().toISOString(),
      isPrerelease: newTag.isPrerelease,
      downloads: 0
    };

    onCreateTag?.(tag);
    setNewTag({ name: '', version: '', message: '', isPrerelease: false });
    setShowCreateForm(false);
  };

  const getTagColor = (tag: TagData) => {
    if (tag.isPrerelease) {
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
    }
    return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Releases & Tags
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage version tags and releases for your documentation
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
        >
          <Plus size={16} />
          Create Release
        </button>
      </div>

      {/* Create Tag Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Create New Release
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tag Name
                </label>
                <input
                  type="text"
                  value={newTag.name}
                  onChange={(e) => setNewTag(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="v1.0.0"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Version
                </label>
                <input
                  type="text"
                  value={newTag.version}
                  onChange={(e) => setNewTag(prev => ({ ...prev, version: e.target.value }))}
                  placeholder="1.0.0"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Release Notes
              </label>
              <textarea
                value={newTag.message}
                onChange={(e) => setNewTag(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Describe what's new in this release..."
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="prerelease"
                checked={newTag.isPrerelease}
                onChange={(e) => setNewTag(prev => ({ ...prev, isPrerelease: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="prerelease" className="text-sm text-slate-700 dark:text-slate-300">
                This is a pre-release
              </label>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={handleCreateTag}
                disabled={!newTag.name.trim() || !newTag.version.trim()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Create Release
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tags List */}
      <div className="space-y-4">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Tag className="text-slate-500" size={20} />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {tag.name}
                  </h3>
                  <span className={clsx(
                    'px-3 py-1 rounded-full text-sm font-medium border',
                    getTagColor(tag)
                  )}>
                    {tag.isPrerelease ? 'Pre-release' : 'Latest'}
                  </span>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {tag.message}
                </p>

                <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <GitCommit size={14} />
                    <span className="font-mono">{tag.commitSha.substring(0, 7)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{new Date(tag.date).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span>by {tag.author}</span>
                  </div>
                  {tag.downloads !== undefined && (
                    <div className="flex items-center gap-1">
                      <Download size={14} />
                      <span>{tag.downloads} downloads</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all">
                  <Download size={16} />
                </button>
                <button className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all">
                  <ExternalLink size={16} />
                </button>
                {onDeleteTag && (
                  <button
                    onClick={() => onDeleteTag(tag.id)}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {tags.length === 0 && (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <Tag className="mx-auto mb-4 text-slate-400" size={48} />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No releases yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Create your first release to tag important versions of your documentation.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Create First Release
            </button>
          </div>
        )}
      </div>
    </div>
  );
}