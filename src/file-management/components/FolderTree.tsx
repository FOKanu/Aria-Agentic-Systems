// FolderTree Component
// Sidebar folder navigation with collapsible structure

import { useState } from 'react';
import { 
  ChevronRight, 
  Folder, 
  FolderOpen, 
  FolderPlus,
  MoreVertical,
  Edit2,
  Trash2,
  Files
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileFolder } from '../types';
import { cn } from '@/lib/utils';

export interface FolderTreeProps {
  folders: FileFolder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder?: (name: string, parentId: string | null) => void;
  onRenameFolder?: (folderId: string, newName: string) => void;
  onDeleteFolder?: (folderId: string) => void;
  fileCounts?: Record<string, number>;
  className?: string;
}

interface FolderNodeProps {
  folder: FileFolder;
  level: number;
  isSelected: boolean;
  childFolders: FileFolder[];
  allFolders: FileFolder[];
  fileCounts: Record<string, number>;
  onSelect: (folderId: string) => void;
  onRename?: (folderId: string, newName: string) => void;
  onDelete?: (folderId: string) => void;
}

function FolderNode({
  folder,
  level,
  isSelected,
  childFolders,
  allFolders,
  fileCounts,
  onSelect,
  onRename,
  onDelete,
}: FolderNodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);
  
  const hasChildren = childFolders.length > 0;
  const fileCount = fileCounts[folder.id] || 0;
  
  const handleRename = () => {
    if (editName.trim() && editName !== folder.name) {
      onRename?.(folder.id, editName.trim());
    }
    setIsEditing(false);
  };
  
  // Get children of children for recursive rendering
  const getChildFolders = (parentId: string) => 
    allFolders.filter(f => f.parentId === parentId);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={cn(
          'group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer',
          'hover:bg-muted/50 transition-colors',
          isSelected && 'bg-primary/10 text-primary'
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => onSelect(folder.id)}
      >
        {/* Expand Toggle */}
        {hasChildren ? (
          <CollapsibleTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
              <ChevronRight 
                className={cn(
                  'h-4 w-4 transition-transform',
                  isOpen && 'rotate-90'
                )} 
              />
            </Button>
          </CollapsibleTrigger>
        ) : (
          <div className="w-5" />
        )}
        
        {/* Folder Icon */}
        {isOpen ? (
          <FolderOpen className="h-4 w-4 text-primary shrink-0" />
        ) : (
          <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        
        {/* Folder Name */}
        {isEditing ? (
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            className="h-6 text-sm py-0 px-1"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 text-sm truncate">{folder.name}</span>
        )}
        
        {/* File Count */}
        {fileCount > 0 && !isEditing && (
          <span className="text-xs text-muted-foreground">{fileCount}</span>
        )}
        
        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover z-50">
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete?.(folder.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Child Folders */}
      {hasChildren && (
        <CollapsibleContent>
          {childFolders.map((childFolder) => (
            <FolderNode
              key={childFolder.id}
              folder={childFolder}
              level={level + 1}
              isSelected={false}
              childFolders={getChildFolders(childFolder.id)}
              allFolders={allFolders}
              fileCounts={fileCounts}
              onSelect={onSelect}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

export function FolderTree({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  fileCounts = {},
  className,
}: FolderTreeProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // Get root folders (no parent)
  const rootFolders = folders.filter(f => f.parentId === null);
  
  // Get child folders for a given parent
  const getChildFolders = (parentId: string) => 
    folders.filter(f => f.parentId === parentId);
  
  // Create new folder
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder?.(newFolderName.trim(), null);
      setNewFolderName('');
      setIsCreating(false);
    }
  };
  
  // Calculate total files without folder
  const rootFileCount = fileCounts['root'] || 0;
  
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <h3 className="font-medium text-sm">Folders</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7"
          onClick={() => setIsCreating(true)}
        >
          <FolderPlus className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* All Files */}
          <div
            className={cn(
              'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer',
              'hover:bg-muted/50 transition-colors',
              selectedFolderId === null && 'bg-primary/10 text-primary'
            )}
            onClick={() => onSelectFolder(null)}
          >
            <Files className="h-4 w-4" />
            <span className="flex-1 text-sm">All Files</span>
          </div>
          
          {/* Root Files */}
          <div
            className={cn(
              'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer',
              'hover:bg-muted/50 transition-colors',
              selectedFolderId === 'root' && 'bg-primary/10 text-primary'
            )}
            onClick={() => onSelectFolder('root')}
          >
            <Folder className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-sm">Unfiled</span>
            {rootFileCount > 0 && (
              <span className="text-xs text-muted-foreground">{rootFileCount}</span>
            )}
          </div>
          
          {/* New Folder Input */}
          {isCreating && (
            <div className="flex items-center gap-2 px-2 py-1">
              <Folder className="h-4 w-4 text-muted-foreground" />
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onBlur={() => {
                  if (!newFolderName.trim()) setIsCreating(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFolder();
                  if (e.key === 'Escape') {
                    setIsCreating(false);
                    setNewFolderName('');
                  }
                }}
                placeholder="New folder..."
                className="h-6 text-sm py-0"
                autoFocus
              />
            </div>
          )}
          
          {/* Folder Tree */}
          {rootFolders.map((folder) => (
            <FolderNode
              key={folder.id}
              folder={folder}
              level={0}
              isSelected={selectedFolderId === folder.id}
              childFolders={getChildFolders(folder.id)}
              allFolders={folders}
              fileCounts={fileCounts}
              onSelect={onSelectFolder}
              onRename={onRenameFolder}
              onDelete={onDeleteFolder}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
