import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CaseManagementPage from './pages/CaseManagementPage';
import CaseDetailPage from './pages/CaseDetailPage';
import IncidentReportingPage from './pages/IncidentReportingPage';
import AnalyticsPage from './pages/AnalyticsPage';
import UserManagementPage from './pages/UserManagementPage';
import Layout from './components/Layout';
import ProfileSetupModal from './components/ProfileSetupModal';
import { useGetMyProfile } from './hooks/useQueries';
import { Toaster } from './components/ui/sonner';
import { Role } from './backend';

// Root route with layout
function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster theme="dark" />
    </>
  );
}

// Auth guard wrapper
function AuthenticatedLayout() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetMyProfile();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cyber-dark">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-neon-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-neon-green animate-glow-pulse">INITIALIZING SYSTEM...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    window.location.href = '/';
    return null;
  }

  const showProfileSetup = !!identity && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      {showProfileSetup && <ProfileSetupModal />}
      <Layout>
        <Outlet />
      </Layout>
    </>
  );
}

// Admin-only guard
function AdminLayout() {
  const { data: userProfile, isLoading } = useGetMyProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-full bg-cyber-dark p-12">
        <div className="w-8 h-8 border-2 border-neon-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!userProfile || userProfile.role !== Role.admin) {
    return (
      <div className="flex items-center justify-center min-h-full bg-cyber-dark p-12">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-neon-red/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-neon-red text-2xl">⛔</span>
          </div>
          <h2 className="font-orbitron text-xl text-neon-red mb-2">ACCESS DENIED</h2>
          <p className="font-mono text-sm text-muted-foreground">Admin privileges required to access this area.</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

const rootRoute = createRootRoute({ component: RootComponent });

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginPage,
});

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: AuthenticatedLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/dashboard',
  component: Dashboard,
});

const casesRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/cases',
  component: CaseManagementPage,
});

const caseDetailRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/cases/$caseId',
  component: CaseDetailPage,
});

const incidentsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/incidents',
  component: IncidentReportingPage,
});

const analyticsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/analytics',
  component: AnalyticsPage,
});

const adminRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  id: 'admin',
  component: AdminLayout,
});

const userManagementRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/user-management',
  component: UserManagementPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  authenticatedRoute.addChildren([
    dashboardRoute,
    casesRoute,
    caseDetailRoute,
    incidentsRoute,
    analyticsRoute,
    adminRoute.addChildren([userManagementRoute]),
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
