const RECENT_MODULE_VISITS_KEY = 'dsa-recent-modules-v1';
const RECENT_MODULE_LIMIT = 6;

export function readRecentModuleVisits(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(RECENT_MODULE_VISITS_KEY);
    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter((item): item is string => typeof item === 'string').slice(0, RECENT_MODULE_LIMIT);
  } catch {
    return [];
  }
}

export function rememberModuleVisit(route: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const nextRoutes = [route, ...readRecentModuleVisits().filter((item) => item !== route)].slice(0, RECENT_MODULE_LIMIT);

  try {
    window.localStorage.setItem(RECENT_MODULE_VISITS_KEY, JSON.stringify(nextRoutes));
  } catch {
    // Ignore storage failures and keep the rest of the workspace usable.
  }
}
