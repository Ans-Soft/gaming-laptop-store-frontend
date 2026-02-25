# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Layout

The actual React app lives inside the `gaming-laptop-store/` subdirectory. All dev commands must be run from there:

```bash
cd gaming-laptop-store
npm run dev       # start Vite dev server
npm run build     # production build
npm run lint      # ESLint
npm run preview   # preview production build locally
```

The root-level `package.json` only contains `@google/generative-ai` and is unrelated to the React app.

## Architecture

**Stack:** React 19 + Vite + React Router v7 + Axios + plain CSS

**Entry point:** `src/main.jsx` — defines the router with `createBrowserRouter`. `App.jsx` is unused; routing is entirely in `main.jsx`.

**Two layout zones:**
- **Public pages** (`/`, `/catalogo`, `/politica-de-privacidad`, `/conocenos`, `/contactanos`, `/envios`): wrapped by `PublicLayout`, which injects `LandingHeader`, `Footer`, `Whatsapp`, and `ScrollToTop`.
- **Admin pages** (`/login`, `/admin`, `/admin/*`): standalone, no shared layout. Protected by JWT tokens stored in `localStorage`.

**Services layer** (`src/services/`):
- `Urls.jsx` — single source of truth for all API endpoints. Backend is Django REST at `http://127.0.0.1:8000`.
- `Api.jsx` — axios instance with a request interceptor that attaches `Authorization: Bearer <token>` to all non-public endpoints.
- `Auth.jsx` — `login()`, `logout()`, `refreshToken()` using `access_token` / `refresh_token` in `localStorage`.
- Per-domain service files (`BrandService`, `CategoryService`, `BaseProduct`, `ProductVariant`, `UserService`, `CatalogService`) call `api` from `Api.jsx`.

**Admin CRUD pattern:**
Admin pages follow a consistent pattern: fetch list on mount → render `DataTable` → open `ModalBase` for create/edit. The generic `DataTable` component (`src/components/admin/DataTable.jsx`) accepts `columns`, `data`, `onEdit`, `onView`, `customActions`, and `rowKey` props.

**CSS:** Plain CSS per component, imported directly in the JSX file. Global design tokens are defined as CSS custom properties in `src/styles/global.css` — always use variables, never hardcode colors.

**Design system — white & blue corporate theme (logo-derived):**
- **Surface hierarchy:** 3 tiers — `--bg-color` (#FFFFFF) → `--card-bg` (#F0F7FF, section alternate) → `--card-bg-elevated` (#E8F1FA, cards)
- **Navbar & footer:** Dark corporate navy (`--navbar-bg: #0A1628`). Navbar has its own text/hover/active variables.
- **Shadows:** 3 levels via `--shadow-sm`, `--shadow-md`, `--shadow-lg` (blue-tinted, not gray)
- **CTAs:** `--cta-bg` / `--cta-hover` / `--cta-active` with white text
- **Active route:** Navbar uses `NavLink` with `.active` class — shows underline on desktop, left-border on mobile
- **Section separation:** Background color alternation (white ↔ light blue), no inter-section borders

## Key Notes

- **No test framework** is configured. There are no unit or integration tests.
- **Catalog page** (`/catalogo`) currently renders only a Canva embed; the product grid fetch is commented out.
- Static images for the home page product lines are served from `/public/assets/home/lineas-portatiles/`.
- WhatsApp contact number used across the app: `573012661811`.
- Deployed to Vercel (`vercel.json` is present).
