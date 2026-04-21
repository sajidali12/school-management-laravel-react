import InputError from '@/components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { Building2, GraduationCap, Loader2 } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function RegisterInstitution() {
    const { data, setData, post, processing, errors } = useForm({
        institution_name: '',
        slug: '',
        admin_name: '',
        admin_email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('institutions.register'));
    };

    const autoSlug = (name: string) =>
        name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 40);

    return (
        <>
            <Head title="Register your institution" />

            <div className="min-h-screen bg-slate-50 py-12">
                <div className="mx-auto max-w-2xl px-6">
                    <div className="mb-8 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                        <span className="text-lg font-semibold text-slate-900">
                            School MS
                        </span>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                        <div className="mb-6 flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-slate-900">
                                    Register your institution
                                </h1>
                                <p className="mt-1 text-sm text-slate-500">
                                    An administrator will review and approve
                                    your request before activation.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Institution name
                                    </label>
                                    <input
                                        type="text"
                                        value={data.institution_name}
                                        onChange={(e) => {
                                            setData('institution_name', e.target.value);
                                            if (!data.slug) {
                                                setData('slug', autoSlug(e.target.value));
                                            }
                                        }}
                                        className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        placeholder="Acme University"
                                    />
                                    <InputError message={errors.institution_name} className="mt-1.5" />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        URL slug
                                    </label>
                                    <div className="flex rounded-lg border border-slate-300 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
                                        <span className="rounded-l-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-500">
                                            /login?i=
                                        </span>
                                        <input
                                            type="text"
                                            value={data.slug}
                                            onChange={(e) =>
                                                setData('slug', e.target.value.toLowerCase())
                                            }
                                            className="w-full rounded-r-lg border-0 px-3 py-2.5 text-sm focus:outline-none focus:ring-0"
                                            placeholder="acme"
                                        />
                                    </div>
                                    <InputError message={errors.slug} className="mt-1.5" />
                                </div>
                            </div>

                            <div className="border-t border-slate-200 pt-5">
                                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                                    Admin account
                                </h2>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Full name
                                        </label>
                                        <input
                                            type="text"
                                            value={data.admin_name}
                                            onChange={(e) => setData('admin_name', e.target.value)}
                                            className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                        <InputError message={errors.admin_name} className="mt-1.5" />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={data.admin_email}
                                            onChange={(e) => setData('admin_email', e.target.value)}
                                            className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                        <InputError message={errors.admin_email} className="mt-1.5" />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                        <InputError message={errors.password} className="mt-1.5" />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Confirm password
                                        </label>
                                        <input
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) =>
                                                setData('password_confirmation', e.target.value)
                                            }
                                            className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <Link
                                    href={route('login')}
                                    className="text-sm text-slate-600 hover:text-slate-900"
                                >
                                    Already have an account? Sign in
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-60"
                                >
                                    {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Submit for review
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
