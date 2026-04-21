import InputError from '@/components/InputError';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Eye,
    EyeOff,
    GraduationCap,
    Loader2,
    Lock,
    Mail,
    ShieldCheck,
    Sparkles,
    Users,
} from 'lucide-react';
import { FormEventHandler, useState } from 'react';

const hexToRgb = (hex: string) => {
    const m = hex.replace('#', '').match(/.{2}/g);
    if (!m) return '79, 70, 229';
    const [r, g, b] = m.map((c) => parseInt(c, 16));
    return `${r}, ${g}, ${b}`;
};

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { institution } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const brandColor = institution?.primary_color || '#4f46e5';
    const brandRgb = hexToRgb(brandColor);
    const brandName = institution?.name || 'School MS';

    const panelStyle = {
        background: `linear-gradient(135deg, ${brandColor} 0%, rgba(${brandRgb}, 0.85) 100%)`,
    };

    return (
        <>
            <Head title={`Sign in – ${brandName}`} />

            <div
                className="flex min-h-screen bg-slate-50"
                style={{ ['--brand' as string]: brandColor, ['--brand-rgb' as string]: brandRgb }}
            >
                <div
                    className="relative hidden w-full max-w-xl flex-col justify-between overflow-hidden p-12 text-white lg:flex"
                    style={panelStyle}
                >
                    <div
                        className="pointer-events-none absolute inset-0 opacity-20"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35) 0, transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.25) 0, transparent 45%)',
                        }}
                    />

                    <div className="relative flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
                            {institution?.logo_url ? (
                                <img src={institution.logo_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                                <GraduationCap className="h-6 w-6" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium uppercase tracking-widest text-white/70">
                                {institution ? 'Institution' : 'School MS'}
                            </p>
                            <p className="text-base font-semibold">{brandName}</p>
                        </div>
                    </div>

                    <div className="relative space-y-8">
                        <div>
                            <h1 className="text-4xl font-bold leading-tight">
                                Welcome to {brandName}.
                            </h1>
                            <p className="mt-4 max-w-md text-base text-white/85">
                                Sign in to manage students, faculty, courses,
                                and departments under your institution&apos;s
                                workspace.
                            </p>
                        </div>

                        <ul className="space-y-3 text-sm text-white/90">
                            <li className="flex items-start gap-3">
                                <Users className="mt-0.5 h-5 w-5 shrink-0 text-white/80" />
                                <span>Centralized student &amp; faculty records</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-white/80" />
                                <span>Streamlined course and department workflows</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-white/80" />
                                <span>Secure, role-based access for your staff</span>
                            </li>
                        </ul>
                    </div>

                    <p className="relative text-xs text-white/60">
                        &copy; {new Date().getFullYear()} {brandName}. Powered by{' '}
                        <a
                            href="https://execudea.com"
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-white hover:underline"
                        >
                            Execudea
                        </a>
                        .
                    </p>
                </div>

                <div className="flex w-full flex-1 items-center justify-center px-6 py-12 sm:px-10">
                    <div className="w-full max-w-md">
                        <div className="mb-8 flex items-center gap-2 lg:hidden">
                            <div
                                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg text-white"
                                style={{ backgroundColor: brandColor }}
                            >
                                {institution?.logo_url ? (
                                    <img src={institution.logo_url} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <GraduationCap className="h-5 w-5" />
                                )}
                            </div>
                            <span className="text-lg font-semibold text-slate-900">{brandName}</span>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                                Welcome back
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Sign in to continue to your dashboard.
                            </p>
                        </div>

                        {status && (
                            <div className="mb-6 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>{status}</span>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Email address
                                </label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        autoComplete="username"
                                        autoFocus
                                        placeholder="you@school.edu"
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:outline-none"
                                        style={{
                                            boxShadow: 'none',
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = brandColor;
                                            e.currentTarget.style.boxShadow = `0 0 0 3px rgba(${brandRgb}, 0.15)`;
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = '';
                                            e.currentTarget.style.boxShadow = '';
                                        }}
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-1.5" />
                            </div>

                            <div>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                        Password
                                    </label>
                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-xs font-medium hover:underline"
                                            style={{ color: brandColor }}
                                        >
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:outline-none"
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = brandColor;
                                            e.currentTarget.style.boxShadow = `0 0 0 3px rgba(${brandRgb}, 0.15)`;
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = '';
                                            e.currentTarget.style.boxShadow = '';
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((s) => !s)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-1.5" />
                            </div>

                            <label className="flex cursor-pointer select-none items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData('remember', (e.target.checked || false) as false)
                                    }
                                    className="h-4 w-4 rounded border-slate-300"
                                    style={{ accentColor: brandColor }}
                                />
                                <span className="text-sm text-slate-600">Keep me signed in</span>
                            </label>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                                style={{ backgroundColor: brandColor }}
                            >
                                {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                                {processing ? 'Signing in…' : 'Sign in'}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-slate-500">
                            New institution?{' '}
                            <Link
                                href={route('institutions.register')}
                                className="font-medium hover:underline"
                                style={{ color: brandColor }}
                            >
                                Register here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
