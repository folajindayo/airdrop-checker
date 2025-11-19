/**
 * Application Routes
 * Centralized route definitions
 */

export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  PORTFOLIO: "/portfolio",
  CALENDAR: "/calendar",
  COMPARE: "/compare",
  SIMULATE: "/simulate",
  STATS: "/stats",
  SETTINGS: "/settings",
  HELP: "/help",
  ROI: "/roi",
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];

/**
 * Get route with parameters
 */
export function getRoute(route: Route, params?: Record<string, string>): string {
  if (!params) return route;

  let path = route;
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`[${key}]`, value);
  });

  return path;
}

/**
 * Check if route is active
 */
export function isRouteActive(currentPath: string, route: Route): boolean {
  if (route === ROUTES.HOME) {
    return currentPath === route;
  }
  return currentPath.startsWith(route);
}

/**
 * Navigation items for menus
 */
export interface NavItem {
  label: string;
  route: Route;
  icon?: string;
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", route: ROUTES.DASHBOARD },
  { label: "Portfolio", route: ROUTES.PORTFOLIO },
  { label: "Calendar", route: ROUTES.CALENDAR },
  { label: "Compare", route: ROUTES.COMPARE },
  { label: "Simulate", route: ROUTES.SIMULATE },
  { label: "Stats", route: ROUTES.STATS },
];

