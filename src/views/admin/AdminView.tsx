import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext.js';
import { AdminLayout } from './AdminLayout.js';
import { AdminDashboardOverview } from './AdminDashboardOverview.js';
import { AdminArtworksManager } from './AdminArtworksManager.js';
import { AdminYearsManager } from './AdminYearsManager.js';
import { AdminCategoriesManager } from './AdminCategoriesManager.js';
import { AdminHomepageManager } from './AdminHomepageManager.js';
import { AdminAboutManager } from './AdminAboutManager.js';
import { AdminExhibitionsManager } from './AdminExhibitionsManager.js';
import { AdminCVManager } from './AdminCVManager.js';
import { AdminSocialManager } from './AdminSocialManager.js';
import { AdminInquiriesManager } from './AdminInquiriesManager.js';
import { AdminSettingsSecurity } from './AdminSettingsSecurity.js';
import { AdminLoginView } from './AdminLoginView.js';

export const AdminView: React.FC = () => {
  const { isAdmin, loading } = usePortfolio();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [requestAddNewArtwork, setRequestAddNewArtwork] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center text-neutral-400 text-xs tracking-widest uppercase">
        Loading Studio CMS...
      </div>
    );
  }

  // If not authenticated, render login view
  if (!isAdmin) {
    return <AdminLoginView />;
  }

  const handleAddNewArtworkFromDashboard = () => {
    setRequestAddNewArtwork(true);
    setCurrentTab('artworks');
  };

  return (
    <AdminLayout currentTab={currentTab} onTabChange={setCurrentTab}>
      {currentTab === 'dashboard' && (
        <AdminDashboardOverview
          onNavigateTab={setCurrentTab}
          onAddNewArtwork={handleAddNewArtworkFromDashboard}
        />
      )}

      {currentTab === 'artworks' && (
        <AdminArtworksManager
          onAddNewRequest={requestAddNewArtwork}
          onClearAddNewRequest={() => setRequestAddNewArtwork(false)}
        />
      )}

      {currentTab === 'years' && <AdminYearsManager />}
      {currentTab === 'categories' && <AdminCategoriesManager />}
      {currentTab === 'homepage' && <AdminHomepageManager />}
      {currentTab === 'about' && <AdminAboutManager />}
      {currentTab === 'exhibitions' && <AdminExhibitionsManager />}
      {currentTab === 'cv' && <AdminCVManager />}
      {currentTab === 'social' && <AdminSocialManager />}
      {currentTab === 'messages' && <AdminInquiriesManager />}
      {currentTab === 'settings' && <AdminSettingsSecurity />}
    </AdminLayout>
  );
};
