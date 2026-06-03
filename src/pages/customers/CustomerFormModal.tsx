import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '@/components/ui/Modal';
import FormField, { inputClass } from '@/components/ui/FormField';
import type { Customer } from '@/types';
import {
  useCreateCustomer,
  useUpdateCustomer,
  type CreateCustomerInput,
} from '@/hooks/useCustomers';

const customerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormModalProps {
  open: boolean;
  onClose: () => void;
  customer?: Customer | null;
}

export default function CustomerFormModal({ open, onClose, customer }: CustomerFormModalProps) {
  const isEditing = !!customer;
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
  });

  useEffect(() => {
    if (customer) {
      reset({
        firstName: customer.firstName ?? '',
        lastName: customer.lastName ?? '',
        email: customer.email ?? '',
        phone: customer.phone ?? '',
        company: customer.company ?? '',
        address: customer.address ?? '',
        city: customer.city ?? '',
        country: customer.country ?? '',
        notes: customer.notes ?? '',
      });
    } else {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        city: '',
        country: '',
        notes: '',
      });
    }
  }, [customer, reset]);

  const onSubmit = async (values: CustomerFormValues) => {
    const payload: CreateCustomerInput = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email || undefined,
      phone: values.phone || undefined,
      company: values.company || undefined,
      address: values.address || undefined,
      city: values.city || undefined,
      country: values.country || undefined,
      notes: values.notes || undefined,
    };

    try {
      if (isEditing && customer) {
        await updateCustomer.mutateAsync({ id: customer.id, ...payload });
      } else {
        await createCustomer.mutateAsync(payload);
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
      title={isEditing ? 'Edit Customer' : 'Add Customer'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Row 1: First + Last name */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="First Name" required error={errors.firstName?.message}>
            <input
              {...register('firstName')}
              className={inputClass(!!errors.firstName)}
              placeholder="Jane"
            />
          </FormField>
          <FormField label="Last Name" required error={errors.lastName?.message}>
            <input
              {...register('lastName')}
              className={inputClass(!!errors.lastName)}
              placeholder="Smith"
            />
          </FormField>
        </div>

        {/* Row 2: Email + Phone */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Email" error={errors.email?.message}>
            <input
              {...register('email')}
              type="email"
              className={inputClass(!!errors.email)}
              placeholder="jane@acme.com"
            />
          </FormField>
          <FormField label="Phone" error={errors.phone?.message}>
            <input
              {...register('phone')}
              className={inputClass(!!errors.phone)}
              placeholder="+1 555 000 0000"
            />
          </FormField>
        </div>

        {/* Row 3: Company + Address */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Company" error={errors.company?.message}>
            <input
              {...register('company')}
              className={inputClass(!!errors.company)}
              placeholder="Acme Corp"
            />
          </FormField>
          <FormField label="Address" error={errors.address?.message}>
            <input
              {...register('address')}
              className={inputClass(!!errors.address)}
              placeholder="123 Main St"
            />
          </FormField>
        </div>

        {/* Row 4: City + Country */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="City" error={errors.city?.message}>
            <input
              {...register('city')}
              className={inputClass(!!errors.city)}
              placeholder="New York"
            />
          </FormField>
          <FormField label="Country" error={errors.country?.message}>
            <input
              {...register('country')}
              className={inputClass(!!errors.country)}
              placeholder="USA"
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
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Customer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}