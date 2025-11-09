'use client';

import * as React from 'react';
import { GripVertical, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface SortableItem {
  id: string;
  [key: string]: any;
}

export interface SortableListProps<T extends SortableItem> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  disabled?: boolean;
  className?: string;
  itemClassName?: string;
}

export function SortableList<T extends SortableItem>({
  items,
  onReorder,
  renderItem,
  disabled = false,
  className,
  itemClassName,
}: SortableListProps<T>) {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  const handleDragStart = (index: number) => {
    if (disabled) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (disabled || draggedIndex === null) return;
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (disabled || draggedIndex === null) return;

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];

    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);

    onReorder(newItems);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item, index) => (
        <div
          key={item.id}
          draggable={!disabled}
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={() => handleDrop(index)}
          onDragEnd={handleDragEnd}
          className={cn(
            'flex items-center gap-2 group',
            draggedIndex === index && 'opacity-50',
            dragOverIndex === index && 'border-t-2 border-primary',
            !disabled && 'cursor-move',
            itemClassName
          )}
        >
          {!disabled && (
            <GripVertical className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing flex-shrink-0" />
          )}
          <div className="flex-1">{renderItem(item, index)}</div>
        </div>
      ))}
    </div>
  );
}

// Watchlist sortable
export function SortableWatchlist({
  addresses,
  onReorder,
  onRemove,
  className,
}: {
  addresses: Array<{
    id: string;
    address: string;
    nickname?: string;
    score?: number;
  }>;
  onReorder: (addresses: typeof addresses) => void;
  onRemove?: (id: string) => void;
  className?: string;
}) {
  return (
    <SortableList
      items={addresses}
      onReorder={onReorder}
      className={className}
      renderItem={(item) => (
        <Card className="p-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {item.nickname && (
              <p className="font-medium mb-1">{item.nickname}</p>
            )}
            <p className="text-sm font-mono text-muted-foreground truncate">
              {item.address}
            </p>
          </div>
          {item.score !== undefined && (
            <div className="text-right mr-2">
              <p className="text-xl font-bold">{item.score}</p>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(item.id)}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </Card>
      )}
    />
  );
}

// Chain priority sortable
export function SortableChainPriority({
  chains,
  onReorder,
  className,
}: {
  chains: Array<{
    id: string;
    name: string;
    icon?: string;
    enabled: boolean;
  }>;
  onReorder: (chains: typeof chains) => void;
  className?: string;
}) {
  return (
    <SortableList
      items={chains}
      onReorder={onReorder}
      className={className}
      renderItem={(chain, index) => (
        <Card className="p-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
            {index + 1}
          </div>
          {chain.icon && (
            <img
              src={chain.icon}
              alt={chain.name}
              className="w-6 h-6 rounded-full"
            />
          )}
          <span className="font-medium flex-1">{chain.name}</span>
          <Badge variant={chain.enabled ? 'default' : 'secondary'}>
            {chain.enabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </Card>
      )}
    />
  );
}

// Task list sortable
export function SortableTaskList({
  tasks,
  onReorder,
  onToggle,
  onRemove,
  className,
}: {
  tasks: Array<{
    id: string;
    title: string;
    completed: boolean;
    priority?: 'low' | 'medium' | 'high';
  }>;
  onReorder: (tasks: typeof tasks) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  className?: string;
}) {
  return (
    <SortableList
      items={tasks}
      onReorder={onReorder}
      className={className}
      renderItem={(task) => (
        <Card
          className={cn(
            'p-4 flex items-center gap-3',
            task.completed && 'opacity-60'
          )}
        >
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle(task.id)}
            className="w-5 h-5 rounded border-2 cursor-pointer"
          />
          <span
            className={cn(
              'flex-1 font-medium',
              task.completed && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </span>
          {task.priority && (
            <Badge
              variant={
                task.priority === 'high'
                  ? 'destructive'
                  : task.priority === 'medium'
                  ? 'default'
                  : 'secondary'
              }
            >
              {task.priority}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(task.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </Card>
      )}
    />
  );
}

// Protocol order sortable
export function SortableProtocolList({
  protocols,
  onReorder,
  className,
}: {
  protocols: Array<{
    id: string;
    name: string;
    logo?: string;
    interactions: number;
    eligibility: 'high' | 'medium' | 'low' | 'none';
  }>;
  onReorder: (protocols: typeof protocols) => void;
  className?: string;
}) {
  return (
    <SortableList
      items={protocols}
      onReorder={onReorder}
      className={className}
      renderItem={(protocol, index) => (
        <Card className="p-4 flex items-center gap-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-semibold text-sm">
            {index + 1}
          </div>
          {protocol.logo && (
            <img
              src={protocol.logo}
              alt={protocol.name}
              className="w-10 h-10 rounded-lg"
            />
          )}
          <div className="flex-1">
            <h4 className="font-semibold">{protocol.name}</h4>
            <p className="text-sm text-muted-foreground">
              {protocol.interactions} interactions
            </p>
          </div>
          <Badge
            variant={
              protocol.eligibility === 'high'
                ? 'default'
                : protocol.eligibility === 'medium'
                ? 'secondary'
                : protocol.eligibility === 'low'
                ? 'outline'
                : 'secondary'
            }
          >
            {protocol.eligibility === 'none'
              ? 'No airdrop'
              : `${protocol.eligibility} chance`}
          </Badge>
        </Card>
      )}
    />
  );
}

// Sortable list with add functionality
export function SortableListWithAdd<T extends SortableItem>({
  items,
  onReorder,
  onAdd,
  renderItem,
  addButtonLabel = 'Add Item',
  className,
}: SortableListProps<T> & {
  onAdd: () => void;
  addButtonLabel?: string;
}) {
  return (
    <div className={className}>
      <SortableList
        items={items}
        onReorder={onReorder}
        renderItem={renderItem}
      />
      <Button
        variant="outline"
        onClick={onAdd}
        className="w-full mt-2"
      >
        <Plus className="mr-2 h-4 w-4" />
        {addButtonLabel}
      </Button>
    </div>
  );
}

// Nested sortable list
export function NestedSortableList({
  sections,
  onReorder,
  className,
}: {
  sections: Array<{
    id: string;
    title: string;
    items: Array<{
      id: string;
      label: string;
    }>;
  }>;
  onReorder: (sections: typeof sections) => void;
  className?: string;
}) {
  const handleSectionReorder = (newSections: typeof sections) => {
    onReorder(newSections);
  };

  const handleItemReorder = (sectionId: string, newItems: any[]) => {
    const newSections = sections.map((section) => {
      if (section.id === sectionId) {
        return { ...section, items: newItems };
      }
      return section;
    });
    onReorder(newSections);
  };

  return (
    <div className={className}>
      <SortableList
        items={sections}
        onReorder={handleSectionReorder}
        renderItem={(section) => (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">{section.title}</h3>
            <SortableList
              items={section.items}
              onReorder={(newItems) => handleItemReorder(section.id, newItems)}
              renderItem={(item) => (
                <div className="p-2 bg-muted rounded text-sm">
                  {item.label}
                </div>
              )}
            />
          </Card>
        )}
      />
    </div>
  );
}

