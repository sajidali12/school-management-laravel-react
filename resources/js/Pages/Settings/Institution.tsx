import { FormEvent, useRef, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Building2, KeyRound, Mail, Upload, User } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface InstitutionData {
    id: number;
    name: string;
    slug: string;
    logo_url: string | null;
    primary_color: string;
    tagline: string | null;
    principal_name: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    city: string | null;
    address: string | null;
    registration_number: string | null;
    established_year: number | null;
    currency: string;
}

interface Props {
    institution: InstitutionData;
    account: { name: string; email: string };
}

type TabKey = 'general' | 'contact' | 'academic' | 'account';

export default function InstitutionSettings({ institution, account }: Props) {
    const [tab, setTab] = useState<TabKey>('general');

    return (
        <AppLayout title="Settings" description="Institution profile and account preferences">
            <Head title="Settings" />

            <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
                    <TabButton icon={<Building2 className="h-4 w-4" />} label="General" active={tab === 'general'} onClick={() => setTab('general')} />
                    <TabButton icon={<Mail className="h-4 w-4" />} label="Contact" active={tab === 'contact'} onClick={() => setTab('contact')} />
                    <TabButton icon={<User className="h-4 w-4" />} label="Academic" active={tab === 'academic'} onClick={() => setTab('academic')} />
                    <TabButton icon={<KeyRound className="h-4 w-4" />} label="Account" active={tab === 'account'} onClick={() => setTab('account')} />
                </nav>

                <div className="space-y-4">
                    {tab === 'general' && <GeneralSection institution={institution} />}
                    {tab === 'contact' && <ContactSection institution={institution} />}
                    {tab === 'academic' && <AcademicSection institution={institution} />}
                    {tab === 'account' && <AccountSection account={account} />}
                </div>
            </div>
        </AppLayout>
    );
}

function TabButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition',
                active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
            )}
        >
            {icon}
            {label}
        </button>
    );
}

