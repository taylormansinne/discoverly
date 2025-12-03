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
