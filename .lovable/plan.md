

## Problem

When confidence is changed (e.g., from 3★ to 4★ during a review), the next review date is calculated as `addDays(new Date(), interval)` — counting from NOW. The user wants all review dates counted from the **original first-studied date** (`lastStudied`), with cumulative intervals based on the selected confidence level.

Additionally, several places (`useActivitySync`, `RevisionHub`) use `addDays(new Date(), ...)` instead of calculating from `lastStudied`.

## Solution

### 1. Add a helper to compute cumulative days from `lastStudied`

In `src/types/index.ts`, add a utility:

```typescript
export function getCumulativeDays(schedule: SpacedRepetitionSession[], sessionIndex: number): number {
  let total = 0;
  for (let i = 0; i <= sessionIndex && i < schedule.length; i++) {
    total += schedule[i].daysAfterPrevious;
  }
  return total;
}
```

### 2. Fix `setConfidence` in `TopicChecklist.tsx`

When confidence changes, calculate next review as:
```
nextRevisionDate = addDays(lastStudied, getCumulativeDays(newSchedule, currentSession))
```
Fall back to `addDays(new Date(), ...)` if `lastStudied` is missing.

### 3. Fix initial SR start in `TopicChecklist.tsx` (line 56-63)

When first marking a stage complete and auto-setting confidence to 3:
```
nextRevisionDate = addDays(new Date(), schedule[0].daysAfterPrevious)
lastStudied = new Date()
```
This is correct since `lastStudied` IS now. No change needed here.

### 4. Fix `useActivitySync.ts`

All three places that compute `nextRevisionDate` (lines 32-33, 89-91, 143-144) should use:
```
addDays(topic.lastStudied || new Date(), getCumulativeDays(schedule, nextSession))
```
But use the topic's confidence-appropriate schedule via `getScheduleForConfidence(topic.confidence)`.

### 5. Fix `startRevisionSchedule` and `completeRevision` in `useActivitySync.ts`

Same pattern — calculate from `lastStudied` using cumulative days.

### Files to modify
- `src/types/index.ts` — add `getCumulativeDays` helper
- `src/components/TopicChecklist.tsx` — fix `setConfidence`, `startRevisionSchedule`
- `src/hooks/useActivitySync.ts` — fix all `addDays` calls to use `lastStudied` + cumulative

