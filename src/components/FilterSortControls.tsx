import { useState } from 'react';
import { Filter, SortAsc, SortDesc, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type SortDirection = 'asc' | 'desc';

export interface SortOption<T extends string = string> {
  label: string;
  value: T;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface FilterSortControlsProps<T extends string = string> {
  sortOptions: SortOption<T>[];
  sortValue: T;
  sortDirection: SortDirection;
  onSortChange: (value: T, direction: SortDirection) => void;
  filterOptions?: FilterOption[];
  activeFilters?: string[];
  onFilterChange?: (filters: string[]) => void;
  className?: string;
}

export function FilterSortControls<T extends string = string>({
  sortOptions,
  sortValue,
  sortDirection,
  onSortChange,
  filterOptions,
  activeFilters = [],
  onFilterChange,
  className,
}: FilterSortControlsProps<T>) {
  const currentSort = sortOptions.find(o => o.value === sortValue);

  const toggleFilter = (value: string) => {
    if (!onFilterChange) return;
    if (activeFilters.includes(value)) {
      onFilterChange(activeFilters.filter(f => f !== value));
    } else {
      onFilterChange([...activeFilters, value]);
    }
  };

  const clearFilters = () => {
    onFilterChange?.([]);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Sort Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            {sortDirection === 'asc' ? (
              <SortAsc className="h-3.5 w-3.5" />
            ) : (
              <SortDesc className="h-3.5 w-3.5" />
            )}
            <span className="text-xs">{currentSort?.label || 'Sort'}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 bg-popover border border-border">
          <DropdownMenuLabel className="text-xs">Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onSortChange(
                  option.value,
                  sortValue === option.value && sortDirection === 'asc' ? 'desc' : 'asc'
                )}
                className="flex items-center justify-between"
              >
                <span>{option.label}</span>
                {sortValue === option.value && (
                  <span className="text-xs text-muted-foreground">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Filter Dropdown */}
      {filterOptions && filterOptions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <Filter className="h-3.5 w-3.5" />
              <span className="text-xs">Filter</span>
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 bg-popover border border-border">
            <DropdownMenuLabel className="text-xs flex items-center justify-between">
              Filter by status
              {activeFilters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1 text-xs"
                  onClick={clearFilters}
                >
                  Clear
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {filterOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => toggleFilter(option.value)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center",
                      activeFilters.includes(option.value) 
                        ? "bg-primary border-primary" 
                        : "border-border"
                    )}>
                      {activeFilters.includes(option.value) && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <span>{option.label}</span>
                  </div>
                  {option.count !== undefined && (
                    <span className="text-xs text-muted-foreground">{option.count}</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Active filter badges */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-1">
          {activeFilters.map((filter) => {
            const option = filterOptions?.find(o => o.value === filter);
            return (
              <Badge
                key={filter}
                variant="secondary"
                className="h-6 gap-1 text-xs cursor-pointer hover:bg-secondary/80"
                onClick={() => toggleFilter(filter)}
              >
                {option?.label || filter}
                <X className="h-3 w-3" />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
