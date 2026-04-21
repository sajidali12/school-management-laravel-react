import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    GraduationCap,
    ShieldCheck,
    Users,
} from 'lucide-react';

export default function Welcome({ auth }: PageProps) {
    return (
        <>
            <Head>
                <title>
                    School Management Software — Manage Students, Fees &
                    Attendance Online
                </title>
                <meta
                    name="description"
                    content="All-in-one school management software to handle student records, fees, attendance, classes, and staff. Simple online school software for schools, colleges, and academies."
                />
                <meta
                    name="keywords"
                    content="school management software, school management system, student management system, online school software, fee management system, attendance management system, school ERP, school admin software"
                />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="/" />

                <meta property="og:type" content="website" />
                <meta
                    property="og:title"
                    content="School Management Software — Students, Fees & Attendance in One Place"
                />
                <meta
                    property="og:description"
                    content="Manage students, fees, attendance, classes, and staff online. Simple, secure school management software for every institution."
                />
                <meta property="og:image" content="/img/hero.jpg" />

                <meta name="twitter:card" content="summary_large_image" />
                <meta
                    name="twitter:title"
                    content="School Management Software — Students, Fees & Attendance in One Place"
                />
                <meta
                    name="twitter:description"
                    content="Manage students, fees, attendance, and classes online. Simple school management software for schools and academies."
                />
                <meta name="twitter:image" content="/img/hero.jpg" />
            </Head>

            <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
                <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
                    <div className="flex items-center gap-2">
                        <img
                            src="/img/sms-logo.png"
                            alt="School MS"
                            className="h-[4.5rem] w-[4.5rem] object-contain"
                        />
                        <span className="text-lg font-semibold text-slate-900">
                            School MS
                        </span>
                    </div>
                    <nav className="flex items-center gap-3 text-sm">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="rounded-lg px-4 py-2 font-medium text-slate-700 hover:bg-slate-100"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href={route('institutions.register')}
                                    className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500"
                                >
                                    Register institution
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                <main className="mx-auto max-w-6xl px-6 py-16">
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                        <div className="text-center lg:text-left">
                            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                                One platform for{' '}
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    every institution
                                </span>
                            </h1>
                            <p className="mt-5 text-lg text-slate-600">
                                Launch your own branded school management
                                workspace. Students, faculty, courses, and
                                departments — unified under your logo and
                                colors.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                                <Link
                                    href={route('institutions.register')}
                                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                                >
                                    Register your institution
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href={route('login')}
                                    className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Sign in
                                </Link>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -left-6 -top-6 h-72 w-72 rounded-full bg-indigo-200/50 blur-3xl" />
                            <div className="absolute -bottom-6 -right-6 h-72 w-72 rounded-full bg-purple-200/50 blur-3xl" />

                            <div className="relative overflow-hidden rounded-3xl shadow-2xl ring-1 ring-slate-900/5">
                                <img
                                    src="/img/hero.jpg"
                                    alt="Students learning together"
                                    className="h-[420px] w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/30 via-transparent to-transparent" />
                            </div>

                            <div className="absolute -left-4 top-10 hidden rotate-[-4deg] rounded-xl bg-white p-4 shadow-xl ring-1 ring-slate-900/5 sm:block">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                                        <GraduationCap className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500">
                                            Enrolled
                                        </div>
                                        <div className="text-sm font-semibold text-slate-900">
                                            3,000+ students
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -right-4 bottom-10 hidden rotate-[3deg] rounded-xl bg-white p-4 shadow-xl ring-1 ring-slate-900/5 sm:block">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                                        <BookOpen className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500">
                                            Active
                                        </div>
                                        <div className="text-sm font-semibold text-slate-900">
                                            5+ institutions
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-20 grid gap-6 sm:grid-cols-3">
                        {[
                            {
                                icon: Users,
                                title: 'Unified records',
                                text: 'Students, faculty, and staff in one place, scoped to your institution.',
                            },
                            {
                                icon: BookOpen,
                                title: 'Courses & departments',
                                text: 'Run academic structures with clean, auditable workflows.',
                            },
                            {
                                icon: ShieldCheck,
                                title: 'Your branding',
                                text: 'Customize name, logo, and primary color — reflected across your tenant.',
                            },
                        ].map((f) => (
                            <div
                                key={f.title}
                                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                    <f.icon className="h-5 w-5" />
                                </div>
                                <h3 className="mt-4 text-base font-semibold text-slate-900">
                                    {f.title}
                                </h3>
                                <p className="mt-1.5 text-sm text-slate-600">
                                    {f.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </main>

                <footer className="mx-auto max-w-6xl border-t border-slate-200 px-6 py-8 text-center text-xs text-slate-500">
                    <div>&copy; {new Date().getFullYear()} School MS</div>
                    <div className="mt-1 text-[11px] text-slate-400">
                        Powered by{' '}
                        <a
                            href="https://execudea.com"
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-indigo-600 hover:underline"
                        >
                            Execudea
                        </a>
                    </div>
                </footer>
            </div>
        </>
    );
}
