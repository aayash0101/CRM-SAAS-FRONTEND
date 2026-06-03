import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import FormField, { inputClass } from '@/components/ui/FormField';
import { useCreateLead, useUpdateLead } from '@/hooks/useLeads';
import { cn } from '@/lib/utils';
import type { Lead } from '@/types';

const leadSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  company: z.string().optional().or(z.literal('')),
  source: z.enum([
    'WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA',
    'EMAIL_CAMPAIGN', 'COLD_CALL', 'TRADE_SHOW', 'OTHER',
  ]).optional(),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'LOST']).optional(),
  notes: z.string().optional().or(z.literal('')),
});

type LeadFormInput = z.infer<typeof leadSchema>;

interface LeadFormModalProps {
  open: boolean;
  onClose: () => void;
  lead?: Lead | null;
}

export default function LeadFormModal({ open, onClose, lead }: LeadFormModalProps) {
  const isEdit = !!lead;
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormInput>({
    resolver: zodResolver(leadSchema),
  });

  useEffect(() => {
    if (open) {
      reset(
        lead
          ? {
              firstName: lead.firstName,
              lastName: lead.lastName,
              email: lead.email ?? '',
              phone: lead.phone ?? '',
              company: lead.company ?? '',
              source: lead.source,
              status: lead.status,
              notes: lead.notes ?? '',
            }
          : {
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              company: '',
              source: 'OTHER',
              status: 'NEW',
              notes: '',
            }
      );
    }
  }, [open, lead, reset]);

  const onSubmit = async (data: LeadFormInput) => {
    const payload = {
      ...data,
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
      notes: data.notes || null,
    };

    if (isEdit && lead) {
      await updateLead.mutateAsync({ id: lead.id, data: payload });
    } else {
      await createLead.mutateAsync(payload);
    }
    onClose();
  };

  const isPending = createLead.isPending || updateLead.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Lead' : 'Add New Lead'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="First Name" error={errors.firstName?.message} required>
            <input
              {...register('firstName')}
              placeholder="John"
              className={inputClass(!!errors.firstName)}
            />
          </FormField>
          <FormField label="Last Name" error={errors.lastName?.message} required>
            <input
              {...register('lastName')}
              placeholder="Doe"
              className={inputClass(!!errors.lastName)}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Email" error={errors.email?.message}>
            <input
              {...register('email')}
              type="email"
              placeholder="john@company.com"
              className={inputClass(!!errors.email)}
            />
          </FormField>
          <FormField label="Phone" error={errors.phone?.message}>
            <input
              {...register('phone')}
              placeholder="+1 234 567 8900"
              className={inputClass(!!errors.phone)}
            />
          </FormField>
        </div>

        <FormField label="Company" error={errors.company?.message}>
          <input
            {...register('company')}
            placeholder="Acme Corp"
            className={inputClass(!!errors.company)}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Source" error={errors.source?.message}>
            <select {...register('source')} className={inputClass(!!errors.source)}>
              <option value="WEBSITE">Website</option>
              <option value="REFERRAL">Referral</option>
              <option value="SOCIAL_MEDIA">Social Media</option>
              <option value="EMAIL_CAMPAIGN">Email Campaign</option>
              <option value="COLD_CALL">Cold Call</option>
              <option value="TRADE_SHOW">Trade Show</option>
              <option value="OTHER">Other</option>
            </select>
          </FormField>
          <FormField label="Status" error={errors.status?.message}>
            <select {...register('status')} className={inputClass(!!errors.status)}>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="LOST">Lost</option>
            </select>
          </FormField>
        </div>

        <FormField label="Notes" error={errors.notes?.message}>
          <textarea
            {...register('notes')}
            rows={3}
            placeholder="Any additional notes..."
            className={inputClass(!!errors.notes)}
          />
        </FormField>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || isSubmitting}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors',
              (isPending || isSubmitting) && 'opacity-70 cursor-not-allowed'
            )}
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Lead'}
          </button>
        </div>
      </form>
    </Modal>
  );
}