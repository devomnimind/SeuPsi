-- Habilita a extensão pgvector para trabalhar com embeddings
create extension if not exists vector;

-- Tabela para armazenar memórias e contexto da IA
create table if not exists memories (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users(id) not null,
  content text not null,
  embedding vector(384), -- 384 dimensões para o modelo all-MiniLM-L6-v2
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índice para busca rápida (IVFFlat)
-- Observação: Só é eficaz com muitos dados, mas deixamos preparado
create index if not exists memories_embedding_idx on memories 
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Função RPC para buscar memórias similares
create or replace function match_memories (
  query_embedding vector(384),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
returns table (
  id bigint,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    memories.id,
    memories.content,
    1 - (memories.embedding <=> query_embedding) as similarity
  from memories
  where 1 - (memories.embedding <=> query_embedding) > match_threshold
  and memories.user_id = p_user_id
  order by memories.embedding <=> query_embedding
  limit match_count;
end;
$$;

