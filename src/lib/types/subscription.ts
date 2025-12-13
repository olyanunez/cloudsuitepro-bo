export enum SubscriptionStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export enum PlanType {
  BASIC = 'BASIC',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

export interface Plan {
  id: number;
  code: string;
  name: string;
  type: PlanType;
  description?: string;
  monthlyPrice: number | string;
  quarterlyPrice?: number | string;
  yearlyPrice?: number | string;
  setupFee?: number | string;
  trialDays: number;

  // Resource Limits
  maxUsers: number | null;
  maxBranches: number | null;
  maxWarehouses: number | null;
  maxProducts: number | null;
  maxStorageGB?: number | null;
  maxNCFSequences?: number | null;

  // Features
  hasPOS: boolean;
  hasInventory: boolean;
  hasBasicReports: boolean;
  hasEmailSupport: boolean;
  hasBatchTracking: boolean;
  hasMultiBranch: boolean;
  hasMultiWarehouse: boolean;
  hasCreditNotes: boolean;
  hasPurchaseOrders: boolean;
  hasSuppliers: boolean;
  hasBasicAccounting: boolean;
  hasFullAccounting: boolean;
  hasCOGS: boolean;
  hasFinancialReports: boolean;
  hasAccountsPayable: boolean;
  hasNCF: boolean;
  hasAllNCFTypes: boolean;
  hasDGIIReports: boolean;
  hasAdvancedReports: boolean;
  hasExport: boolean;
  hasCustomReports: boolean;
  hasAPIAccess: boolean;
  hasWebhooks: boolean;

  // Support & Services
  supportLevel?: string;
  hasTraining?: boolean;
  hasConsulting?: boolean;

  isActive: boolean;
  isPublic?: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: number;
  tenantId: number;
  planId: number;
  plan: Plan;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  amount: number;

  // Trial
  trialEndDate: string | null;

  // Billing
  nextBillingDate: string | null;

  // PayPal
  paypalSubscriptionId: string | null;
  paypalPlanId: string | null;
  paypalStatus: string | null;
  paypalCustomerId: string | null;
  paypalSubscriberEmail: string | null;

  // Cached limits
  currentMaxUsers: number | null;
  currentMaxBranches: number | null;
  currentMaxWarehouses: number | null;
  currentMaxProducts: number | null;
  currentFeatures: Record<string, boolean> | null;

  // Dates
  startDate: string;
  endDate: string | null;
  cancelledAt: string | null;
  suspendedAt: string | null;
  lastActiveAt: string | null;

  // Cancellation
  cancelAtPeriodEnd: boolean;
  cancellationReason: string | null;

  // Payment tracking
  paymentFailedCount: number;

  createdAt: string;
  updatedAt: string;
}

export interface UsageStats {
  id?: number;
  subscriptionId?: number;
  activeUsers: number;
  activeBranches: number;
  activeWarehouses: number;
  activeProducts: number;
  recordedAt?: string;
  createdAt?: string;
  // Aliases para compatibilidad con la UI
  currentUsers?: number;
  currentBranches?: number;
  currentWarehouses?: number;
  currentProducts?: number;
}

export interface FeatureCheckResponse {
  hasAccess: boolean;
  feature: string;
}

export interface CreateSubscriptionDto {
  tenantId: number;
  planId: number;
  billingCycle: BillingCycle;
  userEmail?: string;
}

export interface ChangePlanDto {
  planId: number;
}

export interface CancelSubscriptionDto {
  reason?: string;
  immediate?: boolean;
}
