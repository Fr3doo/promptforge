-- Security Fix 1: Add explicit anonymous access denial policies
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR ALL
TO anon
USING (false);

CREATE POLICY "Deny anonymous access to prompts"
ON public.prompts
FOR ALL
TO anon
USING (false);

CREATE POLICY "Deny anonymous access to variables"
ON public.variables
FOR ALL
TO anon
USING (false);

CREATE POLICY "Deny anonymous access to variable_sets"
ON public.variable_sets
FOR ALL
TO anon
USING (false);

CREATE POLICY "Deny anonymous access to versions"
ON public.versions
FOR ALL
TO anon
USING (false);

-- Security Fix 3: Refactor roles to separate table
-- 1. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 3. Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role, assigned_at)
SELECT id, role, created_at
FROM public.profiles
WHERE role IS NOT NULL;

-- 4. RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'ADMIN'));

-- 5. Drop role column from profiles
ALTER TABLE public.profiles DROP COLUMN role;

-- 6. Update profiles UPDATE policy to prevent any escalation attempts
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);