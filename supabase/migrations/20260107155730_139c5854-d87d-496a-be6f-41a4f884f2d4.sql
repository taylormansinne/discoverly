-- Create features table for feature ideas
CREATE TABLE public.features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'exploring',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

-- RLS policies for features
CREATE POLICY "Anyone can read features" ON public.features FOR SELECT USING (true);
CREATE POLICY "Anyone can insert features" ON public.features FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update features" ON public.features FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete features" ON public.features FOR DELETE USING (true);

-- Add feature_id column to feedback_items for clustering
ALTER TABLE public.feedback_items ADD COLUMN feature_id UUID REFERENCES public.features(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_feedback_items_feature_id ON public.feedback_items(feature_id);

-- Trigger for updated_at on features
CREATE OR REPLACE FUNCTION public.update_features_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_features_updated_at
  BEFORE UPDATE ON public.features
  FOR EACH ROW
  EXECUTE FUNCTION public.update_features_updated_at();