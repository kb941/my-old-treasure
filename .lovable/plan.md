

# Rebuild NEET PG Ace (Plan OS) from GitHub Repository

## What This App Is

Your old project is a comprehensive NEET PG exam preparation study app called "Plan OS" with these major features:

- **Login page** -- simple name-based login stored in localStorage
- **Today tab** -- stats bar, MCQ tracking, revision reminders, Kanban task board, focus mode launcher
- **Subjects tab** -- PYQ summary, syllabus progress, topic search, subject details with chapter/topic tracking
- **Revision tab** -- spaced repetition hub with scheduled revision tracking
- **PYQs tab** -- previous year question tracker across exams (NEET PG, INICET, FMGE)
- **Analytics tab** -- mock test analytics, MCQ charts, content progress, achievements, exam readiness
- **Modals** -- QuickLog (study sessions), MockTest logging, Profile settings, Focus Mode (Pomodoro timer)
- **Dark/light theme toggle**, PWA support, mobile-first bottom navigation

## Rebuild Approach

Since Lovable cannot import a GitHub repo directly, I will rebuild the entire app file-by-file by fetching each source file from your public GitHub repo and recreating it in this project. The work is broken into phases:

### Phase 1: Foundation
1. Update **package.json** -- add `framer-motion`, `@fontsource/dm-sans`, `vite-plugin-pwa`
2. Replace **index.css** with your custom theme (light/dark CSS variables, gradients, glass effects, custom scrollbar)
3. Update **tailwind.config.ts** with your custom font family and extended theme
4. Create **src/types/index.ts** -- all TypeScript interfaces (Subject, Task, Topic, Chapter, MockTest, etc.)
5. Create **src/data/subjects.ts** and **src/data/syllabusChapters.ts** -- initial data

### Phase 2: Hooks
6. Create **src/hooks/useLocalStorage.ts**
7. Create **src/hooks/useActivitySync.ts**
8. Create **src/hooks/useRevisionReminders.ts**

### Phase 3: Components (30+ files)
Each component fetched from GitHub and recreated:
- StatsBar, StatDetailPanel
- KanbanBoard, TaskCard, TaskItem, AddTaskModal
- SubjectCard, SubjectDetails, TopicChecklist
- BottomNav, ThemeToggle, TopicSearch
- QuickLogModal, MockTestModal, MockAnalytics
- ProfileModal, FocusMode, StudyTimer
- WeeklyStats, AdvancedAnalytics
- ContentProgressDashboard, SyllabusProgressCard
- PYQTracker, PYQAccuracyTrends, PYQSummaryCard
- RevisionHub, RevisionCalendar, RevisionReminders
- AchievementBadge, AchievementsBadgePanel, AchievementsDetailView
- McqWeeklyChart

### Phase 4: Pages & Routing
9. Create **src/pages/Login.tsx**
10. Rebuild **src/pages/Index.tsx** (the main 640-line dashboard)
11. Update **src/App.tsx** with ProtectedRoute and login routing

### Phase 5: PWA (optional)
12. Add service worker and manifest config if desired

## Technical Notes

- All data is stored in **localStorage** (no backend/database)
- Uses **framer-motion** for animations (needs to be added as dependency)
- Uses **recharts** for charts (already installed)
- Mobile-first design with bottom tab navigation
- Dark mode is default, toggle available
- The app has ~30 custom components totaling several thousand lines of code
- This will require multiple implementation steps due to the volume of files

## Estimated Scope

This is a large rebuild -- approximately 35-40 files to create/modify. I will implement it systematically, fetching each file from your GitHub repo to ensure an exact recreation.

