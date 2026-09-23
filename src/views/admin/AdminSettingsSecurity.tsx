import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext.js';
import { Shield, KeyRound, Lock, Check, AlertCircle } from 'lucide-react';
import { api } from '../../api/client.js';

export const AdminSettingsSecurity: React.FC = () => {
  const { data, reloadData, showToast, adminUser, setAdminUser } = usePortfolio();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newUsername, setNewUsername] = useState(adminUser || 'olivabiswas');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // SEO & General site settings
  const [siteTitle, setSiteTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [studioLocation, setStudioLocation] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => {
    if (data?.settings) {
      setSiteTitle(data.settings.siteTitle || 'Oliva Biswas | Contemporary Artist Portfolio');
      setMetaDescription(data.settings.metaDescription || '');
      setContactEmail(data.settings.contactEmail || 'studio@olivabiswas.com');
      setStudioLocation(data.settings.studioLocation || 'Paris / New York');
    }
  }, [data?.settings]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError(null);
      await api.changePassword(currentPassword, newPassword);
      if (newUsername && newUsername !== adminUser) {
        await api.changeUsername(newUsername);
        setAdminUser(newUsername);
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Credentials updated successfully. Secure PBKDF2 hash stored.', 'success');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update credentials.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSaveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSettingsLoading(true);
      await api.updateSettings({
        siteTitle: siteTitle.trim(),
        metaDescription: metaDescription.trim(),
        contactEmail: contactEmail.trim(),
        studioLocation: studioLocation.trim(),
      });
      await reloadData();
      showToast('General settings and metadata updated.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings.', 'error');
    } finally {
      setSettingsLoading(false);
    }
  };

  return (
    <div id="admin-settings-security" className="space-y-10 max-w-4xl">
      <div className="pb-6 border-b border-neutral-800">
        <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 block font-medium">
          System & Credentials
        </span>
        <h1 className="font-serif text-3xl tracking-wide text-white">Settings & Security</h1>
      </div>

      {/* Security & Password Form */}
      <form onSubmit={handleChangePassword} className="bg-[#161616] p-6 sm:p-8 border border-neutral-800 space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-800">
          <Shield className="w-5 h-5 text-neutral-300" />
          <h2 className="font-serif text-lg text-white">Admin Authentication Credentials</h2>
        </div>

        {passwordError && (
          <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
              Admin Username
            </label>
            <input
              type="text"
              required
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              className="w-full bg-[#202020] border border-neutral-700 px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#202020] border border-neutral-700 px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-white font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                New Password *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-[#202020] border border-neutral-700 px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-white font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm matching password"
                className="w-full bg-[#202020] border border-neutral-700 px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-white font-mono"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <p className="text-[11px] text-neutral-500 font-light">
            Stored using PBKDF2 cryptographic salt with SHA-512 derivation.
          </p>
          <button
            type="submit"
            disabled={passwordLoading}
            className="px-6 py-2.5 bg-white text-black text-xs uppercase tracking-widest font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{passwordLoading ? 'Updating...' : 'Update Password'}</span>
          </button>
        </div>
      </form>

      {/* General Site & SEO Settings */}
      <form onSubmit={handleSaveGeneralSettings} className="bg-[#161616] p-6 sm:p-8 border border-neutral-800 space-y-6">
        <h2 className="font-serif text-lg text-white border-b border-neutral-800 pb-4">
          General Site Configuration & SEO
        </h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
              Website Browser Title
            </label>
            <input
              type="text"
              value={siteTitle}
              onChange={e => setSiteTitle(e.target.value)}
              className="w-full bg-[#202020] border border-neutral-700 px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
              SEO Meta Description
            </label>
            <textarea
              rows={3}
              value={metaDescription}
              onChange={e => setMetaDescription(e.target.value)}
              className="w-full bg-[#202020] border border-neutral-700 p-4 text-xs text-white focus:outline-hidden focus:border-white leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                Contact Inquiries Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                className="w-full bg-[#202020] border border-neutral-700 px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                Studio Primary Locations
              </label>
              <input
                type="text"
                value={studioLocation}
                onChange={e => setStudioLocation(e.target.value)}
                className="w-full bg-[#202020] border border-neutral-700 px-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={settingsLoading}
            className="px-6 py-2.5 bg-white text-black text-xs uppercase tracking-widest font-semibold hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{settingsLoading ? 'Saving...' : 'Save Site Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
