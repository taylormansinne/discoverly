import { FeedbackItem } from '@/types/feedback';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

interface FeedbackAnalyticsProps {
  items: FeedbackItem[];
}

const THEME_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(220 70% 50%)',
  'hsl(280 70% 50%)',
  'hsl(320 70% 50%)',
  'hsl(40 70% 50%)',
  'hsl(160 70% 50%)',
];

const IMPORTANCE_COLORS = {
  critical: 'hsl(var(--importance-critical))',
  high: 'hsl(var(--importance-high))',
  medium: 'hsl(var(--importance-medium))',
  low: 'hsl(var(--importance-low))',
};

const COST_COLORS = {
  low: 'hsl(var(--success))',
  medium: 'hsl(var(--warning))',
  high: 'hsl(var(--importance-high))',
  'very-high': 'hsl(var(--importance-critical))',
};

const costLabels: Record<string, string> = {
  low: '< 1 week',
  medium: '1-4 weeks',
  high: '1-3 months',
  'very-high': '3+ months',
};

export function FeedbackAnalytics({ items }: FeedbackAnalyticsProps) {
  if (items.length === 0) {
    return null;
  }

  // Theme distribution
  const themeData = Object.entries(
    items.reduce((acc, item) => {
      acc[item.theme] = (acc[item.theme] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Importance distribution
  const importanceOrder = ['critical', 'high', 'medium', 'low'];
  const importanceData = importanceOrder.map(importance => ({
    name: importance.charAt(0).toUpperCase() + importance.slice(1),
    value: items.filter(i => i.importance === importance).length,
    fill: IMPORTANCE_COLORS[importance as keyof typeof IMPORTANCE_COLORS],
  })).filter(d => d.value > 0);

  // Cost distribution
  const costOrder = ['low', 'medium', 'high', 'very-high'];
  const costData = costOrder.map(cost => ({
    name: costLabels[cost],
    value: items.filter(i => i.costEstimate === cost).length,
    fill: COST_COLORS[cost as keyof typeof COST_COLORS],
  })).filter(d => d.value > 0);

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <PieIcon className="w-5 h-5 text-primary" />
          Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Distribution - Pie Chart */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">By Theme</h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={themeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {themeData.map((_, index) => (
                    <Cell key={`theme-${index}`} fill={THEME_COLORS[index % THEME_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Importance Distribution - Bar Chart */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">By Importance</h4>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={importanceData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {importanceData.map((entry, index) => (
                    <Cell key={`importance-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Distribution - Bar Chart */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">By Cost</h4>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {costData.map((entry, index) => (
                    <Cell key={`cost-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
