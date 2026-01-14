-- Create the update_updated_at_column function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for user scoring preferences
CREATE TABLE public.user_scoring_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  votes_weight NUMERIC NOT NULL DEFAULT 0.30,
  importance_weight NUMERIC NOT NULL DEFAULT 0.25,
  alignment_weight NUMERIC NOT NULL DEFAULT 0.25,
  cost_weight NUMERIC NOT NULL DEFAULT 0.20,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT weights_sum_to_one CHECK (votes_weight + importance_weight + alignment_weight + cost_weight = 1.0),
  CONSTRAINT unique_user_preferences UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.user_scoring_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view their own preferences"
ON public.user_scoring_preferences
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own preferences
CREATE POLICY "Users can create their own preferences"
ON public.user_scoring_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update their own preferences"
ON public.user_scoring_preferences
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_scoring_preferences_updated_at
BEFORE UPDATE ON public.user_scoring_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();