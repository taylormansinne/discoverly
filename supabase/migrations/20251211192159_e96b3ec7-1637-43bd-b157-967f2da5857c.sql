-- Add status column to feedback_items for roadmap tracking
ALTER TABLE public.feedback_items 
ADD COLUMN status text NOT NULL DEFAULT 'idea' 
CHECK (status IN ('idea', 'planned', 'released'));

-- Create votes table to track user votes
CREATE TABLE public.feedback_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id uuid NOT NULL REFERENCES public.feedback_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type integer NOT NULL CHECK (vote_type IN (-1, 1)),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(feedback_id, user_id)
);

-- Enable RLS on votes table
ALTER TABLE public.feedback_votes ENABLE ROW LEVEL SECURITY;

-- Users can view all votes (to show counts)
CREATE POLICY "Anyone can view votes"
ON public.feedback_votes
FOR SELECT
USING (true);

-- Authenticated users can insert their own votes
CREATE POLICY "Authenticated users can vote"
ON public.feedback_votes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own votes
CREATE POLICY "Users can update own votes"
ON public.feedback_votes
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete own votes"
ON public.feedback_votes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create index for faster vote lookups
CREATE INDEX idx_feedback_votes_feedback_id ON public.feedback_votes(feedback_id);
CREATE INDEX idx_feedback_votes_user_id ON public.feedback_votes(user_id);