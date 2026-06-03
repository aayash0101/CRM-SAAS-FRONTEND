import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '@/components/ui/Modal';
import FormField, { inputClass } from '@/components/ui/FormField';
import type { Deal } from '@/types';
import { useCreateDeal, useUpdateDeal, type CreateDealInput } from '@/hooks/useDeals';
import { useCustomers } from '@/hooks/useCustomers';

const dealSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  customerId: z.string().min(1, 'Customer is required'),
  value: z.number().min(0, 'Value must be 0 or more').optional(),
  stage: z.string().optional(),
  expectedCloseDate: z.string().optional(),
  notes: z.string().optional(),
});

type DealFormValues = z.infer<typeof dealSchema>;

const STAGE_OPTIONS = [
  { value: 'PROSPECT', label: 'Prospect' },
  { value: 'PROPOSAL', label: 'Proposal' },
  { value: 'NEGOTIATION', label: 'Negotiation' },
  { value: 'WON', label: 'Won' },
  { value: 'LOST', label: 'Lost' },
];

interface DealFormModalProps {
  open: boolean;
  onClose: () => void;
  deal?: Deal | null;
}

export default function DealFormModal({ open, onClose, deal }: DealFormModalProps) {
  const isEditing = !!deal;
  const createDeal = useCreateDeal();
  const updateDeal = useUpdateDeal();
  const { data: customersData } = useCustomers({ limit: 100 });
  const customers = customersData?.items ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema),
  });

  useEffect(() => {
    if (deal) {
      reset({
        title: deal.title ?? '',
        customerId: deal.customerId ?? '',
        value: Number(deal.value) ?? 0,
        stage: deal.stage ?? 'PROSPECT',
        expectedCloseDate: deal.expectedCloseDate
          ? deal.expectedCloseDate.split('T')[0]
          : '',
        notes: deal.notes ?? '',
      });
    } else {
      reset({
        title: '',
        customerId: '',
        value: 0,
        stage: 'PROSPECT',
        expectedCloseDate: '',
        notes: '',
      });
    }
  }, [deal, reset]);

  const onSubmit = async (values: DealFormValues) => {
    const payload: CreateDealInput = {
      title: values.title,
      customerId: values.customerId,
      value: values.value,
      stage: values.stage,
      expectedCloseDate: values.expectedCloseDate || undefined,
      notes: values.notes || undefined,
    };

    try {
      if (isEditing && deal) {
        await updateDeal.mutateAsync({ id: deal.id, ...payload });
      } else {
        await createDeal.mutateAsync(payload);
      }
      onClose();
    } catch {
      // errors handled by mutation
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Deal' : 'New Deal'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <FormField label="Deal Title" required error={errors.title?.message}>
          <input
            {...register('title')}
            className={inputClass(!!errors.title)}
            placeholder="e.g. Enterprise License Deal"
          />
        </FormField>

        {/* Customer + Stage */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Customer" required error={errors.customerId?.message}>
            <select {...register('customerId')} className={inputClass(!!errors.customerId)}>
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName} {c.company ? `(${c.company})` : ''}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Stage" error={errors.stage?.message}>
            <select {...register('stage')} className={inputClass(!!errors.stage)}>
              {STAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Value + Expected Close Date */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Value ($)" error={errors.value?.message}>
            <input
              {...register('value', { valueAsNumber: true })}
              type="number"
              min={0}
              className={inputClass(!!errors.value)}
              placeholder="0"
            />
          </FormField>
          <FormField label="Expected Close Date" error={errors.expectedCloseDate?.message}>
            <input
              {...register('expectedCloseDate')}
              type="date"
              className={inputClass(!!errors.expectedCloseDate)}
            />
          </FormField>
        </div>

        {/* Notes */}
        <FormField label="Notes" error={errors.notes?.message}>
          <textarea
            {...register('notes')}
            rows={3}
            className={inputClass(!!errors.notes)}
            placeholder="Any additional notes..."
          />
        </FormField>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Deal'}
          </button>
        </div>
      </form>
    </Modal>
  );
}