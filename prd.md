# KNotion – PRD & Engineering Task List (T3 + pnpm + SQLite)

> **Purpose**
> This document breaks KNotion’s MVP down into self‑contained engineering tasks that can be handed to **Cursor** (AI pair‑programmer).
> Each task contains **all required context**, an explicit **build‑verification step**, and at least one link to **relevant documentation**.

> **Stack**
> • [T3 Stack](https://create.t3.gg/) (Next.js 14, TypeScript, tRPC, Tailwind, NextAuth) using **pnpm** as the package manager.
> • **SQLite** as the Prisma provider (file‑based for fast local iteration).
> • Prisma for ORM & migrations.
> • shadcn/ui + Tailwind for UI primitives.
> • Pusher Channels (or Ably) for real‑time comment updates.
> • Chrome Manifest V3 extension for in‑page save/highlight/comment.

> **MVP Functional Pillars**
>
> 1. In‑page highlighting **& threaded comments** (Chrome extension)
> 2. Cloud‑backed link store with **tags & collections**
> 3. **Invite‑only** collaboration
> 4. **Google SSO** auth

---

## ✍️ How to read a task

| Section     | What it contains                                                           |
| ----------- | -------------------------------------------------------------------------- |
| **Goal**    | The outcome expected when the task is complete.                            |
| **Context** | All domain knowledge Cursor needs (schema, UX notes, routes, etc.).        |
| **Steps**   | Ordered implementation instructions **including a “✅ Build & test” step**. |
| **Docs**    | Curated external links for deeper guidance.                                |

---

## 🗂️ Task Index

1. **Repo & Boilerplate Cleanup**
2. **Auth – Google SSO with NextAuth + Prisma Adapter**
3. **Core Database Schema (Links, Tags, Collections, Comments)**
4. **Link Save API & Minimal Web UI**
5. **Chrome Extension v0 – One‑Click Save**
6. **Tag & Collection Management UI**
7. **In‑Page Highlighting + Comment Capture**
8. **Threaded Discussion Service & Real‑Time Updates**
9. **Inbox / Notification Center**
10. **Preview → Build → Deploy Pipeline (Vercel)**

---

### 1 · Repo & Boilerplate Cleanup

**Goal**
Start from a clean T3 code‑base stripped of demo `Post` objects/sample pages.

**Context**
The official T3 starter ships with example code (`prisma/post`, trpc `post` router, `/posts` page, etc.). KNotion doesn’t use these.

**Steps**

1. **Scaffold** a fresh project: `pnpm dlx create-t3-app@latest knotion` → choose **“Next.js | TypeScript | Tailwind | tRPC | Prisma | NextAuth”**, skip everything else.
2. Delete:

   * `prisma/schema.prisma` → remove `Post` model.
   * `src/server/api/routers/post.ts` & its import in `src/server/api/root.ts`.
   * Demo pages: `src/pages/index.tsx` sample content; remove `src/pages/posts/*` if generated.
3. Update homepage with “🚧 KNotion coming soon” placeholder.
4. **DB reset & migrate**: `pnpm db:reset` (or `pnpm prisma migrate reset`).
5. **✅ Build & test:** `pnpm build && pnpm start` → ensure compile clean & homepage renders.

**Docs**

* T3 “Usage & Cleanup” → [https://create.t3.gg/en/usage/cleanup](https://create.t3.gg/en/usage/cleanup)
* Prisma migrate reset → [https://www.prisma.io/docs/concepts/components/prisma-migrate/resetting-the-database](https://www.prisma.io/docs/concepts/components/prisma-migrate/resetting-the-database)

---

### 2 · Auth – Google SSO with NextAuth

**Goal**
Enable Google OAuth login with session stored in SQLite via Prisma Adapter.

**Context**
KNotion collab + Inbox rely on user identity. We’ll use NextAuth (already in T3).

**Steps**

1. Create Google OAuth App → get `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` + set `NEXTAUTH_URL` in `.env`.
2. Extend `prisma/schema.prisma` with NextAuth models (`User`, `Account`, `Session`, `VerificationToken`).
   Use `npx prisma init` templates or docs.
3. Update `src/server/auth.ts` to add Google Provider and Prisma Adapter.
4. Add simple `SignInButton` component + show user avatar in navbar.
5. **✅ Build & test**: `pnpm dev` → click **“Sign in with Google”** flows, confirm user row in SQLite.

**Docs**

* NextAuth Google Provider → [https://next-auth.js.org/providers/google](https://next-auth.js.org/providers/google)
* Prisma Adapter schema → [https://next-auth.js.org/adapters/prisma](https://next-auth.js.org/adapters/prisma)

---

### 3 · Core Database Schema

**Goal**
Define & migrate all MVP tables.

**Context / ER Diagram**

```mermaid
erDiagram
  User ||--o{ Collection : "creates"
  User ||--o{ Link : "saves"
  User ||--o{ Comment : "writes"
  User ||--o{ Notification : "receives"
  Collection ||--o{ LinkCollection : "contains"
  Link ||--o{ LinkCollection : "membership"
  Link ||--o{ LinkTag : "tags"
  Tag ||--o{ LinkTag : "classified by"
  Link ||--o{ Comment : "has"
  Comment ||--o{ Comment : "replies"  -- parentId
```

Key Fields (summarised):

* **Link**: id, url, title, description, createdAt, ownerId FK.
* **Tag**: id, name, ownerId.
* **Collection**: id, name, visibility(`PRIVATE`|`SHARED`), ownerId.
* **Comment**: id, linkId, authorId, rangeStart, rangeEnd, rangeSelector, text, parentId (nullable).
* **Invitation**: id, collectionId, inviteeEmail, role(`VIEW`|`COMMENT`|`EDIT`), acceptedAt.
* **Notification**: id, userId, type, entityId, isRead, createdAt.

**Steps**

1. Translate diagram to `prisma/schema.prisma` models (remember `@@map` names if needed).
2. `pnpm prisma migrate dev --name init-core`
3. Seed script (`pnpm prisma db seed`) creates 1 demo user + sample collection.
4. **✅ Build & test**: run `pnpm build` to ensure generated Prisma Client compiles.

**Docs**

* Prisma relation patterns → [https://www.prisma.io/docs/concepts/components/prisma-schema/relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)

---

### 4 · Link Save API & Minimal Web UI

**Goal**
Allow authenticated users to save a link (URL + meta) from the web app.

**Context**

* Will later be called by the Chrome extension.
* Use `metascraper` (lightweight) to auto‑fetch title/description.

**Steps**

1. Add tRPC procedure `link.save` in `src/server/api/routers/link.ts`:

   ```ts
   input: z.object({ url: z.string().url(), tags: z.string().array().optional(), collectionId: z.string().nullable() })
   ```
2. Inside, fetch metadata → persist Link row + Tag & LinkTag rows.
3. Add `/save` page with a simple form (URL, tags textarea, collection select).
4. Protect route with `getServerAuthSession`.
5. **✅ Build & test**: `pnpm dev` → save `https://example.com` → verify DB row.

**Docs**

* tRPC mutation examples → [https://trpc.io/docs/react/useMutation](https://trpc.io/docs/react/useMutation)
* metascraper → [https://github.com/microlinkhq/metascraper](https://github.com/microlinkhq/metascraper)

---

### 5 · Chrome Extension v0 – One‑Click Save

**Goal**
Ship a MV3 extension that lets signed‑in users save the current tab’s URL into KNotion via the `link.save` endpoint.

**Context**

* Authentication strategy: obtain a **JWT session token** via `/api/auth/session` and include it as `Authorization: Bearer`.

**Steps**

1. Create `extension/manifest.json` (MV3) with `action` + `background`.
2. Popup `index.html` loads `/action.js` → fetch active tab URL → POST to `/api/trpc/link.save` with token.
3. On success, show ✓ toast.
4. Add `pnpm extension:build` script using `esbuild`.
5. **✅ Build & test**: `pnpm extension:build`, load `dist/` as unpacked extension in Chrome, click icon on `wikipedia.org` → confirm Link row appears.

**Docs**

* Chrome MV3 quickstart → [https://developer.chrome.com/docs/extensions/mv3/getstarted/](https://developer.chrome.com/docs/extensions/mv3/getstarted/)
* NextAuth session fetch → [https://next-auth.js.org/getting-started/client#usesession](https://next-auth.js.org/getting-started/client#usesession)

---

### 6 · Tag & Collection Management UI

**Goal**
CRUD interface for Tags & Collections + basic filtering in list view.

**Context**

* Uses shadcn **Dialog**, **DataTable**, **Badge** components.

**Steps**

1. Generate shadcn components: `npx shadcn-ui@latest add dialog table badge`.
2. Route `/dashboard` lists current user’s Links in DataTable with columns: Title, Tags, Collection, Created At.
3. Sidebar with **Collections** & **Tags** listing (`useQuery` calls). Clicking filters table.
4. Modal forms to create/edit Tag, Collection.
5. **✅ Build & test**: `pnpm build` & manual smoke test filter interactions.

**Docs**

* shadcn/ui usage → [https://ui.shadcn.com](https://ui.shadcn.com)
* TanStack Table → [https://tanstack.com/table/latest](https://tanstack.com/table/latest)

---

### 7 · In‑Page Highlighting + Comment Capture

**Goal**
Allow users to select text on any page, add a comment, and persist a serialized range in DB.

**Context**

* Use `dom-range-serializer` to convert selection to `{startOffset, endOffset, containerSelector}`.
* Content script injects tooltip UI.

**Steps**

1. Extend extension build with `contentScript.ts`.
2. On `mouseup`, if selection length > 0 → inject floating toolbar **“Comment”**.
3. Clicking opens small React dialog (use `iframe` or `shadowRoot`) to enter comment text.
4. POST `/api/trpc/comment.create` with linkId (lookup by URL) + range fields.
5. Highlight saved range (`mark.js` library) on load.
6. **✅ Build & test**: highlight lorem ipsum on a blog, reload page → highlight persists.

**Docs**

* dom-range-serializer → [https://github.com/ripeworks/dom-range-serializer](https://github.com/ripeworks/dom-range-serializer)
* mark.js highlights → [https://markjs.io](https://markjs.io)

---

### 8 · Threaded Discussion Service & Real‑Time Updates

**Goal**
Show threaded comments in sidebar overlay with live updates.

**Context**

* Use Pusher Channels (free dev tier) for realtime.
* `/api/comment.onCreate` emits event → subscribed clients append.

**Steps**

1. Create `pusher.ts` helper (server + client keys in `.env`).
2. `comment.create` mutation publishes `{ comment, linkId }`.
3. Front‑end `CommentSidebar` subscribes `link-{id}` channel.
4. Allow replying (parentId).
5. Invitation gate: only owner or invited can load comments (SQL join).
6. **✅ Build & test**: two browsers, add comment, see live.

**Docs**

* Pusher JS SDK → [https://pusher.com/docs/channels/getting\_started/javascript/](https://pusher.com/docs/channels/getting_started/javascript/)
* Prisma recursive/self relations → [https://pris.ly/d/relations-self](https://pris.ly/d/relations-self)

---

### 9 · Inbox / Notification Center

**Goal**
Surface unread comment/reply events.

**Context**

* Notification created in DB inside `comment.create` when `recipientId !== authorId`.

**Steps**

1. Prisma `Notification` model already added; generate client.
2. `/api/notification.list` query with pagination.
3. Navbar bell icon shows count (SSR using `getServerAuthSession`).
4. Dropdown lists top‑5, “View All” to `/inbox` page.
5. Mark‑as‑read mutation; real‑time update via Pusher private channel `user-{id}`.
6. **✅ Build & test**: author writes comment; invitee sees bell increment live.

**Docs**

* Next.js Server Components + Auth session → [https://nextjs.org/docs/app/building-your-application/authentication](https://nextjs.org/docs/app/building-your-application/authentication)

---

### 10 · Preview → Build → Deploy Pipeline

**Goal**
Automate CI build and deploy to Vercel (or Fly.io).

**Context**

* Ensures every PR builds & DB schema is migrated.

**Steps**

1. Add GitHub Actions workflow `.github/workflows/ci.yml`:

   ```yaml
   steps:
     - uses: actions/checkout@v4
     - uses: pnpm/action-setup@v3
       with: { version: 9 }
     - run: pnpm install --frozen-lockfile
     - run: pnpm prisma generate
     - run: pnpm build
   ```
2. Configure Vercel project → add `DATABASE_URL="file:/var/data/knotion.db"`.
3. Add `vercel.json` with `prisma` binary inclusion.
4. **✅ Build & test**: push to `main` → Vercel preview URL renders login page.

**Docs**

* Vercel + Prisma on SQLite → [https://vercel.com/docs/storage/overview#sqlite](https://vercel.com/docs/storage/overview#sqlite)
* GitHub Actions PNPM setup → [https://github.com/pnpm/action-setup](https://github.com/pnpm/action-setup)

---

## 📌 Next Steps (Post‑MVP Backlog)

* Clean Reader View using `readability` + Mercury parser.
* Page snapshot storage (S3 or Supabase Storage).
* Public threads & link sharing.
* Mobile responsive PWA.

---

### End of PRD
