-- Durcissement des policies profiles : public → authenticated
-- Réduit la surface d'attaque et améliore la lisibilité

-- 1. Policy SELECT : Users can view only their own profile
DROP POLICY IF EXISTS "Users can view only their own profile" ON public.profiles;

CREATE POLICY "Users can view only their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 2. Policy UPDATE : Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);