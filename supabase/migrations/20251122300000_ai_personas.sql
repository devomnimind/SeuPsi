-- Adicionar coluna de modo terapêutico na tabela de sessões
-- Valores possíveis: 'tcc', 'psicanalise', 'gestalt', 'psicodrama'

alter table ai_chat_sessions 
add column therapy_mode text default 'tcc' check (therapy_mode in ('tcc', 'psicanalise', 'gestalt', 'psicodrama'));

-- Atualizar sessões existentes para TCC (padrão)
update ai_chat_sessions set therapy_mode = 'tcc' where therapy_mode is null;
