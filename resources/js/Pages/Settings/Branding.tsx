import InputError from '@/components/InputError';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { ImagePlus, Loader2, Palette, Trash2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

type Institution = {
    name: string;
    slug: string;
    logo_url: string | null;
    primary_color: string;
};

const PRESETS = [
    '#4f46e5', '#7c3aed', '#db2777', '#dc2626',
    '#ea580c', '#ca8a04', '#16a34a', '#0891b2',
    '#2563eb', '#0f172a',
];

export default function Branding({ institution }: { institution: Institution }) {
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm<{
        name: string;
        primary_color: string;
        logo: File | null;
        remove_logo: boolean;
        _method: string;
    }>({
        name: institution.name,
        primary_color: institution.primary_color,
        logo: null,
        remove_logo: false,
        _method: 'patch',
    });

    const [preview, setPreview] = useState<string | null>(institution.logo_url);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('branding.update'), {
            forceFormData: true,
            onSuccess: () => reset('logo', 'remove_logo'),
        });
    };

    const onPickFile = (file: File | null) => {
        setData('logo', file);
        setData('remove_logo', false);
        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-slate-800">
                    Branding
                </h2>
            }
        >
            <Head title="Branding" />

            <div className="py-8">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            {flash.success}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="text-base font-semibold text-slate-900">
                                Institution profile
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                This is the name displayed on your login page and across your workspace.
                            </p>

                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                    <InputError message={errors.name} className="mt-1.5" />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        URL slug
                                    </label>
                                    <input
                                        type="text"
                                        disabled
                                        value={institution.slug}
                                        className="block w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500"
                                    />
                                    <p className="mt-1.5 text-xs text-slate-400">Slug cannot be changed.</p>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                    <ImagePlus className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-slate-900">Logo</h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        PNG, JPG, SVG, or WEBP. Max 2MB.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 flex items-center gap-4">
                                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                    {preview ? (
                                        <img src={preview} alt="Logo preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-xs text-slate-400">No logo</span>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                        <ImagePlus className="h-4 w-4" />
                                        Upload
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                                        />
                                    </label>
                                    {(preview || institution.logo_url) && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPreview(null);
                                                setData('logo', null);
                                                setData('remove_logo', true);
                                            }}
                                            className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                            <InputError message={errors.logo} className="mt-2" />
                        </section>

                        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                    <Palette className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-slate-900">Primary color</h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Used for buttons, accents, and your login page.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 flex items-center gap-3">
                                <input
                                    type="color"
                                    value={data.primary_color}
                                    onChange={(e) => setData('primary_color', e.target.value)}
                                    className="h-10 w-16 cursor-pointer rounded-lg border border-slate-300"
                                />
                                <input
                                    type="text"
                                    value={data.primary_color}
                                    onChange={(e) => setData('primary_color', e.target.value)}
                                    className="w-32 rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm uppercase shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {PRESETS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setData('primary_color', c)}
                                        className="h-8 w-8 rounded-full ring-2 ring-offset-2 transition"
                                        style={{
                                            backgroundColor: c,
                                            boxShadow:
                                                data.primary_color.toLowerCase() === c
                                                    ? `0 0 0 2px ${c}`
                                                    : 'none',
                                        }}
                                        aria-label={c}
                                    />
                                ))}
                            </div>
                            <InputError message={errors.primary_color} className="mt-2" />
                        </section>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
                                style={{ backgroundColor: data.primary_color }}
                            >
                                {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                                Save changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
