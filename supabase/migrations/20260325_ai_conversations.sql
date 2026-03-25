create table if not exists public.conversations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null default 'New conversation',
  created_at  timestamptz not null default now()
);

create table if not exists public.messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations(id) on delete cascade,
  role             text not null check (role in ('user', 'assistant', 'system')),
  content          text not null,
  tokens_used      integer default 0,
  created_at       timestamptz not null default now()
);

-- RLS
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "Users see own conversations"
  on public.conversations for all using (auth.uid() = user_id);

create policy "Users see messages in own conversations"
  on public.messages for all using (
    exists (
      select 1 from public.conversations
      where id = messages.conversation_id and user_id = auth.uid()
    )
  );
