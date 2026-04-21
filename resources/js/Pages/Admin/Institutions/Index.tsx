import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle2, Pause, Trash2 } from 'lucide-react';

type Institution = {
    id: number;
    name: string;
    slug: string;
    status: 'pending' | 'active' | 'suspended';
    users_count: number;
    students_count: number;
    teachers_count: number;
    created_at: string | null;
};

const statusStyles: Record<Institution['status'], string> = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-200',
    active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    suspended: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export default function AdminInstitutions({
    institutions,
}: {
    institutions: Institution[];
}) {
    const { flash } = usePage().props;

    const approve = (i: Institution) =>
        router.patch(route('admin.institutions.approve', i.id));
    const suspend = (i: Institution) => {
        if (confirm(`Suspend ${i.name}?`)) {
            router.patch(route('admin.institutions.suspend', i.id));
        }
    };
    const reject = (i: Institution) => {
        if (confirm(`Reject and delete ${i.name}? This cannot be undone.`)) {
            router.patch(route('admin.institutions.reject', i.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-slate-800">
                    Institutions
                </h2>
            }
        >
            <Head title="Institutions" />

            <div className="py-8">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            {flash.success}
                        </div>
                    )}

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Institution
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Users
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Students
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Teachers
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Registered
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {institutions.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                                            No institutions yet.
                                        </td>
                                    </tr>
                                )}
                                {institutions.map((i) => (
                                    <tr key={i.id}>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900">{i.name}</div>
                                            <div className="text-xs text-slate-500">/{i.slug}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[i.status]}`}
                                            >
                                                {i.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{i.users_count}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{i.students_count}</td>
                                        <td className="px-4 py-3 text-sm text-slate-700">{i.teachers_count}</td>
                                        <td className="px-4 py-3 text-sm text-slate-500">{i.created_at}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {i.status === 'pending' && (
                                                    <button
                                                        onClick={() => approve(i)}
                                                        className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
                                                    >
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        Approve
                                                    </button>
                                                )}
                                                {i.status === 'active' && (
                                                    <button
                                                        onClick={() => suspend(i)}
                                                        className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                                    >
                                                        <Pause className="h-3.5 w-3.5" />
                                                        Suspend
                                                    </button>
                                                )}
                                                {i.status !== 'active' && (
                                                    <button
                                                        onClick={() => reject(i)}
                                                        className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Reject
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
