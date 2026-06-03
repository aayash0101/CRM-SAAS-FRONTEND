import { useState } from 'react';
import {
  UserPlus,
  Search,
  Shield,
  MoreVertical,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  useUsers,
  useInvitations,
  useUpdateUserRole,
  useUpdateUserStatus,
} from '@/hooks/useUsers';
import { useAuthStore } from '@/store/auth.store';
import InviteUserModal from './InviteUserModal';
import Badge from '@/components/ui/Badge';
import { formatDate, getInitials } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { User, UserRole } from '@/types';

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ORG_ADMIN: 'Org Admin',
  SALES_MANAGER: 'Sales Manager',
  SALES_REP: 'Sales Rep',
};

const ROLE_VARIANTS: Record<UserRole, 'default' | 'warning' | 'info' | 'neutral'> = {
  SUPER_ADMIN: 'default',
  ORG_ADMIN: 'default',
  SALES_MANAGER: 'warning',
  SALES_REP: 'info',
};

const INVITATION_STATUS_VARIANTS: Record<string, 'warning' | 'success' | 'danger' | 'neutral'> = {
  PENDING: 'warning',
  ACCEPTED: 'success',
  EXPIRED: 'danger',
  CANCELLED: 'neutral',
};

type ActiveTab = 'members' | 'invitations';

export default function UsersPage() {
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role === 'ORG_ADMIN';

  const [tab, setTab] = useState<ActiveTab>('members');
  const [search, setSearch] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: invitations = [], isLoading: invitationsLoading } = useInvitations();
  const updateRole = useUpdateUserRole();
  const updateStatus = useUpdateUserStatus();

  const filteredUsers = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const handleRoleChange = async (user: User, role: string) => {
    await updateRole.mutateAsync({ id: user.id, role });
    setOpenMenuId(null);
  };

  const handleStatusToggle = async (user: User) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await updateStatus.mutateAsync({ id: user.id, status: newStatus });
    setOpenMenuId(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Team</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {users.length} member{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <UserPlus size={16} />
            Invite Member
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        <button
          onClick={() => setTab('members')}
          className={cn(
            'px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
            tab === 'members'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          Members
        </button>
        {isAdmin && (
          <button
            onClick={() => setTab('invitations')}
            className={cn(
              'px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
              tab === 'invitations'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            Invitations
            {invitations.filter((i) => i.status === 'PENDING').length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-xs font-semibold text-white bg-indigo-500 rounded-full">
                {invitations.filter((i) => i.status === 'PENDING').length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Members tab */}
      {tab === 'members' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Members table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">
                    Member
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">
                    Role
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">
                    Joined
                  </th>
                  {isAdmin && (
                    <th className="text-right text-xs font-medium text-slate-500 px-4 py-3">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {usersLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-slate-400 text-sm"
                    >
                      Loading members...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-slate-400 text-sm"
                    >
                      No members found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {/* Member info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold shrink-0">
                            {getInitials(user.firstName, user.lastName)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-700">
                              {user.firstName} {user.lastName}
                              {user.id === currentUser?.id && (
                                <span className="ml-2 text-xs text-slate-400 font-normal">
                                  (you)
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <Badge
                          label={ROLE_LABELS[user.role as UserRole] ?? user.role}
                          variant={ROLE_VARIANTS[user.role as UserRole] ?? 'neutral'}
                        />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              user.status === 'ACTIVE'
                                ? 'bg-emerald-500'
                                : 'bg-slate-300'
                            )}
                          />
                          <span
                            className={cn(
                              'text-xs font-medium',
                              user.status === 'ACTIVE'
                                ? 'text-emerald-700'
                                : 'text-slate-400'
                            )}
                          >
                            {user.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {formatDate(user.createdAt)}
                      </td>

                      {/* Actions — ORG_ADMIN only, can't act on self */}
                      {isAdmin && (
                        <td className="px-4 py-3">
                          {user.id !== currentUser?.id && (
                            <div className="flex items-center justify-end gap-1 relative">
                              <button
                                onClick={() =>
                                  setOpenMenuId(
                                    openMenuId === user.id ? null : user.id
                                  )
                                }
                                className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                              >
                                <MoreVertical size={15} />
                              </button>

                              {/* Dropdown menu */}
                              {openMenuId === user.id && (
                                <div className="absolute right-0 top-9 z-20 w-52 bg-white rounded-xl border border-slate-200 shadow-lg py-1">
                                  {/* Role section */}
                                  <div className="px-3 py-1.5">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                                      Change Role
                                    </p>
                                  </div>
                                  {(
                                    [
                                      'ORG_ADMIN',
                                      'SALES_MANAGER',
                                      'SALES_REP',
                                    ] as const
                                  ).map((role) => (
                                    <button
                                      key={role}
                                      onClick={() =>
                                        handleRoleChange(user, role)
                                      }
                                      disabled={user.role === role}
                                      className={cn(
                                        'flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-slate-50 transition-colors',
                                        user.role === role
                                          ? 'text-indigo-600 font-medium'
                                          : 'text-slate-700'
                                      )}
                                    >
                                      {ROLE_LABELS[role]}
                                      {user.role === role && (
                                        <Shield
                                          size={13}
                                          className="text-indigo-500"
                                        />
                                      )}
                                    </button>
                                  ))}

                                  <div className="border-t border-slate-100 my-1" />

                                  {/* Status toggle */}
                                  <button
                                    onClick={() => handleStatusToggle(user)}
                                    className={cn(
                                      'flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors',
                                      user.status === 'ACTIVE'
                                        ? 'text-red-600 hover:bg-red-50'
                                        : 'text-emerald-600 hover:bg-emerald-50'
                                    )}
                                  >
                                    {user.status === 'ACTIVE' ? (
                                      <>
                                        <XCircle size={14} />
                                        Deactivate User
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 size={14} />
                                        Activate User
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invitations tab */}
      {tab === 'invitations' && isAdmin && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">
                  Email
                </th>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">
                  Role
                </th>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">
                  Sent
                </th>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">
                  Expires
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invitationsLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-slate-400 text-sm"
                  >
                    Loading invitations...
                  </td>
                </tr>
              ) : invitations.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-slate-400 text-sm"
                  >
                    No invitations sent yet
                  </td>
                </tr>
              ) : (
                invitations.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100">
                          <Mail size={13} className="text-slate-400" />
                        </div>
                        <span className="text-slate-700">{inv.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={ROLE_LABELS[inv.role as UserRole] ?? inv.role}
                        variant={ROLE_VARIANTS[inv.role as UserRole] ?? 'neutral'}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={inv.status}
                        variant={
                          INVITATION_STATUS_VARIANTS[inv.status] ?? 'neutral'
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock size={11} />
                        {formatDate(inv.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {formatDate(inv.expiresAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Close dropdown on outside click */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setOpenMenuId(null)}
        />
      )}

      <InviteUserModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </div>
  );
}