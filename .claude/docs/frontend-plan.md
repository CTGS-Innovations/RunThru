# Frontend Plan: Script Upload Feature

**Status**: Ready for Implementation
**Agent**: frontend-specialist
**Date**: 2025-10-23
**Estimated Time**: 2.5 hours

---

## What to Build

### 1. ScriptUploader Component (`src/components/script/ScriptUploader.tsx`)
- Dialog-based modal (shadcn/ui)
- Two upload methods: drag-and-drop OR paste markdown
- Validation: file size < 5MB, .md/.txt only
- Loading states + success/error toasts

### 2. ScriptCard Component (`src/components/script/ScriptCard.tsx`)
- Card layout with metadata (title, character count, date)
- Actions: Open, Delete (with confirmation)
- Hover effects (amber border)

### 3. ScriptLibrary Page (`src/app/scripts/page.tsx`)
- Grid layout (responsive: 1/2/3 columns)
- Empty state: "Upload your first script"
- Loading skeletons
- "Upload Script" button (top-right)

### 4. Custom Hooks (`src/hooks/useScripts.ts`)
- `useScripts()` - GET /api/scripts
- `useUploadScript()` - POST /api/scripts
- `useDeleteScript()` - DELETE /api/scripts/:id
- Uses React Query for caching

---

## Installation

```bash
cd /home/corey/projects/RunThru-frontend
npm install @tanstack/react-query
npx shadcn@latest add dialog card button input textarea toast dropdown-menu alert-dialog skeleton
```

---

## API Integration

**Backend runs on**: `http://localhost:4000`

**Endpoints**:
- POST /api/scripts → Body: `{ markdown: string }`
- GET /api/scripts → Returns: `{ scripts: Script[] }`
- DELETE /api/scripts/:id → Returns: `{ success: true }`

**Note**: Backend API routes need implementation (currently TODOs)

---

## Success Criteria
- ✓ Upload via drag-and-drop
- ✓ Upload via paste
- ✓ Scripts appear in library
- ✓ Delete with confirmation
- ✓ Dark mode styling
- ✓ Mobile responsive

---

## Implementation Sequence
1. Setup (15min): Install deps, create dirs
2. Hooks (20min): useScripts, useUploadScript, useDeleteScript
3. ScriptCard (30min): Component + delete logic
4. ScriptUploader (45min): Dialog + validation
5. Library Page (30min): Grid + empty state
6. Testing (30min): Manual + mobile

**Total**: ~2.5 hours

---

**Full details**: See agent output above for complete specifications, code examples, and accessibility requirements.
