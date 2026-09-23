import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext.js';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../api/client.js';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal.js';

export const AdminCVManager: React.FC = () => {
  const { data, reloadData, showToast } = usePortfolio();

  const [uploading, setUploading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const cv = data?.cv;
  const hasCV = Boolean(cv && cv.url);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await api.uploadCV(file);
      await reloadData();
      showToast('Curriculum Vitae document uploaded and activated.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to upload CV.', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteCV = async () => {
    try {
      setDeleting(true);
      await Promise.race([
        api.deleteCV(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Deletion timed out. Please try again.')), 12000))
      ]);
      setDeleteModalOpen(false);
      await reloadData();
      showToast('CV removed.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete CV.', 'error');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  return (
    <div id="admin-cv-manager" className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="pb-6 border-b border-neutral-800">
        <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 block font-medium">
          Professional Document
        </span>
        <h1 className="font-serif text-3xl tracking-wide text-white">Curriculum Vitae (PDF)</h1>
        <p className="text-xs text-neutral-400 font-light mt-1">
          Manage the public CV document accessible via the public /cv page and &quot;Download CV&quot; buttons.
        </p>
      </div>

      {/* Current Active CV Status Card */}
      <div className="bg-[#161616] p-6 sm:p-8 border border-neutral-800 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-[0.25em] text-neutral-300 font-medium flex items-center gap-2">
            <FileText className="w-4 h-4 text-neutral-400" />
            <span>Active Document Status</span>
          </h2>
          {hasCV ? (
            <span className="px-2.5 py-0.5 bg-green-950/60 border border-green-800 text-green-300 text-[10px] uppercase tracking-wider flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3 h-3" /> Published
            </span>
          ) : (
            <span className="px-2.5 py-0.5 bg-amber-950/60 border border-amber-800 text-amber-300 text-[10px] uppercase tracking-wider flex items-center gap-1 font-mono">
              <AlertCircle className="w-3 h-3" /> No Document
            </span>
          )}
        </div>

        {hasCV ? (
          <div className="p-6 bg-[#202020] border border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="font-serif text-base text-white">{cv?.filename}</div>
              <div className="text-xs text-neutral-400 font-mono flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                <span>Last updated: {new Date(cv?.lastUpdated || cv?.uploadedAt || Date.now()).toLocaleString()}</span>
              </div>
              <div className="text-[11px] text-neutral-500 font-mono truncate max-w-md">
                Public URL: {cv?.url}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href={cv?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs uppercase tracking-wider flex items-center gap-1.5 border border-neutral-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>View / Download</span>
              </a>

              <button
                onClick={() => setDeleteModalOpen(true)}
                className="px-3 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs uppercase tracking-wider flex items-center gap-1.5 border border-red-900/50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 border border-dashed border-neutral-700 text-center space-y-2 text-neutral-400">
            <FileText className="w-8 h-8 mx-auto opacity-40" />
            <p className="text-xs">No Curriculum Vitae document is currently uploaded.</p>
            <p className="text-[11px] text-neutral-500">
              Upload a PDF document below to make it immediately downloadable on your website.
            </p>
          </div>
        )}

        {/* Upload / Replace Section */}
        <div className="pt-6 border-t border-neutral-800 space-y-4">
          <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-300 font-medium">
            {hasCV ? 'Replace Existing CV' : 'Upload New CV Document'}
          </h3>

          <div className="p-8 border-2 border-dashed border-neutral-700 hover:border-neutral-500 bg-[#1c1c1c] text-center space-y-4 transition-colors">
            <Upload className="w-8 h-8 mx-auto text-neutral-400" />
            <div className="space-y-1">
              <div className="text-sm font-medium text-white">
                {uploading ? 'Uploading and processing file...' : 'Choose a file or drag and drop'}
              </div>
              <p className="text-xs text-neutral-400">
                Supported formats: PDF, DOC, DOCX (PDF recommended). Maximum file size: 25MB.
              </p>
            </div>

            <div>
              <label className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-black text-xs uppercase tracking-widest font-semibold hover:bg-neutral-200 transition-colors cursor-pointer shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>{hasCV ? 'Select Replacement File' : 'Select CV File'}</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Curriculum Vitae"
        message="Are you sure you want to permanently delete the active CV document? Visitors will no longer be able to download the PDF until you upload a new one."
        isDeleting={deleting}
        onConfirm={handleDeleteCV}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};
