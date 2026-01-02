# AnkiFlow Requirements (MVP -> Dev Requirements)

## User Stories
- As a knowledge worker, I want to search both my local library and the web in one query, so that I can compare sources without switching tools.
- As a reader, I want to pin articles into a persistent staging dock, so that I can resume my research later without losing context.
- As a researcher, I want to select only the staged items I trust before synthesis, so that the Takeaway is based on curated sources.
- As a user, I want a generated Takeaway to have a global ID like `#TK-0001`, so that I can reference it reliably across tools.
- As a user, I want each Takeaway to link back to exact paragraphs in the source, so that I can verify claims quickly.
- As a user, I want to see which Takeaways reference the current article, so that I can revisit related insights.
- As a user, I want a simple login so that my staging items and Takeaways are tied to my account, so that my workspace is consistent.
- As a user, I want to import RSS feeds and PDFs, so that my knowledge base grows automatically and manually.

## Functional Requirements

### P0 (MVP Core)
1. Hybrid Retrieval
   - Support local knowledge base search plus optional web search toggle.
   - AI responses must label sources as `[Local]` or `[Web]`.
2. Persistent Staging
   - Staging items are stored in the database and persist across sessions.
   - Users can add/remove items and select/deselect items for synthesis.
3. Takeaway Generation
   - Generate a structured Takeaway from selected staging items.
   - Takeaway ID is globally auto-incremented (e.g., `#TK-0001`).
4. Anchor Jump
   - Each cited claim in a Takeaway links to an anchor in the source article.
   - Clicking a citation scrolls and highlights the referenced paragraph.
5. Bidirectional Linking
   - Takeaway includes source links; article detail shows linked Takeaways.

### P1 (Post-MVP)
1. Simple User System
   - Basic signup/login, account-scoped data, and session management.
2. RSS/PDF Import
   - RSS feed ingestion with scheduled updates.
   - PDF upload and text extraction into the knowledge base.

## UI Requirements (Core Pages)

### Dashboard
- Top bar shows logo, global search, import, and user avatar.
- Left sidebar split: feed list (top) and staging dock (bottom).
- Staging dock header includes count, select-all, and prominent `Generate Takeaway` button.
- Main feed stream supports filter box (tags, unread, starred, PDF only) with extension slot.
- Right AI panel is hidden by default.

### Reader Workbench
- Compact top bar, minimized visual distraction.
- Article header includes breadcrumb path (left) and actions (pin, graph, more).
- Left sidebar shows TOC (top) and staging dock (bottom).
- Right sidebar defaults to Notes tab; AI tab is secondary.
- Clicking a citation in Takeaway highlights and scrolls to the anchor in the article.

### Synthesis Modal
- Large overlay modal with blur background.
- Header shows Takeaway ID, action buttons (copy/save), and extension slot.
- Editor shows AI-generated Markdown; references listed at the bottom.
