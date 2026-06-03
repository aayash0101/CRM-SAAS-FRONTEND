import { useState } from 'react';
import { Search, Plus, Pencil, Trash2, Phone, Mail, Video, CheckSquare, Calendar, CheckCircle, XCircle } from 'lucide-react';
import {
  useActivities,
  useDeleteActivity,
  useActivityStats,
  useUpdateActivityStatus,
} from '@/hooks/useActivities';
import type { Activity, ActivityType, ActivityStatus } from '@/types';
import { formatDate } from '@/lib/formatters';
import { getInitials } from '@/lib/formatters';
import StatCard from '@/components/ui/StatCard';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ActivityFormModal from './ActivityFormModal';

const TYPE_ICONS: Record<ActivityType, React.ReactNode> = {
  CALL: <Phone className="w-3.5 h-3.5" />,
  EMAIL: <Mail className="w-3.5 h-3.5" />,
  MEETING: <Video className="w-3.5 h-3.5" />,
  TASK: <CheckSquare className="w-3.5 h-3.5" />,
};

const TYPE_STYLES: Record<ActivityType, string> = {
  CALL: 'bg-blue-50 text-blue-600',
  EMAIL: 'bg-indigo-50 text-indigo-600',
  MEETING: 'bg-purple-50 text-purple-600',
  TASK: 'bg-amber-50 text-amber-600',
};

const STATUS_STYLES: Record<ActivityStatus, string> = {
  SCHEDULED: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'CALL', label: 'Call' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'MEETING', label: 'Meeting' },
  { value: 'TASK', label: 'Task' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const PAGE_SIZE = 20;

export default function ActivitiesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(null);

  const { data, isLoading } = useActivities({ page, limit: PAGE_SIZE, search, type, status });
  const { data: stats } = useActivityStats();
  const deleteActivity = useDeleteActivity();
  const updateStatus = useUpdateActivityStatus();

  const activities = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingActivity(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingActivity) return;
    await deleteActivity.mutateAsync(deletingActivity.id);
    setDeletingActivity(null);
  };

  const handleMarkComplete = async (activity: Activity) => {
    await updateStatus.mutateAsync({ id: activity.id, status: 'COMPLETED' });
  };

  const handleMarkCancelled = async (activity: Activity) => {
    await updateStatus.mutateAsync({ id: activity.id, status: 'CANCELLED' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Activities</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track calls, emails, meetings and tasks</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Activity
        </button>
      </div>

      {/* Stat Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total"
            value={stats.byStatus.total}
            icon={Calendar}
            iconColor="text-indigo-600"
            iconBg="bg-indigo-50"
          />
          <StatCard
            title="Scheduled"
            value={stats.byStatus.SCHEDULED}
            icon={Calendar}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
          <StatCard
            title="Completed"
            value={stats.byStatus.COMPLETED}
            icon={CheckSquare}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
          <StatCard
            title="Cancelled"
            value={stats.byStatus.CANCELLED}
            icon={XCircle}
            iconColor="text-red-600"
            iconBg="bg-red-50"
          />
        </div>
      )}

      {/* Type breakdown */}
      {stats && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            By Type
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {(['CALL', 'EMAIL', 'MEETING', 'TASK'] as ActivityType[]).map((t) => (
              <div
                key={t}
                className="text-center p-3 rounded-lg bg-slate-50 border border-slate-100"
              >
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mb-2 ${TYPE_STYLES[t]}`}>
                  {TYPE_ICONS[t]}
                </div>
                <div className="text-lg font-semibold text-slate-800">{stats.byType[t]}</div>
                <div className="text-xs text-slate-500">{t.charAt(0) + t.slice(1).toLowerCase()}</div>
              </div>
            ))}
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
            placeholder="Search activities..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
          />
        </div>
        <select
          value={type}
          onChange={(e) => { setType(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 text-slate-700"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 text-slate-700"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-4 py-3 font-medium text-slate-500">Activity</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Type</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Related To</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Assigned</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Due</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">Loading...</td>
              </tr>
            ) : activities.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">No activities found</td>
              </tr>
            ) : (
              activities.map((activity: Activity) => (
                <ActivityRow
                  key={activity.id}
                  activity={activity}
                  onEdit={handleEdit}
                  onDelete={setDeletingActivity}
                  onMarkComplete={handleMarkComplete}
                  onMarkCancelled={handleMarkCancelled}
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
      <ActivityFormModal
        open={isFormOpen}
        onClose={handleCloseForm}
        activity={editingActivity}
      />
      <ConfirmDialog
        open={!!deletingActivity}
        onClose={() => setDeletingActivity(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Activity"
        message={`Are you sure you want to delete "${deletingActivity?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

function ActivityRow({
  activity,
  onEdit,
  onDelete,
  onMarkComplete,
  onMarkCancelled,
}: {
  activity: Activity;
  onEdit: (a: Activity) => void;
  onDelete: (a: Activity) => void;
  onMarkComplete: (a: Activity) => void;
  onMarkCancelled: (a: Activity) => void;
}) {
  const isScheduled = activity.status === 'SCHEDULED';

  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
      {/* Title + description */}
      <td className="px-4 py-3">
        <div className="font-medium text-slate-800">{activity.title}</div>
        {activity.description && (
          <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">
            {activity.description}
          </div>
        )}
      </td>

      {/* Type */}
      <td className="px-4 py-3">
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${TYPE_STYLES[activity.type]}`}>
          {TYPE_ICONS[activity.type]}
          {activity.type.charAt(0) + activity.type.slice(1).toLowerCase()}
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[activity.status]}`}>
          {activity.status.charAt(0) + activity.status.slice(1).toLowerCase()}
        </span>
      </td>

      {/* Related to */}
      <td className="px-4 py-3">
        {activity.customer ? (
          <div>
            <div className="text-slate-700 text-xs">{activity.customer.firstName} {activity.customer.lastName}</div>
            {activity.customer.company && (
              <div className="text-slate-400 text-xs">{activity.customer.company}</div>
            )}
          </div>
        ) : activity.lead ? (
          <div className="text-slate-700 text-xs">{activity.lead.firstName} {activity.lead.lastName}</div>
        ) : activity.deal ? (
          <div className="text-slate-700 text-xs">{activity.deal.title}</div>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>

      {/* Assigned user */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-semibold">
              {getInitials(activity.user.firstName, activity.user.lastName)}
            </span>
          </div>
          <span className="text-slate-600 text-xs">{activity.user.firstName}</span>
        </div>
      </td>

      {/* Due date */}
      <td className="px-4 py-3 text-slate-500 text-xs">
        {activity.dueAt ? formatDate(activity.dueAt) : '—'}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          {isScheduled && (
            <>
              <button
                onClick={() => onMarkComplete(activity)}
                className="p-1.5 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                title="Mark complete"
              >
                <CheckCircle className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onMarkCancelled(activity)}
                className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Mark cancelled"
              >
                <XCircle className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <button
            onClick={() => onEdit(activity)}
            className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(activity)}
            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}