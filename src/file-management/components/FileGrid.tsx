// FileGrid Component
// Main file display with grid/list view and controls

import { useState } from 'react';
import { 
  Grid3X3, 
  List, 
  Search, 
  SortAsc, 
  SortDesc,
  Filter,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileCard } from './FileCard';
import { FileListItem } from './FileListItem';
import { UserFile, FilePermission, FileType, FileSortBy, FileSortOrder, FileViewMode } from '../types';
import { cn } from '@/lib/utils';

export interface FileGridProps {
  files: UserFile[];
  permissions?: FilePermission[];
  agentAvatars?: Record<string, string>;
  selectedFileIds?: string[];
  onSelectionChange?: (fileIds: string[]) => void;
  onFilePreview?: (file: UserFile) => void;
  onFileDownload?: (file: UserFile) => void;
  onFileDelete?: (file: UserFile) => void;
  onManagePermissions?: (file: UserFile) => void;
  className?: string;
}

const FILE_TYPE_OPTIONS: FileType[] = [
  'pdf', 'docx', 'xlsx', 'csv', 'txt', 'png', 'jpg', 'json', 'md'
];

export function FileGrid({
  files,
  permissions = [],
  agentAvatars = {},
  selectedFileIds = [],
  onSelectionChange,
  onFilePreview,
  onFileDownload,
  onFileDelete,
  onManagePermissions,
  className,
}: FileGridProps) {
  const [viewMode, setViewMode] = useState<FileViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<FileSortBy>('date');
  const [sortOrder, setSortOrder] = useState<FileSortOrder>('desc');
  const [typeFilters, setTypeFilters] = useState<FileType[]>([]);
  
  // Filter files
  const filteredFiles = files.filter((file) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = file.name.toLowerCase().includes(query);
      const matchesTags = file.tags.some(t => t.toLowerCase().includes(query));
      if (!matchesName && !matchesTags) return false;
    }
    
    // Type filter
    if (typeFilters.length > 0 && !typeFilters.includes(file.type)) {
      return false;
    }
    
    return true;
  });
  
  // Sort files
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'relevance':
        comparison = (a.relevanceScore || 0) - (b.relevanceScore || 0);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  // Handle file selection
  const handleFileSelect = (fileId: string, selected: boolean) => {
    if (!onSelectionChange) return;
    
    if (selected) {
      onSelectionChange([...selectedFileIds, fileId]);
    } else {
      onSelectionChange(selectedFileIds.filter(id => id !== fileId));
    }
  };
  
  // Get permissions for a specific file
  const getFilePermissions = (fileId: string) => {
    return permissions.filter(p => p.fileId === fileId);
  };
  
  // Toggle type filter
  const toggleTypeFilter = (type: FileType) => {
    if (typeFilters.includes(type)) {
      setTypeFilters(typeFilters.filter(t => t !== type));
    } else {
      setTypeFilters([...typeFilters, type]);
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilters([]);
  };
  
  const hasActiveFilters = searchQuery || typeFilters.length > 0;
  
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        {/* Filter & Sort Controls */}
        <div className="flex items-center gap-2">
          {/* Type Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
                {typeFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5">
                    {typeFilters.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
              <DropdownMenuLabel>File Types</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {FILE_TYPE_OPTIONS.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={typeFilters.includes(type)}
                  onCheckedChange={() => toggleTypeFilter(type)}
                >
                  {type.toUpperCase()}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Sort */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as FileSortBy)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="size">Size</SelectItem>
              <SelectItem value="type">Type</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>
          
          {/* View Toggle */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-r-none"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-l-none"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30">
          <span className="text-xs text-muted-foreground">Filters:</span>
          {typeFilters.map((type) => (
            <Badge 
              key={type} 
              variant="secondary" 
              className="gap-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => toggleTypeFilter(type)}
            >
              {type.toUpperCase()}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={clearFilters}
          >
            Clear all
          </Button>
        </div>
      )}
      
      {/* Results Count */}
      <div className="px-4 py-2 text-sm text-muted-foreground">
        {sortedFiles.length} file{sortedFiles.length !== 1 ? 's' : ''}
        {hasActiveFilters && ` (filtered from ${files.length})`}
      </div>
      
      {/* File Display */}
      <ScrollArea className="flex-1">
        {sortedFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Search className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No files found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
            {sortedFiles.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                isSelected={selectedFileIds.includes(file.id)}
                onSelect={onSelectionChange ? handleFileSelect : undefined}
                onPreview={onFilePreview}
                onDownload={onFileDownload}
                onDelete={onFileDelete}
                onManagePermissions={onManagePermissions}
                permissions={getFilePermissions(file.id)}
                agentAvatars={agentAvatars}
              />
            ))}
          </div>
        ) : (
          <div className="divide-y">
            {sortedFiles.map((file) => (
              <FileListItem
                key={file.id}
                file={file}
                isSelected={selectedFileIds.includes(file.id)}
                onSelect={onSelectionChange ? handleFileSelect : undefined}
                onPreview={onFilePreview}
                onDownload={onFileDownload}
                onDelete={onFileDelete}
                onManagePermissions={onManagePermissions}
                permissions={getFilePermissions(file.id)}
                agentAvatars={agentAvatars}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
