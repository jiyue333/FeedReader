# AnkiFlow Implementation Plan

## Phase 1: Foundation
- Project setup: Next.js + FastAPI skeleton, env config, linting.
- Database setup: PostgreSQL + pgvector, migration tooling.
- Auth baseline: user model, password hashing, session/JWT handling.
- TDD: migration tests for schema + auth API contract tests.

## Phase 2: Backend Core
- Ingestion: RSS fetcher, PDF upload + text extraction pipeline.
- Article storage: content parsing, tagging, embedding generation.
- Search API: hybrid search endpoint with local + optional web.
- Staging API: CRUD + selection state.
- TDD: API tests for feeds, articles, search, staging.

## Phase 3: Frontend Core
- UI shell: layout, top bar, left/right sidebars.
- Dashboard: feed list, filter box, article list, staging dock.
- Reader: content rendering, TOC, pin to staging.
- TDD: component tests for staging interactions and routing.

## Phase 4: Intelligence
- LLM integration: synthesis prompt, SSE streaming endpoint.
- RAG assembly: selected staging items -> context pack.
- Anchor generation: quote + offset selectors, store in DB.
- Anchor jump: highlight/scroll in Reader.
- TDD: synthesis stream tests, anchor resolution tests.

## Phase 5: Polish & Ship
- E2E: Dashboard -> Staging -> Synthesis -> Anchor jump flow.
- UI refinement: dark theme, motion polish, accessibility pass.
- Observability: logs, basic metrics, error handling.
- Release checklist: data migration, seed sample feeds, deploy guide.
