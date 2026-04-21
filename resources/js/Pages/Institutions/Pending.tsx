import { Head, Link } from '@inertiajs/react';
import { Clock, GraduationCap } from 'lucide-react';

export default function Pending({
    institution,
}: {
    institution: { name: string; slug: string; status: string };
}) {
    return (
        <>
            <Head title="Awaiting approval" />

            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
                <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                        <Clock className="h-7 w-7" />
                    </div>

                    <h1 className="text-xl font-semibold text-slate-900">
                        Request submitted
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        <span className="font-medium text-slate-700">
                            {institution.name}
                        </span>{' '}
                        is awaiting approval. You&apos;ll be able to sign in
                        once an administrator activates your account.
                    </p>

                    <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-left text-sm">
                        <p className="text-slate-500">Your sign-in URL</p>
                        <p className="mt-1 font-mono text-slate-800">
                            /login?i={institution.slug}
                        </p>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                        <GraduationCap className="h-4 w-4" />
                        <span>School MS</span>
                    </div>

                    <Link
                        href={route('home')}
                        className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:underline"
                    >
                        Return to home
                    </Link>
                </div>
            </div>
        </>
    );
}
