export type UserRole = 'SUPER_ADMIN' | 'ORG_ADMIN' | 'SALES_MANAGER' | 'SALES_REP';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    organizationId: string;
    avatarUrl?: string | null;
    status: string;
    emailVerified: boolean;
    createdAt: string;
}

export interface Organization {
    id: string;
    name: string;
    slug: string;
    email: string;
    phone?: string | null;
    website?: string | null;
    logoUrl?: string | null;
    status: string;
}

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'LOST';
export type LeadSource =
    | 'WEBSITE'
    | 'REFERRAL'
    | 'SOCIAL_MEDIA'
    | 'EMAIL_CAMPAIGN'
    | 'COLD_CALL'
    | 'TRADE_SHOW'
    | 'OTHER';

export interface Lead {
    id: string;
    organizationId: string;
    assignedUserId: string | null;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    source: LeadSource;
    status: LeadStatus;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    assignedUser?: Partial<User> | null;
}

export interface Customer {
    id: string;
    organizationId: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
    city?: string;
    country?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CustomerStats {
    total: number;
    newThisMonth: number;
    withActiveDeals: number;
    totalCompanies: number;
}

export type DealStage = 'PROSPECT' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';

export interface Deal {
    id: string;
    organizationId: string;
    customerId: string;
    ownerId: string;
    title: string;
    value: string;
    stage: DealStage;
    expectedCloseDate: string | null;
    closedAt: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    customer: {
        id: string;
        firstName: string;
        lastName: string;
        company: string;
        email: string;
    };
    owner: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatarUrl: string | null;
    };
}

export interface PipelineStageStats {
    count: number;
    value: number;
}

export interface PipelineStats {
    pipeline: Record<DealStage, PipelineStageStats>;
    totalDeals: number;
    totalValue: number;
}

export type ActivityType = 'CALL' | 'EMAIL' | 'MEETING' | 'TASK';
export type ActivityStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface Activity {
    id: string;
    organizationId: string;
    userId: string;
    leadId: string | null;
    customerId: string | null;
    dealId: string | null;
    type: ActivityType;
    status: ActivityStatus;
    title: string;
    description: string | null;
    dueAt: string | null;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatarUrl: string | null;
    };
    lead: { id: string; firstName: string; lastName: string } | null;
    customer: {
        id: string;
        firstName: string;
        lastName: string;
        company: string;
        email: string;
    } | null;
    deal: { id: string; title: string } | null;
}

export interface ActivityStats {
    byStatus: {
        SCHEDULED: number;
        COMPLETED: number;
        CANCELLED: number;
        total: number;
    };
    byType: {
        CALL: number;
        EMAIL: number;
        MEETING: number;
        TASK: number;
        total: number;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface LoginResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
    organization: {
        id: string;
        name: string;
        slug: string;
        logoUrl: string | null;
    };
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
