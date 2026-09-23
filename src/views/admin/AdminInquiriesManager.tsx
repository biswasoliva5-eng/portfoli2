import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext.js';
import { Mail, Check, Trash2, Clock, CheckCircle2, User, Eye, X } from 'lucide-react';
import { ContactMessage } from '../../types.js';
import { api } from '../../api/client.js';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal.js';

export const AdminInquiriesManager: React.FC = () => {
  const { data, reloadData, showToast } = usePortfolio();

  const [inquiries, setInquiries] = useState<ContactMessage[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<ContactMessage | null>(null);
  const [inquiryToDelete, setInquiryToDelete] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadInquiries = async () => {
    try {
      const msgs = await api.getMessages();
      setInquiries(msgs);
    } catch {
      setInquiries(data?.inquiries || []);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, [data?.inquiries]);

  const handleToggleRead = async (inquiry: ContactMessage) => {
    try {
      await api.updateInquiry(inquiry.id, { read: !inquiry.read });
      await loadInquiries();
      await reloadData();
      showToast(inquiry.read ? 'Marked as unread' : 'Marked as read', 'success');
    } catch (e) {
      showToast('Failed to update inquiry status.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!inquiryToDelete) return;
    const target = inquiryToDelete;
    try {
      setDeleting(true);
      await Promise.race([
        api.deleteInquiry(target.id),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Deletion timed out. Please try again.')), 12000))
      ]);
      setInquiryToDelete(null);
      if (selectedInquiry?.id === target.id) {
        setSelectedInquiry(null);
      }
      await loadInquiries();
      await reloadData();
      showToast('Inquiry deleted.', 'info');
    } catch (e: any) {
      showToast(e.message || 'Failed to delete inquiry.', 'error');
    } finally {
      setDeleting(false);
      setInquiryToDelete(null);
    }
  };

  return (
    <div id="admin-inquiries-manager" className="space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-neutral-800">
        <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 block font-medium">
          Correspondence
        </span>
        <h1 className="font-serif text-3xl tracking-wide text-white">Studio Inquiries</h1>
        <p className="text-xs text-neutral-400 font-light mt-1">
          Messages submitted through the public website contact and artwork inquiry forms.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inquiries List */}
        <div className="lg:col-span-6 bg-[#161616] border border-neutral-800 divide-y divide-neutral-800/80 max-h-[70vh] overflow-y-auto">
          {inquiries.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-500 space-y-2">
              <Mail className="w-8 h-8 mx-auto opacity-30" />
              <p>No correspondence received yet.</p>
            </div>
          ) : (
            inquiries.map(inq => (
              <div
                key={inq.id}
                onClick={() => {
                  setSelectedInquiry(inq);
                  if (!inq.read) {
                    handleToggleRead(inq);
                  }
                }}
                className={`p-4 transition-colors cursor-pointer space-y-1.5 ${
                  selectedInquiry?.id === inq.id
                    ? 'bg-neutral-800/80 border-l-2 border-white'
                    : inq.read
                    ? 'hover:bg-neutral-800/30'
                    : 'bg-neutral-900/60 hover:bg-neutral-800/50 font-medium'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {!inq.read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                    )}
                    <span className="text-xs text-white truncate font-medium">{inq.name}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {new Date(inq.receivedAt || inq.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-xs text-neutral-300 truncate font-sans">
                  {inq.subject || 'Artwork inquiry'}
                </div>

                <div className="text-[11px] text-neutral-400 line-clamp-1 font-light">
                  {inq.message}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Message Detail View */}
        <div className="lg:col-span-6 bg-[#161616] border border-neutral-800 p-6 flex flex-col justify-between">
          {selectedInquiry ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
                <div className="space-y-1">
                  <h2 className="font-serif text-lg text-white">
                    {selectedInquiry.subject || 'Inquiry'}
                  </h2>
                  <div className="text-xs text-neutral-400 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    <span className="text-white font-medium">{selectedInquiry.name}</span>
                    <span>&lt;{selectedInquiry.email}&gt;</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleRead(selectedInquiry)}
                    className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs"
                    title={selectedInquiry.read ? 'Mark as unread' : 'Mark as read'}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setInquiryToDelete(selectedInquiry)}
                    className="p-1.5 bg-red-950/50 hover:bg-red-900/60 text-red-300 text-xs"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-neutral-400 font-mono flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-neutral-500" />
                <span>Received: {new Date(selectedInquiry.receivedAt || selectedInquiry.createdAt || Date.now()).toLocaleString()}</span>
              </div>

              <div className="p-4 bg-[#202020] border border-neutral-700 text-xs text-neutral-200 whitespace-pre-line leading-relaxed min-h-[160px]">
                {selectedInquiry.message}
              </div>

              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(
                    selectedInquiry.subject || 'Inquiry'
                  )}`}
                  className="px-5 py-2.5 bg-white text-black text-xs uppercase tracking-widest font-semibold hover:bg-neutral-200 transition-colors inline-flex items-center gap-2"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="my-auto text-center py-20 text-neutral-500 text-xs space-y-2">
              <Eye className="w-8 h-8 mx-auto opacity-30" />
              <p>Select a message from the list to view details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      <DeleteConfirmModal
        isOpen={Boolean(inquiryToDelete)}
        title="Delete Inquiry"
        message="Are you sure you want to permanently delete this correspondence record?"
        isDeleting={deleting}
        onConfirm={handleDelete}
        onCancel={() => setInquiryToDelete(null)}
      />
    </div>
  );
};
