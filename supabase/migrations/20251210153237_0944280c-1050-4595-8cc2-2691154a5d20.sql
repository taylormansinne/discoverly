-- Create feedback_items table
CREATE TABLE public.feedback_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'Other',
  importance TEXT NOT NULL DEFAULT 'medium',
  business_alignment INTEGER NOT NULL DEFAULT 3,
  cost_estimate TEXT NOT NULL DEFAULT 'medium',
  source TEXT,
  proposal_link TEXT,
  persona TEXT,
  product_area TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (but allow public read/write for extension)
ALTER TABLE public.feedback_items ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert feedback (for extension)
CREATE POLICY "Anyone can insert feedback" 
ON public.feedback_items 
FOR INSERT 
WITH CHECK (true);

-- Policy: Allow anyone to read feedback
CREATE POLICY "Anyone can read feedback" 
ON public.feedback_items 
FOR SELECT 
USING (true);

-- Policy: Allow anyone to update feedback
CREATE POLICY "Anyone can update feedback" 
ON public.feedback_items 
FOR UPDATE 
USING (true);

-- Policy: Allow anyone to delete feedback
CREATE POLICY "Anyone can delete feedback" 
ON public.feedback_items 
FOR DELETE 
USING (true);