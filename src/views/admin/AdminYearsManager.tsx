import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext.js';
import { Plus, Trash2, Calendar, Check, AlertCircle, ArrowUp, ArrowDown, Clock } from 'lucide-react';
import { api } from '../../api/client.js';
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal.js';

export const AdminYearsManager: React.FC = () => {
  const { data, reloadData, showToast } = usePortfolio();
  const [newYearInput, setNewYearInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [yearToDelete, setYearToDelete] = useState<string | null>(null);

  // Derive years list from settings and artworks
  const configuredYears = data?.settings?.customYears || data?.years || ['2025', '2024', '2023', '2022', '2021', '2020'];
  const artworks = data?.artworks || [];

  // Count how many artworks exist for each year
  const artworkCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    artworks.forEach(art => {
      const y = String(art.year);
      counts[y] = (counts[y] || 0) + 1;
    });
    return counts;
  }, [artworks]);

  const handleAddYear = async (yearToAdd: string) => {
    const cleaned = yearToAdd.trim();
    if (!cleaned) return;
    if (configuredYears.includes(cleaned)) {
      showToast(`Year ${cleaned} is already in the list.`, 'info');
      return;
    }

    try {
      setLoading(true);
      await api.addYear(cleaned);
      await reloadData();
      setNewYearInput('');
      showToast(`Year ${cleaned} added to archive chronology.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to add year.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteYear = async () => {
    if (!yearToDelete) return;
    try {
      setLoading(true);
      await api.deleteYear(yearToDelete);
      await reloadData();
      showToast(`Year ${yearToDelete} removed.`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete year.', 'error');
    } finally {
      setLoading(false);
      setYearToDelete(null);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= configuredYears.length) return;
    const next = [...configuredYears];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;

    try {
      await api.updateYears(next);
      await reloadData();
      showToast('Year chronology order updated.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to reorder years.', 'error');
    }
  };

  // Preset quick addition buttons
  const suggestedYears = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017'].filter(
    y => !configuredYears.includes(y)
  );

  return (
    <div id="admin-years-manager" className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 block font-medium">
            Chronology & Filters
          </span>
          <h1 className="font-serif text-3xl tracking-wide text-white">Archive Years Manager</h1>
          <p className="text-xs text-neutral-400 font-light mt-1">
            Manage the years shown in the sidebar navigation and available when cataloging paintings and artworks.
          </p>
        </div>
      </div>

      {/* Add New Year Form */}
      <div className="bg-[#161616] p-6 border border-neutral-800 space-y-4 max-w-3xl">
        <h2 className="text-xs uppercase tracking-[0.25em] text-neutral-300 font-medium flex items-center gap-2">
          <Plus className="w-4 h-4 text-neutral-400" /> Add Year to Archive
        </h2>

        <form
          onSubmit={e => {
            e.preventDefault();
            handleAddYear(newYearInput);
          }}
          className="flex flex-wrap gap-3 items-center"
        >
          <input
            type="text"
            placeholder="e.g. 2022, 2021, 2020..."
            value={newYearInput}
            onChange={e => setNewYearInput(e.target.value)}
            className="px-4 py-2 bg-neutral-900 border border-neutral-700 text-sm text-white placeholder-neutral-500 focus:outline-hidden focus:border-white w-52"
          />
          <button
            type="submit"
            disabled={loading || !newYearInput.trim()}
            className="px-5 py-2 bg-white text-black text-xs uppercase tracking-wider font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Add Year
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        {suggestedYears.length > 0 && (
          <div className="pt-2">
            <span className="text-[11px] text-neutral-500 uppercase tracking-wider block mb-2">
              Quick Add Missing Years:
            </span>
            <div className="flex flex-wrap gap-2">
              {suggestedYears.slice(0, 6).map(yr => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => handleAddYear(yr)}
                  className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs border border-neutral-700 transition-colors cursor-pointer"
                >
                  + {yr}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Years List */}
      <div className="bg-[#161616] border border-neutral-800 max-w-3xl">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between text-xs uppercase tracking-widest text-neutral-400">
          <span>Active Chronological Years ({configuredYears.length})</span>
          <span>Catalog Works</span>
        </div>

        <div className="divide-y divide-neutral-800">
          {configuredYears.map((yr, idx) => {
            const count = artworkCounts[yr] || 0;
            return (
              <div
                key={yr}
                className="p-4 flex items-center justify-between hover:bg-white/2 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-neutral-600">
                    <button
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === configuredYears.length - 1}
                      className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <span className="font-mono text-base font-normal text-white">{yr}</span>
                    <span className="text-xs text-neutral-500 ml-3">
                      Visible in sidebar
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full ${
                      count > 0
                        ? 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                        : 'bg-neutral-900/50 text-neutral-500 border border-neutral-800'
                    }`}
                  >
                    {count} {count === 1 ? 'artwork' : 'artworks'}
                  </span>

                  <button
                    onClick={() => setYearToDelete(yr)}
                    className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                    title={`Delete year ${yr}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={yearToDelete !== null}
        title={`Remove Year ${yearToDelete}?`}
        message={`Are you sure you want to remove ${yearToDelete} from the active archive chronology? Any artworks currently tagged with this year will remain in the database.`}
        onConfirm={handleDeleteYear}
        onCancel={() => setYearToDelete(null)}
      />
    </div>
  );
};
