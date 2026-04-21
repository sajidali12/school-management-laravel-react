export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role?: 'super_admin' | 'institution_admin' | 'staff';
    institution_id?: number | null;
}

export interface InstitutionBrand {
    id: number;
    name: string;
    slug: string;
    logo_url: string | null;
    primary_color: string;
    status: 'pending' | 'active' | 'suspended';
}

export interface FlashMessages {
    success?: string;
    error?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    institution: InstitutionBrand | null;
    flash?: FlashMessages;
};

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
}

export interface SchoolClass {
    id: number;
    name: string;
    level: number | null;
    description: string | null;
    sections_count?: number;
    subjects_count?: number;
}

export interface Section {
    id: number;
    school_class_id: number;
    school_class?: { id: number; name: string };
    class_teacher_id: number | null;
    class_teacher?: { id: number; first_name: string; last_name: string; full_name: string } | null;
    name: string;
    room: string | null;
    capacity: number | null;
    full_name?: string;
    students_count?: number;
}

export interface Teacher {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone: string | null;
    designation: string;
    qualification: string | null;
    specialization: string | null;
    joining_date: string | null;
    date_of_birth: string | null;
    gender: string | null;
    address: string | null;
    status: 'active' | 'on_leave' | 'inactive';
    class_sections_count?: number;
}

export interface Subject {
    id: number;
    code: string;
    name: string;
    description: string | null;
    is_active: boolean;
    classes_count?: number;
}

export interface FeeCategory {
    id: number;
    name: string;
    description: string | null;
    frequency: 'monthly' | 'quarterly' | 'annual' | 'one_time';
    is_active: boolean;
    structures_count?: number;
}

export interface FeeStructure {
    id: number;
    school_class_id: number;
    fee_category_id: number;
    amount: string;
    fee_category?: { id: number; name: string; frequency: string };
}

export interface FeeInvoiceItem {
    id: number;
    fee_invoice_id: number;
    fee_category_id: number;
    description: string;
    amount: string;
    fee_category?: { id: number; name: string };
}

export interface FeePayment {
    id: number;
    fee_invoice_id: number;
    amount: string;
    payment_date: string;
    method: 'cash' | 'bank_transfer' | 'cheque' | 'card' | 'online';
    reference: string | null;
    account_id: number | null;
    account?: { id: number; name: string } | null;
    notes: string | null;
}

export interface FeeInvoice {
    id: number;
    student_id: number;
    invoice_number: string;
    issue_date: string;
    due_date: string;
    period: string | null;
    total_amount: string;
    paid_amount: string;
    status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
    notes: string | null;
    student?: {
        id: number;
        first_name: string;
        last_name: string;
        roll_number: string;
        guardian_name?: string | null;
        phone?: string | null;
        section?: { id: number; name: string; school_class?: { id: number; name: string } };
    };
    items?: FeeInvoiceItem[];
    payments?: FeePayment[];
}

export interface Account {
    id: number;
    name: string;
    type: 'cash' | 'bank' | 'wallet';
    account_number: string | null;
    bank_name: string | null;
    opening_balance: string;
    is_active: boolean;
    current_balance: number;
}

export interface ExpenseCategory {
    id: number;
    name: string;
    description: string | null;
}

export interface Transaction {
    id: number;
    account_id: number;
    expense_category_id: number | null;
    type: 'income' | 'expense' | 'transfer';
    amount: string;
    date: string;
    description: string;
    reference: string | null;
    source_type: string | null;
    source_id: number | null;
    account?: { id: number; name: string };
    expense_category?: { id: number; name: string } | null;
}

export interface Student {
    id: number;
    section_id: number;
    section?: {
        id: number;
        name: string;
        school_class_id: number;
        school_class?: { id: number; name: string };
    };
    roll_number: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    date_of_birth: string | null;
    gender: string | null;
    guardian_name: string | null;
    guardian_phone: string | null;
    address: string | null;
    admission_year: number | null;
    status: 'active' | 'graduated' | 'transferred' | 'dropped';
}
