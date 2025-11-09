import * as React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  separator?: React.ReactNode;
  showHome?: boolean;
}

export function Breadcrumb({
  items,
  className,
  separator = <ChevronRight className="h-4 w-4" />,
  showHome = true,
}: BreadcrumbProps) {
  const allItems = showHome
    ? [{ label: 'Home', href: '/', icon: <Home className="h-4 w-4" /> }, ...items]
    : items;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center space-x-2', className)}>
      <ol className="flex items-center space-x-2">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;

          return (
            <React.Fragment key={index}>
              <li className="flex items-center">
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      'flex items-center gap-2 text-sm font-medium',
                      isLast ? 'text-foreground' : 'text-muted-foreground'
                    )}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.icon}
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && (
                <li className="flex items-center text-muted-foreground" aria-hidden="true">
                  {separator}
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

// Responsive breadcrumb that shows only first and last items on mobile
export function ResponsiveBreadcrumb({
  items,
  className,
  showHome = true,
}: Omit<BreadcrumbProps, 'separator'>) {
  const allItems = showHome
    ? [{ label: 'Home', href: '/', icon: <Home className="h-4 w-4" /> }, ...items]
    : items;

  if (allItems.length <= 2) {
    return <Breadcrumb items={items} showHome={showHome} className={className} />;
  }

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center', className)}>
      {/* Mobile: Show first and last only */}
      <div className="flex md:hidden items-center space-x-2">
        <Link
          href={allItems[0].href || '#'}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          {allItems[0].icon}
          {allItems[0].label}
        </Link>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">...</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">
          {allItems[allItems.length - 1].label}
        </span>
      </div>

      {/* Desktop: Show all items */}
      <div className="hidden md:flex">
        <Breadcrumb items={items} showHome={showHome} />
      </div>
    </nav>
  );
}

// Breadcrumb with dropdown for middle items when too many
export function CollapsibleBreadcrumb({
  items,
  maxItems = 3,
  className,
  showHome = true,
}: BreadcrumbProps & { maxItems?: number }) {
  const allItems = showHome
    ? [{ label: 'Home', href: '/', icon: <Home className="h-4 w-4" /> }, ...items]
    : items;

  if (allItems.length <= maxItems) {
    return <Breadcrumb items={items} showHome={showHome} className={className} />;
  }

  const firstItems = allItems.slice(0, 1);
  const middleItems = allItems.slice(1, -1);
  const lastItems = allItems.slice(-1);

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center space-x-2', className)}>
      <ol className="flex items-center space-x-2">
        {/* First item */}
        <li className="flex items-center">
          <Link
            href={firstItems[0].href || '#'}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {firstItems[0].icon}
            {firstItems[0].label}
          </Link>
        </li>

        {middleItems.length > 0 && (
          <>
            <li className="text-muted-foreground" aria-hidden="true">
              <ChevronRight className="h-4 w-4" />
            </li>
            <li>
              <button
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
                title="Show all items"
              >
                ...
              </button>
            </li>
          </>
        )}

        {/* Last item */}
        <li className="text-muted-foreground" aria-hidden="true">
          <ChevronRight className="h-4 w-4" />
        </li>
        <li>
          <span className="text-sm font-medium text-foreground" aria-current="page">
            {lastItems[0].label}
          </span>
        </li>
      </ol>
    </nav>
  );
}

// Hook to generate breadcrumbs from pathname
export function useBreadcrumbs(pathname: string): BreadcrumbItem[] {
  return React.useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    
    return segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      const label = segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return { label, href };
    });
  }, [pathname]);
}

