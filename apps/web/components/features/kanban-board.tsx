'use client';

import * as React from 'react';
import { GripVertical, Plus, MoreVertical, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  assignee?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  limit?: number;
  color?: string;
}

export interface KanbanBoardProps {
  columns: KanbanColumn[];
  onCardMove?: (cardId: string, fromColumn: string, toColumn: string) => void;
  onCardClick?: (card: KanbanCard) => void;
  onCardDelete?: (cardId: string, columnId: string) => void;
  onCardAdd?: (columnId: string, title: string) => void;
  className?: string;
}

export function KanbanBoard({
  columns: initialColumns,
  onCardMove,
  onCardClick,
  onCardDelete,
  onCardAdd,
  className,
}: KanbanBoardProps) {
  const [columns, setColumns] = React.useState(initialColumns);
  const [draggedCard, setDraggedCard] = React.useState<{
    card: KanbanCard;
    columnId: string;
  } | null>(null);
  const [newCardTitle, setNewCardTitle] = React.useState<Record<string, string>>({});
  const [showAddCard, setShowAddCard] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  const handleDragStart = (card: KanbanCard, columnId: string) => {
    setDraggedCard({ card, columnId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetColumnId: string) => {
    if (!draggedCard) return;

    const { card, columnId: sourceColumnId } = draggedCard;

    if (sourceColumnId === targetColumnId) {
      setDraggedCard(null);
      return;
    }

    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === sourceColumnId) {
          return {
            ...col,
            cards: col.cards.filter((c) => c.id !== card.id),
          };
        }
        if (col.id === targetColumnId) {
          return {
            ...col,
            cards: [...col.cards, card],
          };
        }
        return col;
      })
    );

    onCardMove?.(card.id, sourceColumnId, targetColumnId);
    setDraggedCard(null);
  };

  const handleAddCard = (columnId: string) => {
    const title = newCardTitle[columnId]?.trim();
    if (!title) return;

    onCardAdd?.(columnId, title);
    setNewCardTitle((prev) => ({ ...prev, [columnId]: '' }));
    setShowAddCard((prev) => ({ ...prev, [columnId]: false }));
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className={cn('flex gap-4 overflow-x-auto pb-4', className)}>
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex flex-col min-w-[300px] max-w-[300px]"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(column.id)}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{column.title}</CardTitle>
                  <Badge variant="secondary" className="rounded-full">
                    {column.cards.length}
                    {column.limit && `/${column.limit}`}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setShowAddCard((prev) => ({ ...prev, [column.id]: true }))
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-250px)]">
                <div className="space-y-2 p-4 pt-0">
                  {/* Add card input */}
                  {showAddCard[column.id] && (
                    <div className="space-y-2 p-3 border-2 border-dashed rounded-lg">
                      <Input
                        value={newCardTitle[column.id] || ''}
                        onChange={(e) =>
                          setNewCardTitle((prev) => ({
                            ...prev,
                            [column.id]: e.target.value,
                          }))
                        }
                        placeholder="Enter card title..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddCard(column.id);
                          } else if (e.key === 'Escape') {
                            setShowAddCard((prev) => ({
                              ...prev,
                              [column.id]: false,
                            }));
                          }
                        }}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAddCard(column.id)}
                        >
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setShowAddCard((prev) => ({
                              ...prev,
                              [column.id]: false,
                            }))
                          }
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Cards */}
                  {column.cards.map((card) => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => handleDragStart(card, column.id)}
                      onClick={() => onCardClick?.(card)}
                      className={cn(
                        'group cursor-move rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md',
                        draggedCard?.card.id === card.id && 'opacity-50'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start gap-2">
                            <GripVertical className="h-4 w-4 mt-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            <p className="font-medium text-sm leading-tight">
                              {card.title}
                            </p>
                          </div>
                          {card.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {card.description}
                            </p>
                          )}
                          {card.tags && card.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {card.tags.map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {card.priority && (
                            <Badge
                              variant={getPriorityColor(card.priority)}
                              className="text-xs"
                            >
                              {card.priority}
                            </Badge>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onCardDelete?.(card.id, column.id);
                              }}
                              className="text-destructive"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}

                  {column.cards.length === 0 && !showAddCard[column.id] && (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No cards
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}

// Simple kanban preset for airdrop tracking
export function AirdropKanbanBoard({
  airdrops,
  onStatusChange,
  className,
}: {
  airdrops: Array<{
    id: string;
    name: string;
    status: 'upcoming' | 'active' | 'snapshot' | 'claiming' | 'ended';
    description?: string;
    eligibilityScore?: number;
  }>;
  onStatusChange?: (airdropId: string, newStatus: string) => void;
  className?: string;
}) {
  const columns: KanbanColumn[] = [
    {
      id: 'upcoming',
      title: 'Upcoming',
      cards: airdrops
        .filter((a) => a.status === 'upcoming')
        .map((a) => ({
          id: a.id,
          title: a.name,
          description: a.description,
          tags: a.eligibilityScore ? [`Score: ${a.eligibilityScore}`] : undefined,
        })),
    },
    {
      id: 'active',
      title: 'Active',
      cards: airdrops
        .filter((a) => a.status === 'active')
        .map((a) => ({
          id: a.id,
          title: a.name,
          description: a.description,
          tags: a.eligibilityScore ? [`Score: ${a.eligibilityScore}`] : undefined,
        })),
    },
    {
      id: 'snapshot',
      title: 'Snapshot Taken',
      cards: airdrops
        .filter((a) => a.status === 'snapshot')
        .map((a) => ({
          id: a.id,
          title: a.name,
          description: a.description,
          tags: a.eligibilityScore ? [`Score: ${a.eligibilityScore}`] : undefined,
        })),
    },
    {
      id: 'claiming',
      title: 'Claiming',
      cards: airdrops
        .filter((a) => a.status === 'claiming')
        .map((a) => ({
          id: a.id,
          title: a.name,
          description: a.description,
          tags: a.eligibilityScore ? [`Score: ${a.eligibilityScore}`] : undefined,
        })),
    },
    {
      id: 'ended',
      title: 'Ended',
      cards: airdrops
        .filter((a) => a.status === 'ended')
        .map((a) => ({
          id: a.id,
          title: a.name,
          description: a.description,
        })),
    },
  ];

  return (
    <KanbanBoard
      columns={columns}
      onCardMove={(cardId, fromColumn, toColumn) => {
        onStatusChange?.(cardId, toColumn);
      }}
      className={className}
    />
  );
}

