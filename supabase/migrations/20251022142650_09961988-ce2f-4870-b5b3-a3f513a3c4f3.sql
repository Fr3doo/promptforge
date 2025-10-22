-- Create a secure function to find user ID by email for sharing purposes
-- This function uses SECURITY DEFINER to bypass RLS while only exposing minimal data
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(user_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_user_id UUID;
BEGIN
  -- Only return the user ID, nothing else
  SELECT id INTO found_user_id
  FROM public.profiles
  WHERE email = user_email
  LIMIT 1;
  
  RETURN found_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(TEXT) TO authenticated;