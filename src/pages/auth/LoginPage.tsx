import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Building2, Loader2 } from 'lucide-react';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import type { ApiResponse, LoginResponse } from '@/types';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginInput = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState('');
    const { setAuth } = useAuthStore();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginInput) => {
        setServerError('');
        try {
            const res = await api.post<ApiResponse<any>>('/auth/login', data);
            const { user, accessToken, refreshToken } = res.data.data;
            setAuth(user, accessToken, refreshToken);
            navigate('/dashboard');
        } catch (err: any) {
            setServerError(
                err.response?.data?.message || 'Something went wrong. Please try again.'
            );
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-12">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500">
                        <Building2 size={20} className="text-white" />
                    </div>
                    <span className="text-white font-semibold text-xl">CRM SaaS</span>
                </div>

                <div>
                    <blockquote className="text-slate-300 text-2xl font-light leading-relaxed">
                        "The platform that transformed how our sales team manages relationships and closes deals."
                    </blockquote>
                    <div className="mt-6">
                        <p className="text-white font-medium">Sarah Johnson</p>
                        <p className="text-slate-400 text-sm">VP of Sales, TechCorp</p>
                    </div>
                </div>

                <div className="flex gap-6 text-slate-400 text-sm">
                    <span>© 2026 CRM SaaS</span>
                    <span>Privacy Policy</span>
                    <span>Terms of Service</span>
                </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-3 mb-8 lg:hidden">
                        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500">
                            <Building2 size={18} className="text-white" />
                        </div>
                        <span className="text-slate-800 font-semibold text-lg">CRM SaaS</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
                        <p className="text-slate-500 mt-1">Sign in to your account to continue</p>
                    </div>

                    {serverError && (
                        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Email address
                            </label>
                            <input
                                {...register('email')}
                                type="email"
                                autoComplete="email"
                                placeholder="you@company.com"
                                className={cn(
                                    'w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors',
                                    'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20',
                                    errors.email
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-slate-300 bg-white'
                                )}
                            />
                            {errors.email && (
                                <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-medium text-slate-700">
                                    Password
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className={cn(
                                        'w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors pr-10',
                                        'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20',
                                        errors.password
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-slate-300 bg-white'
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={cn(
                                'w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white transition-colors',
                                'bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500/20',
                                isSubmitting && 'opacity-70 cursor-not-allowed'
                            )}
                        >
                            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                            {isSubmitting ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}