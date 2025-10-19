-- Create table to track prompt usage and statistics
create table public.prompt_usage (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid references public.prompts(id) on delete cascade not null,
  user_id uuid not null,
  used_at timestamp with time zone default now() not null,
  success boolean default null,
  notes text
);

-- Enable RLS
alter table public.prompt_usage enable row level security;

-- RLS Policies
create policy "Users can view their own usage"
  on public.prompt_usage
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own usage"
  on public.prompt_usage
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own usage"
  on public.prompt_usage
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their own usage"
  on public.prompt_usage
  for delete
  using (auth.uid() = user_id);

create policy "Deny anonymous access to prompt_usage"
  on public.prompt_usage
  as restrictive
  for all
  using (false);

-- Create index for better performance
create index idx_prompt_usage_user_id on public.prompt_usage(user_id);
create index idx_prompt_usage_prompt_id on public.prompt_usage(prompt_id);
create index idx_prompt_usage_used_at on public.prompt_usage(used_at desc);