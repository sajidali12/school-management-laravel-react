import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface PaginationProps {
    links: { url: string | null; label: string; active: boolean }[];
    from: number | null;
    to: number | null;
    total: number;
}

export default function Pagination({ links, from, to, total }: PaginationProps) {
    if (links.length <= 3) return null;

    return (
        <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{from ?? 0}</span> to{' '}
                <span className="font-medium text-foreground">{to ?? 0}</span> of{' '}
                <span className="font-medium text-foreground">{total}</span>
            </p>
            <div className="flex flex-wrap gap-1">
                {links.map((link, idx) => (
                    <Link
                        key={idx}
                        href={link.url ?? '#'}
                        preserveScroll
                        className={cn(
                            'inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm',
                            link.active ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent',
                            !link.url && 'pointer-events-none opacity-50',
                        )}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>
        </div>
    );
}
