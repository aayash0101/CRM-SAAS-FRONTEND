import { useState } from 'react';
import { Search, Plus, Pencil, Trash2, TrendingUp, DollarSign, Target, Award } from 'lucide-react';
import { useDeals, useDeleteDeal, usePipelineStats, useUpdateDeal } from '@/hooks/useDeals';
import type { Deal, DealStage } from '@/types';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { getInitials } from '@/lib/formatters';
import StatCard from '@/components/ui/StatCard';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import DealFormModal from './DealFormModal';

const STAGE_OPTIONS: { value: DealStage | ''; label: string }[] = [
  { value: '', label: 'All Stages' },
  { value: 'PROSPECT', label: 'Prospect' },
  { value: 'PROPOSAL', label: 'Proposal' },
  { value: 'NEGOTIATION', label: 'Negotiation' },
  { value: 'WON', label: 'Won' },
  { value: 'LOST', label: 'Lost' },
];

const STAGE_STYLES: Record<DealStage, string> = {
  PROSPECT: 'bg-blue-50 text-blue-700',
  PROPOSAL: 'bg-amber-50 text-amber-700',
  NEGOTIATION: 'bg-purple-50 text-purple-700',
  WON: 'bg-emerald-50 text-emerald-700',
  LOST: 'bg-red-50 text-red-700',
};

const PAGE_SIZE = 20;

export default function DealsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [deletingDeal, setDeletingDeal] = useState<Deal | null>(null);

  const { data, isLoading } = useDeals({ page, limit: PAGE_SIZE, search, stage });
  const { data: pipeline } = usePipelineStats();
  const deleteDeal = useDeleteDeal();
  const updateDeal = useUpdateDeal();

  const deals = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStageFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStage(e.target.value);
    setPage(1);
  };

  const handleEdit = (deal: Deal) => {
    setEditingDeal(deal);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingDeal(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDeal) return;
    await deleteDeal.mutateAsync(deletingDeal.id);
    setDeletingDeal(null);
  };

  const handleStageChange = async (deal: Deal, newStage: DealStage) => {
    await updateDeal.mutateAsync({ id: deal.id, stage: newStage });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Deals</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track and manage your sales pipeline</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Deal
        </button>
      </div>

      {/* Pipeline Summary Cards */}
      {pipeline && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Deals"
            value={pipeline.totalDeals}
            icon={Target}
            iconColor="text-indigo-600"
            iconBg="bg-indigo-50"
          />
          <StatCard
            title="Pipeline Value"
            value={formatCurrency(pipeline.totalValue)}
            icon={DollarSign}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
          <StatCard
            title="Won"
            value={pipeline.pipeline.WON.count}
            icon={Award}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
          <StatCard
            title="Won Value"
            value={formatCurrency(pipeline.pipeline.WON.value)}
            icon={TrendingUp}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
        </div>
      )}

      {/* Pipeline Stage Bar */}
      {pipeline && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Pipeline Breakdown
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {(Object.entries(pipeline.pipeline) as [DealStage, { count: number; value: number }][]).map(
              ([s, stats]) => (
                <div
                  key={s}
                  className="text-center p-3 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <div className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${STAGE_STYLES[s]}`}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </div>
                  <div className="text-lg font-semibold text-slate-800">{stats.count}</div>
                  <div className="text-xs text-slate-500">{formatCurrency(stats.value)}</div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={handleSearchChange}
            placeholder="Search deals..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
          />
        </div>
        <select
          value={stage}
          onChange={handleStageFilterChange}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 text-slate-700"
        >
          {STAGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-3 font-medium text-slate-500">Deal</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Customer</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Stage</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Value</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Owner</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Close Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">Loading...</td>
              </tr>
            ) : deals.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">No deals found</td>
              </tr>
            ) : (
              deals.map((deal: Deal) => (
                <DealRow
                  key={deal.id}
                  deal={deal}
                  onEdit={handleEdit}
                  onDelete={setDeletingDeal}
                  onStageChange={handleStageChange}
                />
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between text-sm text-slate-500">
            <span>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <DealFormModal open={isFormOpen} onClose={handleCloseForm} deal={editingDeal} />
      <ConfirmDialog
        open={!!deletingDeal}
        onClose={() => setDeletingDeal(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Deal"
        message={`Are you sure you want to delete "${deletingDeal?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

function DealRow({
  deal,
  onEdit,
  onDelete,
  onStageChange,
}: {
  deal: Deal;
  onEdit: (d: Deal) => void;
  onDelete: (d: Deal) => void;
  onStageChange: (d: Deal, s: DealStage) => void;
}) {
  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
      {/* Title + notes */}
      <td className="px-4 py-3">
        <div className="font-medium text-slate-800">{deal.title}</div>
        {deal.notes && (
          <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[180px]">{deal.notes}</div>
        )}
      </td>

      {/* Customer */}
      <td className="px-4 py-3">
        <div className="text-slate-700">{deal.customer.firstName} {deal.customer.lastName}</div>
        {deal.customer.company && (
          <div className="text-xs text-slate-400">{deal.customer.company}</div>
        )}
      </td>

      {/* Stage — inline dropdown to change stage */}
      <td className="px-4 py-3">
        <select
          value={deal.stage}
          onChange={(e) => onStageChange(deal, e.target.value as DealStage)}
          className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${STAGE_STYLES[deal.stage]}`}
        >
          {(['PROSPECT', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'] as DealStage[]).map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </td>

      {/* Value */}
      <td className="px-4 py-3 font-medium text-slate-800">
        {formatCurrency(Number(deal.value))}
      </td>

      {/* Owner */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-semibold">
              {getInitials(deal.owner.firstName, deal.owner.lastName)}
            </span>
          </div>
          <span className="text-slate-600 text-xs">{deal.owner.firstName}</span>
        </div>
      </td>

      {/* Close date */}
      <td className="px-4 py-3 text-slate-500">
        {deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : '—'}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(deal)}
            className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(deal)}
            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}