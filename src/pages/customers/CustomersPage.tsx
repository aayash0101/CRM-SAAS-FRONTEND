import { useState } from 'react';
import { Search, Plus, Pencil, Trash2, Mail, Phone, Building2, Users, UserPlus, Briefcase, MapPin } from 'lucide-react';
import { useCustomers, useDeleteCustomer, useCustomerStats } from '@/hooks/useCustomers';
import type { Customer } from '@/types';
import { formatDate } from '@/lib/formatters';
import StatCard from '@/components/ui/StatCard';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import CustomerFormModal from './CustomerFormModal';

const PAGE_SIZE = 10;

export default function CustomersPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

    const { data, isLoading } = useCustomers({ page, limit: PAGE_SIZE, search });
    const { data: stats } = useCustomerStats();
    const deleteCustomer = useDeleteCustomer();

    const customers = data?.items ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.ceil(total / PAGE_SIZE);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingCustomer(null);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingCustomer) return;
        await deleteCustomer.mutateAsync(deletingCustomer.id);
        setDeletingCustomer(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Customers</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage your customer relationships</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Customer
                </button>
            </div>

            {/* Stat Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Customers" value={stats.total ?? 0} icon={Users} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
                    <StatCard title="New This Month" value={stats.newThisMonth ?? 0} icon={UserPlus} iconColor="text-indigo-600" iconBg="bg-indigo-50" />
                    <StatCard title="With Active Deals" value={stats.withActiveDeals ?? 0} icon={Briefcase} iconColor="text-amber-600" iconBg="bg-amber-50" />
                    <StatCard title="Total Companies" value={stats.totalCompanies ?? 0} icon={Building2} iconColor="text-blue-600" iconBg="bg-blue-50" />
                </div>
            )}

            {/* Filter Bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Search by name, email, company..."
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                            <th className="text-left px-4 py-3 font-medium text-slate-500">Customer</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-500">Company</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-500">Location</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-500">Contact</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-500">Added</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-slate-400">Loading...</td>
                            </tr>
                        ) : customers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-slate-400">No customers found</td>
                            </tr>
                        ) : (
                            customers.map((customer: Customer) => (
                                <CustomerRow
                                    key={customer.id}
                                    customer={customer}
                                    onEdit={handleEdit}
                                    onDelete={setDeletingCustomer}
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
            <CustomerFormModal
                open={isFormOpen}
                onClose={handleCloseForm}
                customer={editingCustomer}
            />
            <ConfirmDialog
                open={!!deletingCustomer}
                onClose={() => setDeletingCustomer(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Customer"
                message={`Are you sure you want to delete ${deletingCustomer?.firstName} ${deletingCustomer?.lastName}? This action cannot be undone.`}
                confirmLabel="Delete"
            />
        </div>
    );
}

function CustomerRow({
    customer,
    onEdit,
    onDelete,
}: {
    customer: Customer;
    onEdit: (c: Customer) => void;
    onDelete: (c: Customer) => void;
}) {
    return (
        <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
            {/* Name + email */}
            <td className="px-4 py-3">
                <div className="font-medium text-slate-800">{customer.firstName} {customer.lastName}</div>
                {customer.email && (
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <Mail className="w-3 h-3" />
                        {customer.email}
                    </div>
                )}
            </td>

            {/* Company */}
            <td className="px-4 py-3">
                {customer.company ? (
                    <div className="flex items-center gap-1.5 text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {customer.company}
                    </div>
                ) : (
                    <span className="text-slate-300">—</span>
                )}
            </td>

            {/* Location */}
            <td className="px-4 py-3">
                {customer.city || customer.country ? (
                    <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {[customer.city, customer.country].filter(Boolean).join(', ')}
                    </div>
                ) : (
                    <span className="text-slate-300">—</span>
                )}
            </td>

            {/* Contact */}
            <td className="px-4 py-3">
                {customer.phone ? (
                    <a href={`tel:${customer.phone}`} className="flex items-center gap-1.5 text-slate-600 text-xs hover:text-indigo-600 transition-colors">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {customer.phone}
                    </a>
                ) : (
                    <span className="text-slate-300">—</span>
                )}
            </td>

            {/* Added date */}
            <td className="px-4 py-3 text-slate-500">{formatDate(customer.createdAt)}</td>

            {/* Actions */}
            <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                    <button
                        onClick={() => onEdit(customer)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onDelete(customer)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </td>
        </tr>
    );
}