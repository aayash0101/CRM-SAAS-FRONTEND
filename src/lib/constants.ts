import type { LeadStatus, LeadSource, DealStage, ActivityType, ActivityStatus } from '@/types';

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  LOST: 'Lost',
};

export const LEAD_STATUS_VARIANTS: Record<LeadStatus, 'default' | 'info' | 'success' | 'danger' | 'warning' | 'neutral'> = {
  NEW: 'info',
  CONTACTED: 'warning',
  QUALIFIED: 'success',
  LOST: 'danger',
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  WEBSITE: 'Website',
  REFERRAL: 'Referral',
  SOCIAL_MEDIA: 'Social Media',
  EMAIL_CAMPAIGN: 'Email Campaign',
  COLD_CALL: 'Cold Call',
  TRADE_SHOW: 'Trade Show',
  OTHER: 'Other',
};

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  PROSPECT: 'Prospect',
  PROPOSAL: 'Proposal',
  NEGOTIATION: 'Negotiation',
  WON: 'Won',
  LOST: 'Lost',
};

export const DEAL_STAGE_VARIANTS: Record<DealStage, 'default' | 'info' | 'success' | 'danger' | 'warning' | 'neutral'> = {
  PROSPECT: 'neutral',
  PROPOSAL: 'info',
  NEGOTIATION: 'warning',
  WON: 'success',
  LOST: 'danger',
};

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  CALL: 'Call',
  EMAIL: 'Email',
  MEETING: 'Meeting',
  TASK: 'Task',
};

export const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
  SCHEDULED: 'Scheduled',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const ACTIVITY_STATUS_VARIANTS: Record<ActivityStatus, 'default' | 'info' | 'success' | 'danger' | 'warning' | 'neutral'> = {
  SCHEDULED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'neutral',
};