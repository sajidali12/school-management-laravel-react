import { PropsWithChildren, ReactNode, useEffect, useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    BookOpen,
    CheckCircle2,
    ClipboardList,
    GraduationCap,
    LayoutDashboard,
    LogOut,
    Menu,
    UserCheck,
    X,
    XCircle,
} from 'lucide-react';
import { cn, initials } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageProps } from '@/types';

interface NavItem {
    label: string;
    href: string;
    icon: ReactNode;
    match: string;
    soon?: boolean;
}

const navItems: NavItem[] = [
    { label: 'Dashboard',    href: '/student/dashboard',    icon: <LayoutDashboard className="h-4 w-4" />, match: 'student/dashboard' },
    { label: 'Attendance',   href: '/student/attendance',   icon: <UserCheck className="h-4 w-4" />,       match: 'student/attendance' },
    { label: 'Lesson Plans', href: '/student/lesson-plans', icon: <BookOpen className="h-4 w-4" />,        match: 'student/lesson-plans' },
    { label: 'Assignments',  href: '/student/assignments',  icon: <ClipboardList className="h-4 w-4" />,   match: 'student/assignments' },
    { label: 'Notifications',href: '/student/notifications',icon: <Bell className="h-4 w-4" />,            match: 'student/notifications',soon: true },
];

interface StudentLayoutProps {
    title: string;
    description?: string;
    actions?: ReactNode;
}

export default function StudentLayout({ title, description, actions, children }: PropsWithChildren<StudentLayoutProps>) {
    const { props, url } = usePage<PageProps>();
    const user = props.auth.user;
    const [open, setOpen] = useState(false);
    const [toast, setToast] = useState<{ id: number; type: 'success' | 'error'; message: string } | null>(null);
    const toastIdRef = useRef(0);

    useEffect(() => {
        const handler = (event: CustomEvent<{ page: { props: PageProps } }>) => {
            const flash = event.detail.page.props.flash;
            if (flash?.success) { toastIdRef.current += 1; setToast({ id: toastIdRef.current, type: 'success', message: flash.success }); }
            else if (flash?.error) { toastIdRef.current += 1; setToast({ id: toastIdRef.current, type: 'error', message: flash.error }); }
        };
        return router.on('success', handler);
    }, []);

    useEffect(() => {
        const flash = props.flash;
        if (flash?.success) { toastIdRef.current += 1; setToast({ id: toastIdRef.current, type: 'success', message: flash.success }); }
        else if (flash?.error) { toastIdRef.current += 1; setToast({ id: toastIdRef.current, type: 'error', message: flash.error }); }
    }, [props.flash?.success, props.flash?.error]);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3500);
        return () => clearTimeout(t);
    }, [toast]);

    const isActive = (match: string) => url.startsWith(`/${match}`);

    return (
        <div className="min-h-screen bg-muted/30">
            <aside className={cn(
                'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-background transition-transform lg:translate-x-0',
                open ? 'translate-x-0' : '-translate-x-full',
            )}>
                <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary text-primary-foreground">
                        {props.institution?.logo_url
                            ? <img src={props.institution.logo_url} alt={props.institution.name} className="h-full w-full object-cover" />
                            : <GraduationCap className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold leading-tight">{props.institution?.name ?? 'School'}</div>
                        <div className="truncate text-xs text-muted-foreground">Student Portal</div>
                    </div>
                    <button className="rounded-md p-1 hover:bg-accent lg:hidden" onClick={() => setOpen(false)}>
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
                    {navItems.map((item) => (
                        item.soon ? (
                            <div
                                key={item.href}
                                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/50 cursor-not-allowed"
                                title="Coming soon"
                            >
                                {item.icon}
                                <span>{item.label}</span>
                                <span className="ml-auto text-[10px] rounded bg-muted px-1.5 py-0.5 font-semibold text-muted-foreground">Soon</span>
                            </div>
                        ) : (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                    isActive(item.match)
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                                )}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        )
                    ))}
                </nav>

                <div className="shrink-0 border-t px-4 py-3 text-center">
                    <div className="text-[11px] font-medium text-muted-foreground">School Management System</div>
                </div>
            </aside>

            {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}

            <div className="lg:pl-64">
                <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
                    <button className="rounded-md p-2 hover:bg-accent lg:hidden" onClick={() => setOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-semibold">{title}</h1>
                        {description && <p className="text-xs text-muted-foreground">{description}</p>}
                    </div>
                    {actions}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback className="bg-primary text-primary-foreground">{initials(user.name)}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col">
                                    <span className="font-medium">{user.name}</span>
                                    <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/profile">Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onSelect={() => router.post('/logout')}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>

                <main className="p-4 lg:p-6">{children}</main>
            </div>

            {toast && (
                <div
                    key={toast.id}
                    className={cn(
                        'fixed bottom-6 right-6 z-50 flex min-w-[280px] max-w-sm items-center gap-3 rounded-lg border-2 px-4 py-3 text-sm font-semibold shadow-2xl ring-2 ring-offset-2 animate-in slide-in-from-right-5 fade-in duration-200',
                        toast.type === 'success'
                            ? 'border-emerald-600 bg-emerald-500 text-white ring-emerald-500/30'
                            : 'border-rose-600 bg-rose-500 text-white ring-rose-500/30',
                    )}
                    role="alert"
                >
                    {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <XCircle className="h-5 w-5 shrink-0" />}
                    <div className="flex-1">{toast.message}</div>
                    <button onClick={() => setToast(null)} className="rounded-md p-1 hover:bg-white/20">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