function GeneralSection({ institution }: { institution: InstitutionData }) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(institution.logo_url);
    const { data, setData, post, processing, errors, progress } = useForm<{
        _method: string;
        name: string;
        tagline: string;
        primary_color: string;
        currency: string;
        logo: File | null;
        remove_logo: boolean;
    }>({
        _method: 'post',
        name: institution.name,
        tagline: institution.tagline ?? '',
        primary_color: institution.primary_color,
        currency: institution.currency,
        logo: null,
        remove_logo: false,
    });

    const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setData('logo', file);
        setData('remove_logo', false);
        setPreview(file ? URL.createObjectURL(file) : institution.logo_url);
    };

    const removeLogo = () => {
        setData('logo', null);
        setData('remove_logo', true);
        setPreview(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/settings/general', { forceFormData: true });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Institution profile</CardTitle>
                <CardDescription>Branding that appears across the portal and on printed documents</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div
                            className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-md border bg-muted text-xs text-muted-foreground"
                            style={{ borderColor: data.primary_color }}
                        >
                            {preview ? <img src={preview} alt="Logo" className="h-full w-full object-cover" /> : 'No logo'}
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload
                                </Button>
                                {preview && (
                                    <Button type="button" variant="ghost" size="sm" onClick={removeLogo}>Remove</Button>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">PNG/JPG/SVG, max 2MB</p>
                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
                        </div>
                    </div>
                    {errors.logo && <p className="text-xs text-destructive">{errors.logo}</p>}
                    {progress && <div className="text-xs text-muted-foreground">Uploading {progress.percentage}%</div>}

                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Name" error={errors.name} required>
                            <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        </Field>
                        <Field label="Currency" error={errors.currency} required>
                            <Select value={data.currency} onValueChange={(v) => setData('currency', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PKR">PKR — Pakistani Rupee</SelectItem>
                                    <SelectItem value="USD">USD — US Dollar</SelectItem>
                                    <SelectItem value="EUR">EUR — Euro</SelectItem>
                                    <SelectItem value="GBP">GBP — Pound Sterling</SelectItem>
                                    <SelectItem value="AED">AED — UAE Dirham</SelectItem>
                                    <SelectItem value="INR">INR — Indian Rupee</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Tagline" error={errors.tagline} className="md:col-span-2">
                            <Input value={data.tagline} onChange={(e) => setData('tagline', e.target.value)} placeholder="e.g. Learn. Lead. Inspire." />
                        </Field>
                        <Field label="Primary color" error={errors.primary_color} required>
                            <div className="flex gap-2">
                                <Input
                                    type="color"
                                    value={data.primary_color}
                                    onChange={(e) => setData('primary_color', e.target.value)}
                                    className="h-10 w-16 cursor-pointer p-1"
                                />
                                <Input value={data.primary_color} onChange={(e) => setData('primary_color', e.target.value)} />
                            </div>
                        </Field>
                        <Field label="Slug">
                            <Input value={institution.slug} disabled />
                        </Field>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>{processing ? 'Saving...' : 'Save changes'}</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function ContactSection({ institution }: { institution: InstitutionData }) {
    const { data, setData, patch, processing, errors } = useForm({
        email: institution.email ?? '',
        phone: institution.phone ?? '',
        website: institution.website ?? '',
        city: institution.city ?? '',
        address: institution.address ?? '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        patch('/settings/contact');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Contact details</CardTitle>
                <CardDescription>How parents, students and vendors can reach your institution</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Email" error={errors.email}>
                            <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                        </Field>
                        <Field label="Phone" error={errors.phone}>
                            <Input value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="+92 300 1234567" />
                        </Field>
                        <Field label="Website" error={errors.website} className="md:col-span-2">
                            <Input value={data.website} onChange={(e) => setData('website', e.target.value)} placeholder="https://..." />
                        </Field>
                        <Field label="City" error={errors.city}>
                            <Input value={data.city} onChange={(e) => setData('city', e.target.value)} />
                        </Field>
                        <Field label="Address" error={errors.address} className="md:col-span-2">
                            <Textarea rows={2} value={data.address} onChange={(e) => setData('address', e.target.value)} />
                        </Field>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>{processing ? 'Saving...' : 'Save changes'}</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function AcademicSection({ institution }: { institution: InstitutionData }) {
    const { data, setData, patch, processing, errors } = useForm({
        principal_name: institution.principal_name ?? '',
        registration_number: institution.registration_number ?? '',
        established_year: institution.established_year ?? ('' as number | ''),
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        patch('/settings/academic');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Academic info</CardTitle>
                <CardDescription>Registration and leadership details</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Principal name" error={errors.principal_name} className="md:col-span-2">
                            <Input value={data.principal_name} onChange={(e) => setData('principal_name', e.target.value)} />
                        </Field>
                        <Field label="Registration #" error={errors.registration_number}>
                            <Input value={data.registration_number} onChange={(e) => setData('registration_number', e.target.value)} />
                        </Field>
                        <Field label="Established year" error={errors.established_year}>
                            <Input
                                type="number"
                                min={1800}
                                max={new Date().getFullYear()}
                                value={data.established_year === '' ? '' : String(data.established_year)}
                                onChange={(e) => setData('established_year', e.target.value === '' ? '' : Number(e.target.value))}
                            />
                        </Field>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>{processing ? 'Saving...' : 'Save changes'}</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function AccountSection({ account }: { account: { name: string; email: string } }) {
    const profile = useForm({ name: account.name, email: account.email });
    const pwd = useForm({ current_password: '', password: '', password_confirmation: '' });

    const submitProfile = (e: FormEvent) => {
        e.preventDefault();
        profile.patch('/settings/account');
    };

    const submitPwd = (e: FormEvent) => {
        e.preventDefault();
        pwd.patch('/settings/password', { onSuccess: () => pwd.reset() });
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Admin profile</CardTitle>
                    <CardDescription>Your login name and email</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submitProfile} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Name" error={profile.errors.name} required>
                                <Input value={profile.data.name} onChange={(e) => profile.setData('name', e.target.value)} />
                            </Field>
                            <Field label="Email" error={profile.errors.email} required>
                                <Input type="email" value={profile.data.email} onChange={(e) => profile.setData('email', e.target.value)} />
                            </Field>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={profile.processing}>{profile.processing ? 'Saving...' : 'Update profile'}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Change password</CardTitle>
                    <CardDescription>Use at least 8 characters</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submitPwd} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Field label="Current password" error={pwd.errors.current_password} required>
                                <Input type="password" value={pwd.data.current_password} onChange={(e) => pwd.setData('current_password', e.target.value)} />
                            </Field>
                            <Field label="New password" error={pwd.errors.password} required>
                                <Input type="password" value={pwd.data.password} onChange={(e) => pwd.setData('password', e.target.value)} />
                            </Field>
                            <Field label="Confirm" required>
                                <Input type="password" value={pwd.data.password_confirmation} onChange={(e) => pwd.setData('password_confirmation', e.target.value)} />
                            </Field>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={pwd.processing}>{pwd.processing ? 'Updating...' : 'Update password'}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

function Field({ label, error, required, className, children }: { label: string; error?: string; required?: boolean; className?: string; children: React.ReactNode }) {
    return (
        <div className={cn('space-y-1.5', className)}>
            <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
