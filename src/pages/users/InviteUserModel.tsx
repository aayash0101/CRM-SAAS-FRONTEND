import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mail } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import FormField, { inputClass } from '@/components/ui/FormField';
import { useInviteUser } from '@/hooks/useUsers';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['ORG_ADMIN', 'SALES_MANAGER', 'SALES_REP']),
});

type InviteFormInput = z.infer<typeof inviteSchema>;

interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
}

export default function InviteUserModal({ open, onClose }: InviteUserModalProps) {
  const inviteUser = useInviteUser();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormInput>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'SALES_REP' },
  });

  const handleClose = () => {
    reset();
    setSuccess(false);
    setServerError('');
    onClose();
  };

  const onSubmit = async (data: InviteFormInput) => {
    setServerError('');
    try {
      await inviteUser.mutateAsync(data);
      setSuccess(true);
      reset();
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || 'Failed to send invitation. Please try again.'
      );
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Invite Team Member" size="sm">
      {success ? (
        <div className="text-center py-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 mx-auto mb-4">
            <Mail size={20} className="text-emerald-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">
            Invitation sent
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            The invitation email has been sent successfully.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setSuccess(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Invite Another
            </button>
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {serverError}
            </div>
          )}

          <FormField label="Email Address" required error={errors.email?.message}>
            <input
              {...register('email')}
              type="email"
              placeholder="colleague@company.com"
              className={inputClass(!!errors.email)}
            />
          </FormField>

          <FormField label="Role" required error={errors.role?.message}>
            <select {...register('role')} className={inputClass(!!errors.role)}>
              <option value="SALES_REP">Sales Rep</option>
              <option value="SALES_MANAGER">Sales Manager</option>
              <option value="ORG_ADMIN">Org Admin</option>
            </select>
          </FormField>

          <p className="text-xs text-slate-400">
            They will receive an email with a link to set up their account.
          </p>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || inviteUser.isPending}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors',
                (isSubmitting || inviteUser.isPending) && 'opacity-70 cursor-not-allowed'
              )}
            >
              {inviteUser.isPending && <Loader2 size={14} className="animate-spin" />}
              Send Invitation
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}