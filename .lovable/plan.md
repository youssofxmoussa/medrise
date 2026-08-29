# Routing & Performance Repair Plan

## Goal
Give every screen a clear route, prevent the old page from lingering after the URL changes, keep the demo session alive until logout, and speed up opening tabs and courses without changing the current design.

## What we confirmed
- Sign-in currently waits 1.2s then 350ms more; after the URL changes to `/courses`, the sign-in screen stays visible while the page chunk loads. Real test reached Courses after ~2.7s.
- Moving from `/courses` to `/me` changes the URL first, then keeps Courses visible briefly.
- The tab wrapper animates the whole `<Outlet />` by pathname, and `AnimatePresence` warns about multiple children with `mode="wait"`, causing broken transitions.
- `CourseCard` imports four full icon libraries even though current courses use images, delaying first Courses load.
- The subject page is one large file that loads the video player, video logic, PDF, and quiz together.
- Current video and PDF sources rely on broken external links, while stable video/PDF assets exist inside the project.

## Implementation

### 1. Separate login and session
- Move the login UI from `/` to a dedicated `/login` page, keeping its current look.
- Make `/` a lightweight redirect: signed-in users go to `/courses`, guests go to `/login`.
- Create a central demo session state, persisted on the device, instead of keeping success state trapped inside the login component.
- Protect the `_tabs` route group: opening any internal route without a session redirects to `/login`, and opening `/login` while a session exists redirects straight to `/courses`.
- Logout clears the session and navigates to `/login` with `replace`, so the back button does not return to a protected page.
- Remove success timers and forced reloads; after verification passes, save the session and perform one immediate router transition.

### 2. Fix old-page lingering during navigation
- Remove the motion wrapper tied to `pathname` around `<Outlet />`; TanStack will render the matched page directly instead of keeping the previous page while the next loads.
- Keep light entrance animations inside pages only, and fix `AnimatePresence` usage in the Courses list so `mode="wait"` does not apply to multiple children.
- Enable preloading for Courses, Learning, and Me from the tab bar so they are ready before tapping.

### 3. Reduce bundle size
- Remove full `react-icons` imports from `CourseCard` and use the existing subject images, avoiding large icon downloads on first Courses load.
- Split the large subject page into a shared shell and independent child pages for video, PDF, and quiz, keeping `/subject/:courseId` as the default video page with clear links to the other content.
- Load the video player and PDF viewer only when their own page is opened, not when opening any part of the subject.

### 4. Fix subject media
- Replace external video/PDF links with the managed assets already inside the project.
- Stop relying on the external PDF proxy that returns 502, while keeping the error state and retry button.
- Keep the video at `preload="metadata"` so opening the subject page is not delayed by downloading the whole file.

## Validation
- Test: correct login → `/courses` and Subjects content appears immediately without "Signed in" lingering.
- Test: refresh page and open `/login` while session exists → returns to `/courses`; then logout → `/login` and back does not return to protected content.
- Test rapid switching between Courses, Learning, and Me, confirming title and content match the URL immediately and no AnimatePresence warnings appear.
- Test opening a subject and navigating between Video, PDF, and Quiz, confirming each route is independent and media files do not load before needed.
- Test PDF and video errors and retry, then check mobile, desktop, and runtime error logs.

## Scope assumption
The current demo login stays the same with its existing credentials; this task fixes session, routing, and performance, not real accounts or a database.
