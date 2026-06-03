import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Building2, User, CheckCircle2 } from 'lucide-react';
import { useOrganization, useUpdateOrganization, useUpdateProfile } from '@/hooks/useProfile';
import { useAuthStore } from '@/store/auth.store';
import FormField, { inputClass } from '@/components/ui/FormField';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/formatters';


const orgSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
});

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
});

type OrgFormInput = z.infer<typeof orgSchema>;
type ProfileFormInput = z.infer<typeof profileSchema>;

type ActiveTab = 'organization' | 'profile';


export default function SettingsPage() {
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role === 'ORG_ADMIN';
  const [tab, setTab] = useState<ActiveTab>(isAdmin ? 'organization' : 'profile');

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Settings</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your account and organization settings
        </p>
      </div>
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        {isAdmin && (
          <button
            onClick={() => setTab('organization')}
            className={cn(
              'flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
              tab === 'organization'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <Building2 size={14} />
            Organization
          </button>
        )}
        <button
          onClick={() => setTab('profile')}
          className={cn(
            'flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
            tab === 'profile'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          <User size={14} />
          My Profile
        </button>
      </div>

      {tab === 'organization' && isAdmin && <OrgSettingsForm />}
      {tab === 'profile' && <ProfileSettingsForm />}
    </div>
  );
}


function OrgSettingsForm() {
  const { data: org, isLoading } = useOrganization();
  const updateOrg = useUpdateOrganization();
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<OrgFormInput>({
    resolver: zodResolver(orgSchema),
  });

  useEffect(() => {
    if (org) {
      reset({
        name: org.name ?? '',
        email: org.email ?? '',
        phone: org.phone ?? '',
        website: org.website ?? '',
        address: (org as any).address ?? '',
        city: (org as any).city ?? '',
        country: (org as any).country ?? '',
      });
    }
  }, [org, reset]);

  const onSubmit = async (data: OrgFormInput) => {
    setServerError('');
    setSaved(false);
    try {
      await updateOrg.mutateAsync({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        website: data.website || null,
        ...(data as any),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || 'Failed to update organization'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <p className="text-sm text-slate-400">Loading organization settings...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-base font-semibold text-slate-800 mb-1">
        Organization Profile
      </h3>
      <p className="text-sm text-slate-500 mb-6">
        Update your organization's public information
      </p>

      {serverError && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Organization Name" required error={errors.name?.message}>
          <input
            {...register('name')}
            className={inputClass(!!errors.name)}
            placeholder="Acme Corp"
          />
        </FormField>

        <FormField label="Contact Email" required error={errors.email?.message}>
          <input
            {...register('email')}
            type="email"
            className={inputClass(!!errors.email)}
            placeholder="contact@company.com"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Phone" error={errors.phone?.message}>
            <input
              {...register('phone')}
              className={inputClass(!!errors.phone)}
              placeholder="+1 234 567 8900"
            />
          </FormField>
          <FormField label="Website" error={errors.website?.message}>
            <input
              {...register('website')}
              className={inputClass(!!errors.website)}
              placeholder="https://company.com"
            />
          </FormField>
        </div>

        <FormField label="Address" error={errors.address?.message}>
          <input
            {...register('address')}
            className={inputClass(!!errors.address)}
            placeholder="123 Main Street"
          />
        </FormField>

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

        <div className="flex items-center justify-between pt-2">
          {saved && (
            <div className="flex items-center gap-1.5 text-sm text-emerald-600">
              <CheckCircle2 size={15} />
              Changes saved
            </div>
          )}
          {!saved && <div />}
          <button
            type="submit"
            disabled={isSubmitting || updateOrg.isPending || !isDirty}
            className={cn(
              'flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors',
              (isSubmitting || updateOrg.isPending || !isDirty) &&
                'opacity-60 cursor-not-allowed'
            )}
          >
            {updateOrg.isPending && (
              <Loader2 size={14} className="animate-spin" />
            )}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}


function ProfileSettingsForm() {
  const currentUser = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: currentUser?.firstName ?? '',
      lastName: currentUser?.lastName ?? '',
    },
  });

  const onSubmit = async (data: ProfileFormInput) => {
    setServerError('');
    setSaved(false);
    try {
      await updateProfile.mutateAsync(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || 'Failed to update profile'
      );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-base font-semibold text-slate-800 mb-1">
        My Profile
      </h3>
      <p className="text-sm text-slate-500 mb-6">
        Update your personal information
      </p>

      {serverError && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {serverError}
        </div>
      )}

      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500 text-white text-xl font-semibold">
          {getInitials(
            currentUser?.firstName ?? '',
            currentUser?.lastName ?? ''
          )}
        </div>
        <div>
          <p className="font-medium text-slate-800">
            {currentUser?.firstName} {currentUser?.lastName}
          </p>
          <p className="text-sm text-slate-400">{currentUser?.email}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {currentUser?.role?.replace('_', ' ')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="First Name"
            required
            error={errors.firstName?.message}
          >
            <input
              {...register('firstName')}
              className={inputClass(!!errors.firstName)}
              placeholder="John"
            />
          </FormField>
          <FormField
            label="Last Name"
            required
            error={errors.lastName?.message}
          >
            <input
              {...register('lastName')}
              className={inputClass(!!errors.lastName)}
              placeholder="Doe"
            />
          </FormField>
        </div>

        <FormField label="Email Address">
          <input
            value={currentUser?.email ?? ''}
            disabled
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-400 bg-slate-50 cursor-not-allowed"
          />
          <p className="text-xs text-slate-400 mt-1">
            Email cannot be changed
          </p>
        </FormField>

        <div className="flex items-center justify-between pt-2">
          {saved && (
            <div className="flex items-center gap-1.5 text-sm text-emerald-600">
              <CheckCircle2 size={15} />
              Profile updated
            </div>
          )}
          {!saved && <div />}
          <button
            type="submit"
            disabled={isSubmitting || updateProfile.isPending || !isDirty}
            className={cn(
              'flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors',
              (isSubmitting || updateProfile.isPending || !isDirty) &&
                'opacity-60 cursor-not-allowed'
            )}
          >
            {updateProfile.isPending && (
              <Loader2 size={14} className="animate-spin" />
            )}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}