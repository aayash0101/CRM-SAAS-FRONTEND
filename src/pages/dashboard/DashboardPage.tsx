import {
  Users,
  UserCheck,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  Video,
  CheckSquare,
} from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import {
  useDashboardOverview,
  useRecentActivities,
  useUpcomingActivities,
  useSalesPerformance,
} from '@/hooks/useDashboard';
import { useAuthStore } from '@/store/auth.store';
import { formatCurrency, formatRelativeTime, formatDate, getInitials } from '@/lib/formatters';
import {
  DEAL_STAGE_LABELS,
  DEAL_STAGE_VARIANTS,
  ACTIVITY_TYPE_LABELS,
  ACTIVITY_STATUS_VARIANTS,
} from '@/lib/constants';
import type { ActivityType } from '@/types';

const activityTypeIcons: Record<ActivityType, React.ReactNode> = {
  CALL: <Phone size={14} />,
  EMAIL: <Mail size={14} />,
  MEETING: <Video size={14} />,
  TASK: <CheckSquare size={14} />,
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: overview, isLoading: overviewLoading } = useDashboardOverview();
  const { data: recentActivities } = useRecentActivities();
  const { data: upcomingActivities } = useUpcomingActivities();
  const { data: salesPerformance } = useSalesPerformance();

  const canSeeSalesPerf =
    user?.role === 'ORG_ADMIN' || user?.role === 'SALES_MANAGER';

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={overviewLoading ? '—' : overview?.totalLeads ?? 0}
          icon={Users}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="Total Customers"
          value={overviewLoading ? '—' : overview?.totalCustomers ?? 0}
          icon={UserCheck}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Open Deals"
          value={overviewLoading ? '—' : overview?.openDeals ?? 0}
          icon={TrendingUp}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Pipeline Value"
          value={
            overviewLoading
              ? '—'
              : formatCurrency(Number(overview?.pipelineValue ?? 0))
          }
          icon={TrendingUp}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
      </div>

      {/* Lead stats + Deal pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Lead breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            Leads by Status
          </h3>
          <div className="space-y-3">
            {Object.entries(overview?.stats?.leads ?? {}).map(([status, count]) => {
              const total = overview?.totalLeads || 1;
              const pct = Math.round((Number(count) / total) * 100);
              const colors: Record<string, string> = {
                NEW: 'bg-blue-500',
                CONTACTED: 'bg-amber-500',
                QUALIFIED: 'bg-emerald-500',
                LOST: 'bg-red-400',
              };
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">{status}</span>
                    <span className="text-slate-500">
                      {String(count)} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colors[status] ?? 'bg-slate-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deal pipeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            Deal Pipeline
          </h3>
          <div className="space-y-2">
            {Object.entries(overview?.stats?.deals ?? {}).map(([stage, data]: any) => (
              <div
                key={stage}
                className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <Badge
                    label={DEAL_STAGE_LABELS[stage as keyof typeof DEAL_STAGE_LABELS] ?? stage}
                    variant={DEAL_STAGE_VARIANTS[stage as keyof typeof DEAL_STAGE_VARIANTS]}
                  />
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>{data.count} deals</span>
                  <span className="font-medium text-slate-700">
                    {formatCurrency(Number(data.value))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent + Upcoming activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            Recent Activities
          </h3>
          {!recentActivities?.length ? (
            <p className="text-sm text-slate-400">No recent activities</p>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
                    {activityTypeIcons[activity.type as ActivityType]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {ACTIVITY_TYPE_LABELS[activity.type as ActivityType]} ·{' '}
                      {formatRelativeTime(activity.createdAt)}
                    </p>
                  </div>
                  <Badge
                    label={activity.status}
                    variant={ACTIVITY_STATUS_VARIANTS[activity.status as keyof typeof ACTIVITY_STATUS_VARIANTS]}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            Upcoming Activities
          </h3>
          {!upcomingActivities?.length ? (
            <p className="text-sm text-slate-400">No upcoming activities</p>
          ) : (
            <div className="space-y-3">
              {upcomingActivities.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-50 text-amber-600 shrink-0 mt-0.5">
                    <Calendar size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {ACTIVITY_TYPE_LABELS[activity.type as ActivityType]} ·{' '}
                      Due {activity.dueAt ? formatDate(activity.dueAt) : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sales performance — ORG_ADMIN and SALES_MANAGER only */}
      {canSeeSalesPerf && salesPerformance?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            Sales Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-medium text-slate-500 pb-3 pr-4">
                    Rep
                  </th>
                  <th className="text-right text-xs font-medium text-slate-500 pb-3 pr-4">
                    Total Deals
                  </th>
                  <th className="text-right text-xs font-medium text-slate-500 pb-3 pr-4">
                    Won
                  </th>
                  <th className="text-right text-xs font-medium text-slate-500 pb-3 pr-4">
                    Won Value
                  </th>
                  <th className="text-right text-xs font-medium text-slate-500 pb-3">
                    Conversion
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {salesPerformance.map((rep: any) => (
                  <tr key={rep.userId}>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-500 shrink-0">
                          <span className="text-white text-xs font-semibold">
                            {getInitials(rep.firstName ?? '', rep.lastName ?? '')}
                          </span>
                        </div>
                        <span className="font-medium text-slate-700">
                          {rep.firstName} {rep.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-right text-slate-600">
                      {rep.totalDeals}
                    </td>
                    <td className="py-3 pr-4 text-right text-slate-600">
                      {rep.wonDeals}
                    </td>
                    <td className="py-3 pr-4 text-right font-medium text-emerald-600">
                      {formatCurrency(rep.wonValue)}
                    </td>
                    <td className="py-3 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700">
                        {rep.conversionRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}