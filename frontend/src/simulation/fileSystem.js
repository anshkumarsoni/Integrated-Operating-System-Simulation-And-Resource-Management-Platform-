// File System Simulation Module

export class FileSystemManager {
  constructor(initialTree = []) {
    this.root = JSON.parse(JSON.stringify(initialTree));
    this.nextId = 100;
  }

  getTree() {
    return JSON.parse(JSON.stringify(this.root));
  }

  // Find node by ID recursively
  findNode(id, nodes = this.root) {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children && node.children.length > 0) {
        const found = this.findNode(id, node.children);
        if (found) return found;
      }
    }
    return null;
  }

  // Find parent directory node for a child ID
  findParent(id, nodes = this.root, parent = null) {
    for (const node of nodes) {
      if (node.id === id) return parent;
      if (node.children && node.children.length > 0) {
        const found = this.findParent(id, node.children, node);
        if (found) return found;
      }
    }
    return null;
  }

  createFile(name, parentDirId = 'dir-root', content = '', fileType = 'file', permissions = 'rw-r--r--') {
    const parent = this.findNode(parentDirId);
    if (!parent || parent.type !== 'directory') {
      return { success: false, message: 'Target directory not found' };
    }

    const fileId = `file-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
    const newFile = {
      id: fileId,
      name: name || 'new_file.txt',
      type: fileType || 'file',
      owner: 'admin',
      permissions: permissions || 'rw-r--r--',
      parentId: parentDirId,
      created: new Date().toISOString().replace('T', ' ').slice(0, 19),
      modified: new Date().toISOString().replace('T', ' ').slice(0, 19),
      size: (content || '').length || 120,
      content: content || ''
    };

    if (!parent.children) parent.children = [];
    parent.children.push(newFile);

    return { success: true, file: newFile };
  }

  readFile(fileId) {
    const node = this.findNode(fileId);
    if (!node || node.type !== 'file') {
      return { success: false, message: 'File not found' };
    }
    return { success: true, file: node };
  }

  writeFile(fileId, content) {
    const node = this.findNode(fileId);
    if (!node || node.type !== 'file') {
      return { success: false, message: 'File not found' };
    }
    node.content = content;
    node.size = content.length;
    node.modified = new Date().toISOString().replace('T', ' ').slice(0, 19);
    return { success: true, file: node };
  }

  deleteFile(fileId) {
    const parent = this.findParent(fileId);
    if (parent && parent.children) {
      parent.children = parent.children.filter(c => c.id !== fileId);
      return { success: true, id: fileId };
    }
    // Check root level
    this.root = this.root.filter(n => n.id !== fileId);
    return { success: true, id: fileId };
  }

  createDirectory(name, parentDirId = 'dir-root') {
    const parent = this.findNode(parentDirId);
    if (!parent || parent.type !== 'directory') {
      return { success: false, message: 'Parent directory not found' };
    }

    const dirId = `dir-${Date.now().toString(36)}`;
    const newDir = {
      id: dirId,
      name: name || 'New Folder',
      type: 'directory',
      owner: 'admin',
      permissions: 'rwxr-xr-x',
      parentId: parentDirId,
      created: new Date().toISOString().replace('T', ' ').slice(0, 19),
      modified: new Date().toISOString().replace('T', ' ').slice(0, 19),
      size: 4096,
      children: []
    };

    if (!parent.children) parent.children = [];
    parent.children.push(newDir);

    return { success: true, directory: newDir };
  }

  deleteDirectory(dirId) {
    if (dirId === 'dir-root') {
      return { success: false, message: 'Cannot delete root directory' };
    }
    return this.deleteFile(dirId);
  }

  updatePermissions(fileId, permissions) {
    const node = this.findNode(fileId);
    if (!node) {
      return { success: false, message: 'Item not found' };
    }
    node.permissions = permissions;
    node.modified = new Date().toISOString().replace('T', ' ').slice(0, 19);
    return { success: true, file: node };
  }

  getStats(nodes = this.root) {
    let files = 0;
    let directories = 0;

    const count = (items) => {
      for (const item of items) {
        if (item.type === 'directory') {
          directories++;
          if (item.children) count(item.children);
        } else {
          files++;
        }
      }
    };

    count(nodes);
    return { totalFiles: files, totalDirectories: directories };
  }
}
