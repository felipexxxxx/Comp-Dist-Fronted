import { useEffect, type ReactElement } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { useAuthContext } from '../contexts/AuthContext';
import { useThemeContext } from '../contexts/ThemeContext';
import { apiEnvironment } from '../services/api/client';
import { AppShell } from '../components/layout/AppShell';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { UsersScreen } from '../screens/users/UsersScreen';
import { PatientsScreen } from '../screens/patients/PatientsScreen';

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Painel hospitalar',
    subtitle: 'Entregavel das semanas 1-2 e 3-4 com foco em operacao, cadastro e autenticacao.'
  },
  '/users': {
    title: 'Usuarios e acessos',
    subtitle: 'Fluxo administrativo para criar, consultar e organizar perfis do sistema.'
  },
  '/patients': {
    title: 'Pacientes e historico',
    subtitle: 'Cadastro, consulta e edicao de pacientes com persistencia local ou via API.'
  }
};

function RequireAuth() {
  const { isAuthenticated, isBootstrapping } = useAuthContext();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-ember border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function PublicOnly() {
  const { isAuthenticated, isBootstrapping } = useAuthContext();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-ember border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

function ShellLayout() {
  const { theme, toggleTheme } = useThemeContext();
  const { signOut, userName, userRole } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  const routeMeta = routeTitles[location.pathname] ?? routeTitles['/dashboard'];
  const navItems = [
    { key: '/dashboard', label: 'Dashboard' },
    ...(userRole === 'ADMIN' ? [{ key: '/users', label: 'Usuarios' }] : []),
    { key: '/patients', label: 'Pacientes' }
  ];

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/dashboard', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <AppShell
      apiModeLabel="API web configuravel"
      currentRoute={location.pathname}
      navItems={navItems}
      onLogout={async () => {
        await signOut();
        navigate('/login', { replace: true });
      }}
      onNavigate={(route) => navigate(route)}
      onToggleTheme={toggleTheme}
      subtitle={routeMeta.subtitle}
      isMock={apiEnvironment.isMock}
      theme={theme}
      title={routeMeta.title}
      userName={userName}
    >
      <Outlet />
    </AppShell>
  );
}

function RequireAdmin({ children }: { children: ReactElement }) {
  const { userRole } = useAuthContext();

  if (userRole !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnly />}>
        <Route path="/login" element={<LoginScreen />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<ShellLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route
            path="/users"
            element={
              <RequireAdmin>
                <UsersScreen />
              </RequireAdmin>
            }
          />
          <Route path="/patients" element={<PatientsScreen />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
