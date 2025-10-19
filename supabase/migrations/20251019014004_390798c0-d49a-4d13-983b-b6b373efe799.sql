-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE public.visibility AS ENUM ('PRIVATE', 'SHARED');
CREATE TYPE public.var_type AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'ENUM', 'DATE', 'MULTISTRING');
CREATE TYPE public.app_role AS ENUM ('USER', 'ADMIN');

-- Users table extension (profiles)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  image TEXT,
  role public.app_role DEFAULT 'USER',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Prompts table
CREATE TABLE public.prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  visibility public.visibility DEFAULT 'PRIVATE',
  version TEXT DEFAULT '1.0.0',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prompts and shared prompts"
  ON public.prompts FOR SELECT
  USING (auth.uid() = owner_id OR visibility = 'SHARED');

CREATE POLICY "Users can create their own prompts"
  ON public.prompts FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own prompts"
  ON public.prompts FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own prompts"
  ON public.prompts FOR DELETE
  USING (auth.uid() = owner_id);

-- Variables table
CREATE TABLE public.variables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type public.var_type DEFAULT 'STRING',
  required BOOLEAN DEFAULT FALSE,
  default_value TEXT,
  options TEXT[],
  help TEXT,
  pattern TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.variables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Variables inherit prompt permissions for select"
  ON public.variables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.prompts 
      WHERE prompts.id = variables.prompt_id 
      AND (prompts.owner_id = auth.uid() OR prompts.visibility = 'SHARED')
    )
  );

CREATE POLICY "Users can manage variables for their prompts"
  ON public.variables FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.prompts 
      WHERE prompts.id = variables.prompt_id 
      AND prompts.owner_id = auth.uid()
    )
  );

-- Variable Sets table
CREATE TABLE public.variable_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  values JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.variable_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Variable sets inherit prompt permissions for select"
  ON public.variable_sets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.prompts 
      WHERE prompts.id = variable_sets.prompt_id 
      AND (prompts.owner_id = auth.uid() OR prompts.visibility = 'SHARED')
    )
  );

CREATE POLICY "Users can manage variable sets for their prompts"
  ON public.variable_sets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.prompts 
      WHERE prompts.id = variable_sets.prompt_id 
      AND prompts.owner_id = auth.uid()
    )
  );

-- Versions table
CREATE TABLE public.versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  semver TEXT NOT NULL,
  message TEXT,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Versions inherit prompt permissions"
  ON public.versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.prompts 
      WHERE prompts.id = versions.prompt_id 
      AND (prompts.owner_id = auth.uid() OR prompts.visibility = 'SHARED')
    )
  );

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON public.prompts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
