# Roots Maghreb – API Audit Summary

**Base URL:** `/api` (all routes prefixed with `/api`)

**Last Updated:** January 31, 2025

---

## 1. Auth (`/api/auth`)

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/api/auth/login` | No | Login with email/password |
| 2 | POST | `/api/auth/signup` | No | Self signup (email, password, full_name) |
| 3 | POST | `/api/auth/refresh` | No | Refresh access token using refreshToken |
| 4 | POST | `/api/auth/reset` | No | Request password reset (sends code to email) |
| 5 | POST | `/api/auth/reset/verify` | No | Verify reset code and set new password |
| 6 | POST | `/api/auth/logout` | JWT | Logout (invalidates refresh tokens) |
| 7 | GET | `/api/auth/me` | JWT | Get current user profile |

---

## 2. Trees (`/api/trees`, `/api/my/trees`, `/api/admin/trees`)

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 8 | GET | `/api/trees` | No | List public trees |
| 9 | GET | `/api/trees/:id` | No | Get single public tree |
| 10 | GET | `/api/trees/:id/gedcom` | No | Download GEDCOM file (public tree) |
| 11 | GET | `/api/my/trees` | JWT | List current user's trees |
| 12 | GET | `/api/my/trees/:id` | JWT | Get single tree (owner only) |
| 13 | POST | `/api/my/trees` | JWT | Create tree |
| 14 | PUT | `/api/my/trees/:id` | JWT | Update tree (owner or admin) |
| 15 | POST | `/api/my/trees/:id/save` | JWT | Save tree (same as update) |
| 16 | DELETE | `/api/my/trees/:id` | JWT | Delete tree (owner or admin) |
| 17 | GET | `/api/my/trees/:id/gedcom` | JWT | Download GEDCOM (owner only) |
| 18 | GET | `/api/admin/trees` | JWT + Admin | List all trees |
| 19 | GET | `/api/admin/trees/:id` | JWT + Admin | Get any tree |
| 20 | POST | `/api/admin/trees` | JWT + Admin | Create tree as admin |
| 21 | POST | `/api/admin/trees/:id/save` | JWT + Admin | Update tree |
| 22 | PUT | `/api/admin/trees/:id` | JWT + Admin | Update tree |
| 23 | DELETE | `/api/admin/trees/:id` | JWT + Admin | Delete tree |

---

## 3. People (Persons in trees) (`/api/trees`, `/api/my`)

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 24 | GET | `/api/trees/:treeId/people` | No | List people in public tree |
| 25 | GET | `/api/people/:id` | No | Get single person (from public tree) |
| 26 | GET | `/api/my/trees/:treeId/people` | JWT | List people in user's tree |
| 27 | GET | `/api/my/people/:id` | JWT | Get single person (user's tree) |
| 28 | POST | `/api/my/trees/:treeId/people` | JWT | Create person in tree |
| 29 | PUT | `/api/my/trees/:treeId/people/:id` | JWT | Update person |
| 30 | DELETE | `/api/my/trees/:treeId/people/:id` | JWT | Delete person |

---

## 4. Gallery / Images (`/api/gallery`, `/api/my/gallery`, `/api/admin/gallery`)

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 31 | GET | `/api/gallery` | No | List public gallery items |
| 32 | GET | `/api/gallery/:id` | No | Get single public gallery item |
| 33 | GET | `/api/my/gallery` | JWT | List current user's gallery items |
| 34 | GET | `/api/my/gallery/:id` | JWT | Get single item (owner only) |
| 35 | POST | `/api/my/gallery` | JWT | Create gallery item (image required) |
| 36 | PUT | `/api/my/gallery/:id` | JWT | Update gallery item |
| 37 | POST | `/api/my/gallery/:id/save` | JWT | Save gallery item |
| 38 | DELETE | `/api/my/gallery/:id` | JWT | Delete gallery item |
| 39 | GET | `/api/admin/gallery` | JWT + Admin | List all gallery items |
| 40 | GET | `/api/admin/gallery/:id` | JWT + Admin | Get any gallery item |
| 41 | POST | `/api/admin/gallery` | JWT + Admin | Create gallery item |
| 42 | PUT | `/api/admin/gallery/:id` | JWT + Admin | Update gallery item |
| 43 | POST | `/api/admin/gallery/:id/save` | JWT + Admin | Save gallery item |
| 44 | DELETE | `/api/admin/gallery/:id` | JWT + Admin | Delete gallery item |

---

## 5. Books (`/api/books`, `/api/my/books`, `/api/admin/books`)

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 45 | GET | `/api/books` | No | List public books |
| 46 | GET | `/api/books/:id` | No | Get single public book |
| 47 | GET | `/api/books/:id/download` | No | Download book file (public only) |
| 48 | GET | `/api/my/books` | JWT | List current user's books |
| 49 | GET | `/api/my/books/:id` | JWT | Get single book (owner only) |
| 50 | POST | `/api/my/books` | JWT | Create book (file required) |
| 51 | PUT | `/api/my/books/:id` | JWT | Update book |
| 52 | DELETE | `/api/my/books/:id` | JWT | Delete book |
| 53 | GET | `/api/my/books/:id/download` | JWT | Download book (owner only) |
| 54 | GET | `/api/admin/books` | JWT + Admin | List all books |
| 55 | GET | `/api/admin/books/:id` | JWT + Admin | Get any book |
| 56 | POST | `/api/admin/books` | JWT + Admin | Create book |
| 57 | PUT | `/api/admin/books/:id` | JWT + Admin | Update book |
| 58 | DELETE | `/api/admin/books/:id` | JWT + Admin | Delete book |

---

## 6. Users (Admin only) (`/api/admin/users`)

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 59 | GET | `/api/admin/users` | JWT + Admin | List all users |
| 60 | GET | `/api/admin/users/:id` | JWT + Admin | Get single user |
| 61 | POST | `/api/admin/users` | JWT + Admin | Create user |
| 62 | PATCH | `/api/admin/users/:id` | JWT + Admin | Update user |
| 63 | DELETE | `/api/admin/users/:id` | JWT + Admin | Delete user |

---

## 7. Activity (Admin only) (`/api/activity`)

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 64 | GET | `/api/activity` | JWT + Admin | List activity logs (?limit=50) |

---

## 8. Stats (Admin only) (`/api/admin/stats`)

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 65 | GET | `/api/admin/stats` | JWT + Admin | Get counts (users, books, trees, people) |

---

## 9. Search (`/api/search`)

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 66 | GET | `/api/search?q=...` | Optional JWT | Search books, trees, people |

---

## 10. Contact & Newsletter

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 67 | POST | `/api/contact` | No | Send contact form message |
| 68 | POST | `/api/newsletter/subscribe` | No | Subscribe to newsletter (email required) |

---

## 11. Health

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 69 | GET | `/api/health` | No | Health check (DB connectivity) |

---

## Summary by Category

| Category | Public | My (JWT) | Admin | Total |
|----------|--------|----------|-------|-------|
| Auth | 5 | 2 | 0 | 7 |
| Trees | 3 | 7 | 6 | 16 |
| People | 2 | 5 | 0 | 7 |
| Gallery | 2 | 6 | 6 | 14 |
| Books | 3 | 6 | 5 | 14 |
| Users | 0 | 0 | 5 | 5 |
| Activity | 0 | 0 | 1 | 1 |
| Stats | 0 | 0 | 1 | 1 |
| Search | 1 | 0 | 0 | 1 |
| Contact/Newsletter | 2 | 0 | 0 | 2 |
| Health | 1 | 0 | 0 | 1 |
| **Total** | **19** | **26** | **24** | **69** |

---

## Fixes Applied (Audit)

- Trees: `GET trees/:id/gedcom` placed before `GET trees/:id` to avoid route conflict
- Trees: Signup uses user-provided password (not random) via UsersService.create with adminId=null
- Persons: Role check includes super_admin (role_id 3), ParseIntPipe on all params
- Persons: `insertAndFetch` for create to return correct id, BadRequestException for validation
- Search: Role check for canSeeAllTrees includes role_id 3
- Newsletter: Email validation with BadRequestException
- Auth: reset/verify route before reset; validation for refresh/reset/verify
- DTOs: CreateTreeDto, CreateBookDto, UpdateBookDto, CreateGalleryDto, UpdateGalleryDto extended for all fields
- Trees/Books/Gallery: `is_public` coerced to boolean before patch (fixes Objection ValidationError on MySQL 1/0)
- Auth refresh: null check for storedToken.user (deleted user)
- Contact/Newsletter: validate EMAIL_FROM/SMTP before send
- file.utils: fix resolveStoredFilePath for /uploads/ and private/
- Gallery/Books/Trees: insertAndFetch for create (return full object with id)
- Books: add updated_at column (script: add-books-updated-at.js)
- Search: modifyGraph to exclude password from owner in trees/people
