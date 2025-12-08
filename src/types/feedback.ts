export type Importance = 'critical' | 'high' | 'medium' | 'low';
export type BusinessAlignment = 1 | 2 | 3 | 4 | 5;
export type CostEstimate = 'low' | 'medium' | 'high' | 'very-high';

export interface FeedbackItem {
  id: string;
  content: string;
  theme: string;
  importance: Importance;
  businessAlignment: BusinessAlignment;
  costEstimate: CostEstimate;
  createdAt: Date;
  source?: string;
  proposalLink?: string;
  persona?: string;
  productArea?: string;
}

export const THEMES = [
  'UX/UI',
  'Performance',
  'Feature Request',
  'Bug Report',
  'Pricing',
  'Onboarding',
  'Documentation',
  'Support',
  'Integration',
  'Security',
  'Other'
] as const;

export const PERSONAS = [
  'Power User',
  'New User',
  'Enterprise Admin',
  'Developer',
  'Small Business Owner',
  'Casual User',
  'Technical Lead',
  'Product Manager',
  'Other'
] as const;

export const PRODUCT_AREAS = [
  'Dashboard',
  'Reports',
  'Settings',
  'Authentication',
  'API',
  'Mobile App',
  'Notifications',
  'Billing',
  'Integrations',
  'Search',
  'Other'
] as const;

export const IMPORTANCE_OPTIONS: { value: Importance; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' }
];

export const COST_OPTIONS: { value: CostEstimate; label: string; description: string }[] = [
  { value: 'low', label: 'Low', description: '< 1 week' },
  { value: 'medium', label: 'Medium', description: '1-4 weeks' },
  { value: 'high', label: 'High', description: '1-3 months' },
  { value: 'very-high', label: 'Very High', description: '3+ months' }
];

export const SOURCE_OPTIONS = [
  'Jira',
  'Zendesk',
  'Intercom',
  'Slack',
  'Survey',
  'Customer Interview',
  'Support Ticket',
  'Other'
] as const;
