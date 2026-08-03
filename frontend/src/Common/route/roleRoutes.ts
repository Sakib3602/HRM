
export const roleRoutes: Record<string, string> = {
  hr: '/dashboard/hr',
  employee: '/dashboard/employee',

};

// role না মিললে fallback
export const getDashboardRoute = (role?: string): string => {
  if (!role) return '/';
  return roleRoutes[role] ?? '/';
};