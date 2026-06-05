import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Copy, KeyRound, Mail } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Credentials {
    name: string;
    email: string;
    password: string;
    role: string;
}

interface Props {
    credentials: Credentials | null;
}

function CopyButton({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={copy} title="Copy">
            {copied
                ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                : <Copy className="h-4 w-4" />}
        </Button>
    );
}

export default function AccountCreated({ credentials }: Props) {
    return (
        <AppLayout title="Account Created" description="Login credentials generated">
            <Head title="Account Created" />

            <div className="mx-auto max-w-lg space-y-6">
                {credentials ? (
                    <>
                        <Card className="border-emerald-200 bg-emerald-50">
                            <CardContent className="flex items-center gap-3 p-4">
                                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                                <p className="text-sm font-medium text-emerald-800">
                                    Login account created for <strong>{credentials.name}</strong>.
                                    Share these credentials securely — the password will not be shown again.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <KeyRound className="h-4 w-4" />
                                    Login Credentials
                                    <Badge variant="secondary" className="ml-auto">{credentials.role}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</p>
                                    <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
                                        <span className="flex-1 text-sm font-medium">{credentials.name}</span>
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Email (Username)</p>
                                    <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
                                        <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <span className="flex-1 text-sm font-medium">{credentials.email}</span>
                                        <CopyButton value={credentials.email} />
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Temporary Password</p>
                                    <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
                                        <KeyRound className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <span className="flex-1 font-mono text-sm font-bold tracking-widest">{credentials.password}</span>
                                        <CopyButton value={credentials.password} />
                                    </div>
                                </div>

                                <p className="text-xs text-muted-foreground">
                                    The user should change their password after first login via their Profile settings.
                                </p>
                            </CardContent>
                        </Card>

                        <div className="flex gap-3">
                            <Button asChild variant="outline" className="flex-1">
                                <Link href="/teachers">Back to Teachers</Link>
                            </Button>
                            <Button asChild variant="outline" className="flex-1">
                                <Link href="/students">Back to Students</Link>
                            </Button>
                        </div>
                    </>
                ) : (
                    <Card>
                        <CardContent className="py-16 text-center text-sm text-muted-foreground">
                            No credentials to display.
                            <div className="mt-4">
                                <Button asChild variant="outline">
                                    <Link href="/dashboard">Go to Dashboard</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
