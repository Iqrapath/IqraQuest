import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    [x: string]: any;
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface TeacherPaymentMethod {
    id: number;
    payment_type: string;
    bank_name?: string;
    account_number?: string;
    bank_code?: string;
    account_name?: string;
    email?: string;
    is_primary: boolean;
}

export interface Payout {
    [key: string]: any;
    id: number;
    amount: string; // Decimal is usually string in JSON
    status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'failed';
    requested_at: string;
    gateway: string;
    teacher: {
        id: number;
        user: User;
    };
    payment_method?: TeacherPaymentMethod;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    pageTitle?: string;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    role: string;
    [key: string]: unknown; // This allows for additional properties...
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: Auth;
};
