import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function initials(name: string) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase())
        .join('');
}

export function money(value: number | string | null | undefined, options: { decimals?: boolean } = {}) {
    const n = Number(value ?? 0);
    const formatted = options.decimals
        ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : n.toLocaleString();
    return `Rs. ${formatted}`;
}
