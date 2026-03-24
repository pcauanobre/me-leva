# Me Leva

## What This Is

Plataforma web de adocao de animais para uma protetora independente em Fortaleza. Funciona como um catalogo publico de pets disponiveis, com painel administrativo privado para gerenciar cadastros, fotos e formularios de interesse recebidos. Substitui a divulgacao fragmentada via Instagram por um canal proprio e organizado.

## Core Value

Conectar animais resgatados a adotantes de forma organizada, com autonomia total da protetora — sem depender de redes sociais.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Listagem publica de animais com cards (foto, nome, especie, status)
- [ ] Filtros de busca (especie, porte, idade, status)
- [ ] Perfil individual do animal com galeria de fotos e dados completos
- [ ] Formulario de interesse (nome, telefone, mensagem) sem cadastro
- [ ] Protecao honeypot contra spam nos formularios
- [ ] Login admin com Supabase Auth (email + senha)
- [ ] Cadastro de animais pelo admin (nome, especie, raca, idade, porte, sexo, castrado, vacinado, descricao)
- [ ] Upload de ate 5 fotos por animal via Supabase Storage
- [ ] Gerenciamento de status (Disponivel, Urgente, Adotado)
- [ ] Remocao automatica de animais adotados da listagem publica
- [ ] Visualizacao de formularios de interesse por animal no admin
- [ ] Pagina institucional "Sobre"
- [ ] Pagina de Politica de Privacidade (LGPD)
- [ ] HTTPS via Vercel + Row Level Security no Supabase

### Out of Scope

- Chat interno entre adotante e ONG — complexidade alta, MVP usa formulario
- Notificacoes por email — deferido para Fase 2
- Cadastro de usuario publico — MVP nao exige conta para adotantes
- Kanban visual de adocao — Fase 2
- Integracao com Instagram — Fase 2
- Rastreamento de comportamento suspeito — Fase 2
- App mobile — web-first
- OAuth/login social — email+senha suficiente para admin no MVP

## Context

- A protetora atualmente divulga apenas via Instagram, sem controle de interessados
- Numero de WhatsApp da protetora nunca exposto no site publico (seguranca)
- Fluxo: visitante acessa site > ve animais > abre perfil > preenche formulario > protetora ve no admin > contata adotante offline
- Cor base da identidade visual: roxo/rosa
- Referencia de inspiracao: viumeupet.com.br e Gankey (interface)
- Projeto real para uma protetora independente de Fortaleza

## Constraints

- **Stack**: Next.js + Supabase (PostgreSQL, Auth, Storage) + Vercel — decisao da equipe
- **Timeline**: MVP em ~3 semanas
- **Budget**: Zero — usando tiers gratuitos de Supabase e Vercel
- **LGPD**: Obrigatorio ter politica de privacidade por coletar dados pessoais
- **Seguranca**: RLS no banco, honeypot nos formularios, HTTPS, numero da protetora nunca publico

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js (React) como framework | SSR para SEO + admin no mesmo projeto | — Pending |
| Supabase como backend | Auth, Storage, PostgreSQL e RLS gratuitos | — Pending |
| Formulario sem cadastro | Reduz friccao para adotantes, MVP simples | — Pending |
| Honeypot ao inves de captcha visivel | Melhor UX, invisivel para usuario | — Pending |
| WhatsApp nunca exposto no site | Pedido da cliente, evitar spam | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-24 after initialization*
