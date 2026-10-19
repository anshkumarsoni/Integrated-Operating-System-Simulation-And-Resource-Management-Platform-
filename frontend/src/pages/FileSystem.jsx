import React, { useState } from 'react';
import { FolderTree, File, Folder, Plus, Trash2, Edit3, Save, Shield, Clock, HardDrive, CheckCircle2 } from 'lucide-react';
import { useSimulation } from '../hooks/useSimulation';
import FileExplorer from '../components/FileExplorer';
import Modal from '../components/Modal';
import { formatBytes } from '../utils/helpers';

export default function FileSystem() {
  const { osService, refreshAll } = useSimulation();

  const [tree, setTree] = useState(() => osService.getFileTree());
  const [selectedItem, setSelectedItem] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [permissions, setPermissions] = useState('rw-r--r--');

  // Modal States
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [isNewDirModalOpen, setIsNewDirModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [newDirName, setNewDirName] = useState('');
  const [parentDirId, setParentDirId] = useState('dir-root');
  const [message, setMessage] = useState('');

  const refreshTree = () => {
    const updated = osService.getFileTree();
    setTree(updated);
    refreshAll();
  };

  const handleFileSelect = (node) => {
    setSelectedItem(node);
    if (node.type === 'file') {
      setFileContent(node.content || '');
      setPermissions(node.permissions || 'rw-r--r--');
    }
  };

  const handleSaveFileContent = () => {
    if (!selectedItem || selectedItem.type !== 'file') return;
    osService.writeFile(selectedItem.id, fileContent);
    osService.updateFilePermissions(selectedItem.id, permissions);
    refreshTree();
    setMessage(`Saved modifications to ${selectedItem.name}`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteItem = (id, type) => {
    if (window.confirm(`Delete this ${type}? This operation cannot be undone.`)) {
      if (type === 'directory') {
        osService.deleteDirectory(id);
      } else {
        osService.deleteFile(id);
      }
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
      refreshTree();
      setMessage(`Deleted ${type}`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleCreateFileSubmit = (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    osService.createFile(newFileName.trim(), parentDirId, newFileContent);
    refreshTree();
    setIsNewFileModalOpen(false);
    setNewFileName('');
    setNewFileContent('');
    setMessage(`File created successfully.`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCreateDirSubmit = (e) => {
    e.preventDefault();
    if (!newDirName.trim()) return;
    osService.createDirectory(newDirName.trim(), parentDirId);
    refreshTree();
    setIsNewDirModalOpen(false);
    setNewDirName('');
    setMessage(`Directory created successfully.`);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Virtual File System & Permissions</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Hierarchical directory tree, file operations (create, read, write, delete), POSIX permissions, and inode metadata.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage('')} className="font-bold ml-3">✕</button>
        </div>
      )}

      {/* Main File Explorer & Viewer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: File Tree Explorer */}
        <div className="lg:col-span-1">
          <FileExplorer
            tree={tree}
            selectedId={selectedItem?.id}
            onFileClick={handleFileSelect}
            onCreateFile={() => {
              setParentDirId(selectedItem?.type === 'directory' ? selectedItem.id : 'dir-root');
              setIsNewFileModalOpen(true);
            }}
            onCreateDir={() => {
              setParentDirId(selectedItem?.type === 'directory' ? selectedItem.id : 'dir-root');
              setIsNewDirModalOpen(true);
            }}
            onDelete={handleDeleteItem}
          />
        </div>

        {/* Right Columns: File Editor & Metadata Panel */}
        <div className="lg:col-span-2 space-y-6">
          {selectedItem ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 animate-in fade-in">
              {/* Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl ${
                    selectedItem.type === 'directory' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                  }`}>
                    {selectedItem.type === 'directory' ? <Folder className="w-6 h-6" /> : <File className="w-6 h-6" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white font-mono">{selectedItem.name}</h2>
                    <span className="text-xs text-slate-400 font-mono">Type: {selectedItem.type} | ID: {selectedItem.id}</span>
                  </div>
                </div>

                {selectedItem.type === 'file' && (
                  <button
                    onClick={handleSaveFileContent}
                    className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/30"
                  >
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Save Changes
                  </button>
                )}
              </div>

              {/* Inode Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">Owner</span>
                  <span className="font-mono text-white font-bold">{selectedItem.owner || 'admin'}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">Size</span>
                  <span className="font-mono text-indigo-300 font-bold">{formatBytes(selectedItem.size || 0)}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">Created</span>
                  <span className="font-mono text-slate-300 text-[11px] truncate block">{selectedItem.created || 'N/A'}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">Modified</span>
                  <span className="font-mono text-slate-300 text-[11px] truncate block">{selectedItem.modified || 'N/A'}</span>
                </div>
              </div>

              {/* Permissions Editor */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center">
                    <Shield className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> POSIX File Permissions
                  </span>
                  <input
                    type="text"
                    value={permissions}
                    onChange={e => setPermissions(e.target.value)}
                    className="w-28 bg-slate-900 border border-slate-700 text-white font-mono text-xs text-center rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex gap-4 text-xs text-slate-400 font-mono pt-1">
                  <span>Owner: <strong className="text-emerald-400">rwx</strong></span>
                  <span>Group: <strong className="text-blue-400">r-x</strong></span>
                  <span>Others: <strong className="text-slate-300">r--</strong></span>
                </div>
              </div>

              {/* File Content Editor (if file) */}
              {selectedItem.type === 'file' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    File Buffer Stream
                  </label>
                  <textarea
                    rows="8"
                    value={fileContent}
                    onChange={e => setFileContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 font-mono text-xs rounded-xl p-3.5 focus:outline-none focus:border-indigo-500 leading-relaxed"
                    placeholder="Enter file text content..."
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-3">
              <FolderTree className="w-12 h-12 mx-auto text-slate-600" />
              <h3 className="text-sm font-bold text-slate-400">No Item Selected</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click any file or directory in the explorer tree on the left to inspect metadata, permissions, and stream content.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create File Modal */}
      <Modal isOpen={isNewFileModalOpen} onClose={() => setIsNewFileModalOpen(false)} title="Create New Virtual File">
        <form onSubmit={handleCreateFileSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              File Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. analysis_output.log"
              value={newFileName}
              onChange={e => setNewFileName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Initial Content
            </label>
            <textarea
              rows="4"
              placeholder="Enter initial content payload..."
              value={newFileContent}
              onChange={e => setNewFileContent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsNewFileModalOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-white rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/30"
            >
              Create File
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Directory Modal */}
      <Modal isOpen={isNewDirModalOpen} onClose={() => setIsNewDirModalOpen(false)} title="Create Directory">
        <form onSubmit={handleCreateDirSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Directory Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. SystemArchives"
              value={newDirName}
              onChange={e => setNewDirName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsNewDirModalOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-white rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/30"
            >
              Create Directory
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
