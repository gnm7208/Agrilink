## AgriLink Phase 5 Roadmap

### Product Vision
Build a mobile-first agricultural super app that centralizes trusted knowledge, fosters expert-farmer collaboration, and enables community-led problem solving through posts, messaging, and communities—delivering fast, reliable insights for smallholder and commercial farmers.

### Team Roles & Responsibilities (4-person squad)
- **Scrum Master**: Facilitate ceremonies, remove impediments, maintain delivery cadence, track risks.
- **Backend Engineer**: Design/implement Flask APIs, PostgreSQL schema, integrations, auth, performance/security hardening.
- **Frontend Engineer**: Implement React UI from Figma wireframes, Redux Toolkit state, UX polish, accessibility.
- **QA / UI-UX Engineer**: Test plans (Jest/Minitests coordination), exploratory and regression testing, design QA, usability feedback.

### Definition of Done
- User stories accepted by Product Owner; ACs met.
- Code merged to main with peer review.
- Automated tests added/updated and passing (Jest frontend, Minitests backend).
- No critical/severe bugs open; linting/build passes.
- API/documentation updated; feature flags/config noted.
- Deployed to staging with validation notes recorded.

### Sprint 0 — Planning & Setup 
- **Goal**: Establish project foundations, environments, and team rituals.
- **Key Deliverables**:
  - Repository scaffold: Flask backend, React + Redux Toolkit frontend.
  - Environments: Dev/staging configs, PostgreSQL schema bootstrap, .env templates.
  - CI sanity checks: lint/test smoke for frontend (Jest) and backend (Minitests).
  - Figma mobile-first wireframe review; story breakdown and backlog grooming.
  - Team cadence set (standups, planning, retro); risk register initialized.

### Sprint 1 — Core Auth & Profiles 
- **Goal**: Enable secure onboarding and profile presence.
- **Key Deliverables**:
  - Auth flows: register, login, session management; password hashing; JWT/secure cookies.
  - User profile CRUD (view/update); basic avatar support.
  - Backend: user model, migrations, validation, error handling.
  - Frontend: auth screens, profile screens; Redux slices for auth/user; guarded routes.
  - Tests: Jest component/flow tests for auth/profile; Minitests for auth/profile endpoints.

### Sprint 2 — Content Consumption & Engagement 
- **Goal**: Let users browse and interact with agricultural knowledge.
- **Key Deliverables**:
  - Feed/list of agricultural blogs/posts with pagination.
  - Post detail view with likes/comments display; like/comment actions wired to backend.
  - Follow experts: follow/unfollow API + UI; show expert badges on posts.
  - Backend: posts, comments, likes, follows models/endpoints; query optimization for feed.
  - Frontend: feed/detail pages; Redux slices for posts/comments/follows; optimistic UI for likes.
  - Tests: Jest for feed/detail interactions; Minitests for post/comment/follow APIs.

### Sprint 3 — Creation, Communities & Messaging 
- **Goal**: Empower users to contribute, collaborate, and communicate.
- **Key Deliverables**:
  - Create post with image upload (validation, size/format checks); attach to feed.
  - Communities: join/leave, list/joined views, community posts surface.
  - Direct messaging: user-to-user and community channels (MVP text, read status).
  - Backend: uploads handling, community membership models/APIs, messaging endpoints (conversations, messages).
  - Frontend: post composer with image preview, community screens, messaging UI; Redux slices for communities/messaging.
  - Tests: Jest for composer, community flows, messaging UI states; Minitests for upload/community/messaging endpoints.

### Risks & Mitigation
- **Image upload/storage complexity**: Start with constrained sizes/formats; use pre-signed URLs or simple server storage with quotas; add validation early.
- **Performance on feed endpoints**: Use pagination, proper indexing, and N+1 avoidance; add baseline load test in CI later.
- **Auth/security gaps**: Enforce HTTPS-only cookies/JWT practices, input validation, rate limiting; security review each sprint.
- **Scope creep in messaging**: Keep MVP to text-only and read status; defer rich media and typing indicators to later phase.
- **Testing debt**: Definition of Done requires tests; track coverage per sprint and block merges on failing checks.
