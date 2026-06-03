import { useState } from 'react';
import { Plus, Search, Filter, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLeads, useDeleteLead } from '@/hooks/useLeads';
import { useAuthStore } from '@/store/auth.store';
import Badge from '@/components/ui/Badge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import LeadFormModal from './LeadFormModal';
import { formatDate, getInitials } from '@/lib/formatters';
import {
  LEAD_STATUS_LABELS,
  LEAD_STATUS_VARIANTS,
  LEAD_SOURCE_LABELS,
} from '@/lib/constants';
import type { Lead } from '@/types';

export default function LeadsPage() {
  const user = useAuthStore((s) => s.user);
  const canDelete = user?.role === 'ORG_ADMIN' || user?.role === 'SALES_MANAGER';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useLeads({
    page,
    limit: 15,
    search: search || undefined,
    status: statusFilter || undefined,
    source: sourceFilter || undefined,
  });

  const deleteLead = useDeleteLead();

  const leads: Lead[] = data?.data ?? [];
  const meta = data?.meta;

  const handleEdit = (lead: Lead) => {
    setEditLead(lead);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditLead(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteLead.mutateAsync(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Leads</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {meta?.total ?? 0} total leads
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="LOST">Lost</option>
          </select>
        </div>

        {/* Source filter */}
        <select
          value={sourceFilter}
          onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
          className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 text-slate-700"
        >
          <option value="">All Sources</option>
          <option value="WEBSITE">Website</option>
          <option value="REFERRAL">Referral</option>
          <option value="SOCIAL_MEDIA">Social Media</option>
          <option value="EMAIL_CAMPAIGN">Email Campaign</option>
          <option value="COLD_CALL">Cold Call</option>
          <option value="TRADE_SHOW">Trade Show</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">
                  Name
                </th>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">
                  Company
                </th>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">
                  Source
                </th>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">
                  Assigned To
                </th>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">
                  Created
                </th>
                <th className="text-right text-xs font-medium text-slate-500 px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400 text-sm">
                    Loading leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400 text-sm">
                    No leads found. Add your first lead.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold shrink-0">
                          {getInitials(lead.firstName, lead.lastName)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-700">
                            {lead.firstName} {lead.lastName}
                          </p>
                          {lead.email && (
                            <p className="text-xs text-slate-400">{lead.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {lead.company ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {LEAD_SOURCE_LABELS[lead.source] ?? lead.source}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={LEAD_STATUS_LABELS[lead.status]}
                        variant={LEAD_STATUS_VARIANTS[lead.status]}
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {lead.assignedUser
                        ? `${(lead.assignedUser as any).firstName} ${(lead.assignedUser as any).lastName}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(lead)}
                          className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => setDeleteId(lead.id)}
                            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, meta.total)} of {meta.total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-slate-600 px-2">
                {page} / {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <LeadFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        lead={editLead}
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Lead"
        message="Are you sure you want to delete this lead? This action cannot be undone."
        confirmLabel="Delete"
        isLoading={deleteLead.isPending}
      />
    </div>
  );
}