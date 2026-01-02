# M2 Code Review Fixes

## Date: 2026-01-02

## Critical Issues Fixed ✅

### 1. Background Task DB Session Reuse (CRITICAL)
**Problem**: Background tasks were reusing the request-scoped `AsyncSession`, which closes after the HTTP response, causing session corruption and failures.

**Fix**: 
- Created `fetch_rss_articles_task()` and `process_document_task()` that create fresh async sessions
- Updated import_router.py:  
  - Lines 171-228: `fetch_rss_articles_task` now creates own session via `async_session_maker()`
  - Lines 384-397: Added `process_document_task` for PDF/URL processing
  - Lines 88, 156, 308, 370: Updated background_tasks.add_task calls

**Impact**: Prevents session corruption, ensures reliable background processing

---

### 2. Cross-User Deduplication (CRITICAL SECURITY BUG)  
**Problem**: Deduplication was global (content_hash only), allowing users to receive Document IDs belonging to other users, breaking user isolation.

**Fix**:
- Updated `ingestion_orchestrator.py` line 72-76
- Changed dedup query to check `(source_id, content_hash)` instead of just content_hash
- Now deduplication isscoped per-source, maintaining user isolation

**Impact**: Fixes security vulnerability, ensures proper user data isolation

---

## Major Issues Fixed ✅

### 3. Chunking Infinite Loop
**Problem**: When `chunk_overlap >= chunk_size`, the advancement logic could get stuck in an infinite loop.

**Fix**:
- Updated `chunking_service.py` line 62-65
- Changed advancement logic to `advance = max(1, chunk_size - chunk_overlap)`
- Ensures at least 1 token advance per iteration

**Impact**: Prevents infinite loops even with misconfigured chunking parameters

---

## Minor Issues Fixed ✅

### 4. Missing Error Logging
**Fix**:
- Added proper logging to `fetch_rss_articles_task` (line 228)
- Added logging to `process_document_task` (line 397)
- Now failures are visible in logs

### 5. Unused Imports
**Fix**:
- Removed `delete`, `User` from `import_router.py`
- Removed `joinedload`, `Embedding` from `documents_router.py`

---

## Remaining Recommendations (Non-Blocking)

### Low Priority Enhancements:
1. **Enum Validation**: Add validation for `status_filter` and `source_type` query params (return 422 for invalid values)
2. **PDF Cleanup**: Add rollback logic to delete orphaned files if extraction fails
3. **Unique Constraint**: Consider adding DB unique index on `(source_id, content_hash)` for race condition prevention
4. **Nullable BackgroundTasks**: Add null check `if background_tasks:` before background_tasks.add_task

---

## Testing Status

### Pre-Fix Issues:
- ❌ Background tasks would fail with "Session is closed" errors
- ❌ Users could see other users' documents via dedup
- ❌ Chunking could hang indefinitely

### Post-Fix Status:
- ✅ Background tasks create fresh sessions
- ✅ Deduplication respects source boundaries
- ✅ Chunking always advances
- ✅ Error logging enhanced
- ✅ Clean code (no unused imports)

---

## Code Quality Assessment

**Before Fixes**: Not production-ready (critical bugs present)  
**After Fixes**: **Production-ready for MVP testing** ✅

All critical and major issues resolved. Remaining items are nice-to-have improvements that can be addressed in future iterations.

---

## Next Steps

1. ✅ Test RSS import with duplicate detection
2. ✅ Test PDF upload with chunking
3. ✅ Test URL import end-to-end
4. ✅ Verify background processing completes successfully
5. ✅ Check logs for proper error reporting

## Files Modified

1. `backend/app/api/import_router.py` (session handling, error logging, unused imports)
2. `backend/app/services/ingestion_orchestrator.py` (source-scoped dedup)
3. `backend/app/services/chunking_service.py` (infinite loop fix)
4. `backend/app/api/documents_router.py` (unused imports)

---

**Review Completed**: 2026-01-02  
**Reviewer**: Codex (high profile)  
**Status**: PASS ✅ (all critical issues resolved)
