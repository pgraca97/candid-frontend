# Candid

> Early work in progress. Started in January 2026, paused since June 2026.

A job application tracker that works like a spreadsheet: your applications live in one table, and you edit them in place.

API: [candid-api](https://github.com/pgraca97/candid-api)

## What works so far

- **Applications table** built with TanStack Table: company, position, status, a word count of the notes and the application date.
- **Company editing in place.** As you type in the company cell, a dropdown suggests existing companies (debounced search, 300 ms). Enter saves, Escape cancels.
- **Optimistic updates.** Edits and deletions show up at once and roll back if the API call fails (TanStack Query `onMutate` and `onError`).
- **Row actions** in a popover positioned with Floating UI and rendered in a portal, so the table never clips it.

The application and company detail pages only fetch their data so far.

## Tech stack

React 19, TypeScript, Vite, TanStack Router, TanStack Query, TanStack Table, Floating UI, Tailwind CSS 4, Axios and Biome.

## How to run

Requires Node 22+, pnpm and the [API](https://github.com/pgraca97/candid-api) running locally.

```bash
pnpm install
cp .env.example .env
pnpm dev
```

`VITE_API_URL` in `.env` points to the API (`http://localhost:3000/api` by default).

## Next steps

- Detail pages for applications and companies
- Create applications from the UI
- Tests with Vitest and Testing Library
- Deploy (Vercel for the frontend, Railway for the API and database)