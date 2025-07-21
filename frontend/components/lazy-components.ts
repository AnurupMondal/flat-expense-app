import { lazy } from "react";

// Lazy load main dashboard components for better performance
export const LazyComponents = {
  // Dashboard Components - These exist and have default exports
  AdminDashboard: lazy(() => import("./admin-dashboard")),
  ResidentDashboard: lazy(() => import("./resident-dashboard")),
  SuperAdminDashboard: lazy(() => import("./super-admin-dashboard")),

  // Authentication - These exist and have default exports
  AuthPage: lazy(() => import("./auth-page")),
  ProfileCompletion: lazy(() => import("./profile-completion")),
};

export default LazyComponents;
