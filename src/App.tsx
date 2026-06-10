import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { RequireAuth } from './components/RequireAuth';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { DataRecord } from './pages/DataRecord';
import { NPC } from './pages/NPC';
import { Shop } from './pages/Shop';
import { Review } from './pages/Review';
import { LoginPage } from './pages/LoginPage';
import { useAuthStore } from './store/useAuthStore';
import { useGameStore } from './store/useGameStore';
import type { TabType } from './types';

function AuthenticatedGame() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <Tasks />;
      case 'data':
        return <DataRecord />;
      case 'npc':
        return <NPC />;
      case 'shop':
        return <Shop />;
      case 'review':
        return <Review />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

function App() {
  const initAuth = useAuthStore((state) => state.initAuth);
  const user = useAuthStore((state) => state.user);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const syncFromCloud = useGameStore((state) => state.syncFromCloud);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (isAuthLoading) return;

    if (user?.email) {
      syncFromCloud(user.email);
      return;
    }

  }, [isAuthLoading, syncFromCloud, user]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <AuthenticatedGame />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default App;
