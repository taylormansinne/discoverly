-- Features: drop open write policies, keep public read, restrict writes to authenticated
DROP POLICY IF EXISTS "Anyone can insert features" ON public.features;
DROP POLICY IF EXISTS "Anyone can update features" ON public.features;
DROP POLICY IF EXISTS "Anyone can delete features" ON public.features;

CREATE POLICY "Authenticated users can insert features"
ON public.features FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update features"
ON public.features FOR UPDATE TO authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete features"
ON public.features FOR DELETE TO authenticated
USING (true);

-- Feedback items: drop open write policies, keep public read, restrict writes to authenticated
DROP POLICY IF EXISTS "Anyone can insert feedback" ON public.feedback_items;
DROP POLICY IF EXISTS "Anyone can update feedback" ON public.feedback_items;
DROP POLICY IF EXISTS "Anyone can delete feedback" ON public.feedback_items;

CREATE POLICY "Authenticated users can insert feedback"
ON public.feedback_items FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update feedback"
ON public.feedback_items FOR UPDATE TO authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete feedback"
ON public.feedback_items FOR DELETE TO authenticated
USING (true);