export type FeatureStatus = 'exploring' | 'planned' | 'in-progress' | 'shipped';

export interface Feature {
  id: string;
  title: string;
  description?: string;
  status: FeatureStatus;
  createdAt: Date;
  updatedAt: Date;
}

export const FEATURE_STATUS_OPTIONS: { value: FeatureStatus; label: string }[] = [
  { value: 'exploring', label: 'Exploring' },
  { value: 'planned', label: 'Planned' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'shipped', label: 'Shipped' },
];
