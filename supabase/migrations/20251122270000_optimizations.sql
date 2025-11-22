-- Otimizações e Melhorias de Performance
-- Baseado na Auditoria Técnica Forense

-- ===============================
-- 1. OTIMIZAÇÃO DE VERIFICAÇÃO DE CONTEÚDO
-- ===============================

-- Substituir loop procedural por query baseada em conjunto (Set-based)
-- Isso é significativamente mais rápido para o banco de dados processar
create or replace function check_critical_content(p_content text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_matched_keywords text[];
  v_max_risk text := 'low';
  v_risk_levels text[];
begin
  -- Busca única otimizada
  select 
    array_agg(keyword),
    array_agg(risk_level)
  into 
    v_matched_keywords,
    v_risk_levels
  from critical_keywords 
  where auto_flag = true 
  and lower(p_content) ~ lower(keyword); -- Regex match

  -- Se não houve matches, retornar early
  if v_matched_keywords is null then
    return jsonb_build_object(
      'has_critical_content', false,
      'matched_keywords', array[]::text[],
      'risk_level', 'low'
    );
  end if;

  -- Determinar risco máximo
  if 'critical' = any(v_risk_levels) then
    v_max_risk := 'critical';
  elsif 'high' = any(v_risk_levels) then
    v_max_risk := 'high';
  elsif 'moderate' = any(v_risk_levels) then
    v_max_risk := 'moderate';
  end if;
  
  return jsonb_build_object(
    'has_critical_content', true,
    'matched_keywords', v_matched_keywords,
    'risk_level', v_max_risk
  );
end;
$$;

-- ===============================
-- 2. ÍNDICES DE PERFORMANCE
-- ===============================

-- Índices para queries frequentes do Dashboard
create index if not exists idx_posts_user_created on posts(user_id, created_at desc);
create index if not exists idx_daily_challenges_date on daily_challenges(active_date);
create index if not exists idx_user_challenges_user on user_challenges(user_id);

-- ===============================
-- 3. FUNÇÃO DE PERMISSÕES (RBAC)
-- ===============================

-- Função auxiliar para verificar permissões no banco (usada por RLS ou Frontend via RPC)
create or replace function check_user_permission(p_permission text)
returns boolean
language plpgsql
security definer
as $$
declare
  v_role text;
begin
  select role into v_role from profiles where id = auth.uid();
  
  -- Admin tem acesso total
  if v_role = 'admin' then return true; end if;
  
  -- Mapeamento simples de permissões (pode ser expandido para tabela real)
  if p_permission = 'view_admin_panel' and v_role in ('admin', 'moderator') then return true; end if;
  if p_permission = 'delete_any_post' and v_role in ('admin', 'moderator') then return true; end if;
  if p_permission = 'manage_critical_keywords' and v_role in ('admin', 'moderator') then return true; end if;
  
  return false;
end;
$$;
