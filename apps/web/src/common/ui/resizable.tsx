'use client';

import * as ResizablePrimitive from 'react-resizable-panels';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      'flex h-full w-full data-[panel-group-direction=vertical]:flex-col',
      className
    )}
    {...props}
  />
);

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      'relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90',
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };

// Preset: Two column layout
export function TwoColumnLayout({
  leftPanel,
  rightPanel,
  defaultSize = 50,
  minSize = 20,
  className,
}: {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  defaultSize?: number;
  minSize?: number;
  className?: string;
}) {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className={cn('rounded-lg border', className)}
    >
      <ResizablePanel defaultSize={defaultSize} minSize={minSize}>
        {leftPanel}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={100 - defaultSize} minSize={minSize}>
        {rightPanel}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

// Preset: Three column layout
export function ThreeColumnLayout({
  leftPanel,
  centerPanel,
  rightPanel,
  defaultSizes = [25, 50, 25],
  minSizes = [15, 20, 15],
  className,
}: {
  leftPanel: React.ReactNode;
  centerPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  defaultSizes?: [number, number, number];
  minSizes?: [number, number, number];
  className?: string;
}) {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className={cn('rounded-lg border', className)}
    >
      <ResizablePanel defaultSize={defaultSizes[0]} minSize={minSizes[0]}>
        {leftPanel}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={defaultSizes[1]} minSize={minSizes[1]}>
        {centerPanel}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={defaultSizes[2]} minSize={minSizes[2]}>
        {rightPanel}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

// Preset: Sidebar layout
export function SidebarLayout({
  sidebar,
  main,
  sidebarDefaultSize = 20,
  sidebarMinSize = 15,
  sidebarMaxSize = 40,
  collapsible = false,
  className,
}: {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  sidebarDefaultSize?: number;
  sidebarMinSize?: number;
  sidebarMaxSize?: number;
  collapsible?: boolean;
  className?: string;
}) {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className={cn('rounded-lg border', className)}
    >
      <ResizablePanel
        defaultSize={sidebarDefaultSize}
        minSize={sidebarMinSize}
        maxSize={sidebarMaxSize}
        collapsible={collapsible}
      >
        {sidebar}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={100 - sidebarDefaultSize}>
        {main}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

// Preset: Vertical split
export function VerticalSplit({
  topPanel,
  bottomPanel,
  defaultSize = 50,
  minSize = 20,
  className,
}: {
  topPanel: React.ReactNode;
  bottomPanel: React.ReactNode;
  defaultSize?: number;
  minSize?: number;
  className?: string;
}) {
  return (
    <ResizablePanelGroup
      direction="vertical"
      className={cn('rounded-lg border', className)}
    >
      <ResizablePanel defaultSize={defaultSize} minSize={minSize}>
        {topPanel}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={100 - defaultSize} minSize={minSize}>
        {bottomPanel}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

// Preset: Email client layout (sidebar + two columns)
export function EmailClientLayout({
  sidebar,
  list,
  detail,
  className,
}: {
  sidebar: React.ReactNode;
  list: React.ReactNode;
  detail: React.ReactNode;
  className?: string;
}) {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className={cn('rounded-lg border', className)}
    >
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30} collapsible>
        {sidebar}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={30} minSize={20}>
        {list}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} minSize={30}>
        {detail}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

// Preset: Code editor layout (tree + editor + preview)
export function CodeEditorLayout({
  fileTree,
  editor,
  preview,
  className,
}: {
  fileTree: React.ReactNode;
  editor: React.ReactNode;
  preview: React.ReactNode;
  className?: string;
}) {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className={cn('rounded-lg border', className)}
    >
      <ResizablePanel defaultSize={15} minSize={10} maxSize={25} collapsible>
        {fileTree}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={60} minSize={30}>
          {editor}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={40} minSize={20}>
          {preview}
        </ResizablePanel>
      </ResizablePanelGroup>
    </ResizablePanelGroup>
  );
}

