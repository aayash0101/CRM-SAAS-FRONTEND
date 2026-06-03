import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '@/components/ui/Modal';
import FormField, { inputClass } from '@/components/ui/FormField';
import type { Activity } from '@/types';
import { useCreateActivity, useUpdateActivity, type CreateActivityInput } from '@/hooks/useActivities';
import { useCustomers } from '@/hooks/useCustomers';

const activitySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.string().min(1, 'Type is required'),
  status: z.string().optional(),
  description: z.string().optional(),
  dueAt: z.string().optional(),
  customerId: z.string().optional(),
});

type ActivityFormValues = z.infer<typeof activitySchema>;

const TYPE_OPTIONS = [
  { value: 'CALL', label: 'Call' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'MEETING', label: 'Meeting' },
  { value: 'TASK', label: 'Task' },
];

const STATUS_OPTIONS = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

interface ActivityFormModalProps {
  open: boolean;
  onClose: () => void;
  activity?: Activity | null;
}

export default function ActivityFormModal({ open, onClose, activity }: ActivityFormModalProps) {
  const isEditing = !!activity;
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();
  const { data: customersData } = useCustomers({ limit: 100 });
  const customers = customersData?.items ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
  });

  useEffect(() => {
    if (activity) {
      reset({
        title: activity.title ?? '',
        type: activity.type ?? 'CALL',
        status: activity.status ?? 'SCHEDULED',
        description: activity.description ?? '',
        dueAt: activity.dueAt ? activity.dueAt.split('T')[0] : '',
        customerId: activity.customerId ?? '',
      });
    } else {
      reset({
        title: '',
        type: 'CALL',
        status: 'SCHEDULED',
        description: '',
        dueAt: '',
        customerId: '',
      });
    }
  }, [activity, reset]);

  const onSubmit = async (values: ActivityFormValues) => {
    const payload: CreateActivityInput = {
      title: values.title,
      type: values.type,
      status: values.status,
      description: values.description || undefined,
      dueAt: values.dueAt || undefined,
      customerId: values.customerId || undefined,
    };

    try {
      if (isEditing && activity) {
        await updateActivity.mutateAsync({ id: activity.id, ...payload });
      } else {
        await createActivity.mutateAsync(payload);
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
      title={isEditing ? 'Edit Activity' : 'New Activity'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <FormField label="Title" required error={errors.title?.message}>
          <input
            {...register('title')}
            className={inputClass(!!errors.title)}
            placeholder="e.g. Follow-up call with client"
          />
        </FormField>

        {/* Type + Status */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Type" required error={errors.type?.message}>
            <select {...register('type')} className={inputClass(!!errors.type)}>
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Status" error={errors.status?.message}>
            <select {...register('status')} className={inputClass(!!errors.status)}>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Customer + Due Date */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Customer" error={errors.customerId?.message}>
            <select {...register('customerId')} className={inputClass(!!errors.customerId)}>
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName} {c.company ? `(${c.company})` : ''}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Due Date" error={errors.dueAt?.message}>
            <input
              {...register('dueAt')}
              type="date"
              className={inputClass(!!errors.dueAt)}
            />
          </FormField>
        </div>

        {/* Description */}
        <FormField label="Description" error={errors.description?.message}>
          <textarea
            {...register('description')}
            rows={3}
            className={inputClass(!!errors.description)}
            placeholder="Any additional details..."
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
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Activity'}
          </button>
        </div>
      </form>
    </Modal>
  );
}