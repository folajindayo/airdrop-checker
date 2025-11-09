'use client';

import * as React from 'react';
import {
  Folder,
  File,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  MoreVertical,
  Download,
  Trash2,
  Edit,
  Share2,
  Copy,
  Move,
  Grid,
  List,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  mimeType?: string;
  modifiedAt: Date;
  thumbnail?: string;
}

export interface FileManagerProps {
  files: FileItem[];
  onFileSelect?: (file: FileItem) => void;
  onFileDelete?: (file: FileItem) => void;
  onFileRename?: (file: FileItem, newName: string) => void;
  onFileMove?: (file: FileItem, destination: string) => void;
  onFolderOpen?: (folder: FileItem) => void;
  viewMode?: 'grid' | 'list';
  className?: string;
}

export function FileManager({
  files,
  onFileSelect,
  onFileDelete,
  onFileRename,
  onFileMove,
  onFolderOpen,
  viewMode: initialViewMode = 'grid',
  className,
}: FileManagerProps) {
  const [viewMode, setViewMode] = React.useState(initialViewMode);
  const [selectedFiles, setSelectedFiles] = React.useState<Set<string>>(new Set());
  const [renamingFile, setRenamingFile] = React.useState<string | null>(null);
  const [newName, setNewName] = React.useState('');

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') {
      return <Folder className="h-8 w-8 text-blue-500" />;
    }

    const mime = file.mimeType || '';
    if (mime.startsWith('image/')) {
      return <ImageIcon className="h-8 w-8 text-green-500" />;
    }
    if (mime.startsWith('video/')) {
      return <Video className="h-8 w-8 text-purple-500" />;
    }
    if (mime.startsWith('audio/')) {
      return <Music className="h-8 w-8 text-pink-500" />;
    }
    if (mime.includes('zip') || mime.includes('archive')) {
      return <Archive className="h-8 w-8 text-orange-500" />;
    }
    if (mime.includes('text') || mime.includes('document')) {
      return <FileText className="h-8 w-8 text-blue-500" />;
    }
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'folder') {
      onFolderOpen?.(file);
    } else {
      onFileSelect?.(file);
    }
  };

  const handleRename = (file: FileItem) => {
    setRenamingFile(file.id);
    setNewName(file.name);
  };

  const handleRenameSubmit = (file: FileItem) => {
    if (newName && newName !== file.name) {
      onFileRename?.(file, newName);
    }
    setRenamingFile(null);
  };

  const toggleSelection = (fileId: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      newSelection.add(fileId);
    }
    setSelectedFiles(newSelection);
  };

  if (viewMode === 'grid') {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedFiles.size > 0 && (
              <span className="text-sm text-muted-foreground">
                {selectedFiles.size} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Grid view */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {files.map((file) => (
            <Card
              key={file.id}
              className={cn(
                'group cursor-pointer transition-all hover:shadow-md',
                selectedFiles.has(file.id) && 'ring-2 ring-primary'
              )}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Checkbox */}
                  <div className="flex items-start justify-between">
                    <Checkbox
                      checked={selectedFiles.has(file.id)}
                      onCheckedChange={() => toggleSelection(file.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleFileClick(file)}>
                          <Download className="h-4 w-4 mr-2" />
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRename(file)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onFileDelete?.(file)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* File icon/thumbnail */}
                  <div
                    onClick={() => handleFileClick(file)}
                    className="flex items-center justify-center h-20"
                  >
                    {file.thumbnail ? (
                      <img
                        src={file.thumbnail}
                        alt={file.name}
                        className="max-h-full max-w-full rounded"
                      />
                    ) : (
                      getFileIcon(file)
                    )}
                  </div>

                  {/* File name */}
                  <div onClick={() => handleFileClick(file)}>
                    {renamingFile === file.id ? (
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onBlur={() => handleRenameSubmit(file)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameSubmit(file);
                          if (e.key === 'Escape') setRenamingFile(null);
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        className="h-7 text-xs"
                      />
                    ) : (
                      <p className="text-sm font-medium truncate">{file.name}</p>
                    )}
                    {file.size && (
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedFiles.size > 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedFiles.size} selected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* List view */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="w-12 p-3">
                <Checkbox />
              </th>
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Size</th>
              <th className="text-left p-3 font-medium">Modified</th>
              <th className="w-12 p-3"></th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr
                key={file.id}
                className={cn(
                  'border-b hover:bg-muted/50 cursor-pointer',
                  selectedFiles.has(file.id) && 'bg-primary/5'
                )}
                onClick={() => handleFileClick(file)}
              >
                <td className="p-3">
                  <Checkbox
                    checked={selectedFiles.has(file.id)}
                    onCheckedChange={() => toggleSelection(file.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file)}
                    {renamingFile === file.id ? (
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onBlur={() => handleRenameSubmit(file)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameSubmit(file);
                          if (e.key === 'Escape') setRenamingFile(null);
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        className="h-7 max-w-xs"
                      />
                    ) : (
                      <span className="font-medium">{file.name}</span>
                    )}
                  </div>
                </td>
                <td className="p-3 text-sm text-muted-foreground">
                  {formatFileSize(file.size)}
                </td>
                <td className="p-3 text-sm text-muted-foreground">
                  {file.modifiedAt.toLocaleDateString()}
                </td>
                <td className="p-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleFileClick(file)}>
                        <Download className="h-4 w-4 mr-2" />
                        Open
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRename(file)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onFileDelete?.(file)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Simple file browser
export function FileBrowser({
  files,
  onFileSelect,
  className,
}: {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {files.map((file) => (
        <button
          key={file.id}
          onClick={() => onFileSelect(file)}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent text-left"
        >
          {file.type === 'folder' ? (
            <Folder className="h-5 w-5 text-blue-500" />
          ) : (
            <File className="h-5 w-5 text-gray-500" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{file.name}</p>
            {file.size && (
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

