import React, { useState } from 'react';
import { Folder, File, ChevronRight, ChevronDown, Plus, Trash2, FolderPlus, FilePlus } from 'lucide-react';
import { cn } from '../utils/helpers';

const FileNode = ({ node, level = 0, selectedId, onFileClick, onDelete }) => {
  const [isOpen, setIsOpen] = useState(level === 0 || node.id === 'dir-root' || node.name === 'Documents');
  const isDir = node.type === 'directory';
  const isSelected = selectedId === node.id;

  return (
    <div>
      <div 
        className={cn(
          "flex items-center group py-1.5 px-2 rounded-lg cursor-pointer transition-colors text-xs select-none",
          isSelected ? "bg-indigo-600/30 text-indigo-200 border border-indigo-500/40" : "hover:bg-slate-800/60 text-slate-300"
        )}
        style={{ paddingLeft: `${level * 14 + 8}px` }}
        onClick={() => {
          if (isDir) setIsOpen(!isOpen);
          if (onFileClick) onFileClick(node);
        }}
      >
        <div className="flex items-center flex-1 min-w-0 pr-2">
          {isDir ? (
            <span className="mr-1 text-slate-500">
              {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            </span>
          ) : (
            <span className="w-3.5 mr-1" />
          )}
          
          {isDir ? (
            <Folder className="w-4 h-4 text-amber-400 mr-2 shrink-0" />
          ) : (
            <File className="w-4 h-4 text-sky-400 mr-2 shrink-0" />
          )}
          
          <span className="font-medium truncate">{node.name}</span>
          
          {!isDir && node.size !== undefined && (
            <span className="ml-auto text-[10px] text-slate-500 font-mono pl-2">
              {node.size > 1024 ? `${(node.size / 1024).toFixed(1)} KB` : `${node.size} B`}
            </span>
          )}
        </div>
        
        {node.id !== 'dir-root' && (
          <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 shrink-0">
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(node.id, node.type); }}
              className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
      
      {isDir && isOpen && node.children && node.children.length > 0 && (
        <div className="border-l border-slate-800/80 ml-3.5">
          {node.children.map(child => (
            <FileNode 
              key={child.id} 
              node={child} 
              level={level + 1} 
              selectedId={selectedId}
              onFileClick={onFileClick}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorer = ({ tree, selectedId, onFileClick, onCreateFile, onCreateDir, onDelete }) => {
  if (!tree) {
    return (
      <div className="flex items-center justify-center h-48 bg-slate-950 border border-slate-800 rounded-xl">
        <span className="text-slate-500 text-xs">No file system tree available</span>
      </div>
    );
  }

  const rootNodes = Array.isArray(tree) ? tree : [tree];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-full overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800 bg-slate-950/80">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">File Explorer</span>
        <div className="flex items-center space-x-1">
          <button 
            onClick={onCreateFile}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center text-xs"
            title="Create New File"
          >
            <FilePlus className="w-3.5 h-3.5 mr-1 text-sky-400" />
            <span>+File</span>
          </button>
          <button 
            onClick={onCreateDir}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center text-xs"
            title="Create New Directory"
          >
            <FolderPlus className="w-3.5 h-3.5 mr-1 text-amber-400" />
            <span>+Folder</span>
          </button>
        </div>
      </div>
      <div className="p-2 overflow-y-auto flex-1 max-h-[480px]">
        {rootNodes.map(rootNode => (
          <FileNode 
            key={rootNode.id} 
            node={rootNode} 
            selectedId={selectedId}
            onFileClick={onFileClick}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;
