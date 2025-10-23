# TypeScript TODO List

## Supabase Type Issues

### Server Routes - Insert/Update Operations

**Files affected:**
- `server/routes/timbrature/postManual.ts:147`
- `server/routes/timbrature/postTimbratura.ts:134`
- `server/routes/timbrature/updateTimbratura.ts:61`

**Issue:** Supabase client types are too restrictive, causing `never` type conflicts with our DTO objects.

**Current workaround:**
```typescript
// TODO(ts): replace with exact Supabase types
.insert([dto as any])
.update(patch as any)
```

**Proper solution:** 
1. Update Supabase client to latest version with better type inference
2. Generate proper database types with `supabase gen types typescript`
3. Use proper generic typing: `.from<'timbrature', TimbratureInsert>('timbrature')`

**Priority:** Medium - functionality works, only type safety is compromised
