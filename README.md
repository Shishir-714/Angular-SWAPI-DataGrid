# SWAPI Starship Grid

A single-page Angular application that displays Star Wars starship data (from [SWAPI](https://swapi.dev/)) in a feature-rich, virtualized data grid with infinite scroll, resizable columns, client-side cell editing, and search.

## Install & Run

```bash
npm install
npm start        # ng serve — app runs at http://localhost:4200
npm test         # runs the Vitest test suite
```

Requires Node 20.19+ and npm. No environment variables or backend setup needed — this is front-end only, talking directly to the public SWAPI.

## SWAPI Resource

**`starships`** 

## Infinite Scroll & the "No Loader While Scrolling" Behavior

Pagination is handled with **TanStack Query's `injectInfiniteQuery`**:

- `queryFn` calls `QueryService.getResponse('starships', pageParam)`, which wraps the raw `fetch` call against `https://swapi.dev/api/starships/?page={n}`.
- `getNextPageParam` reads the `next` URL from SWAPI's response and extracts the page number for the following request; it returns `undefined` once SWAPI stops returning a `next` link, which flips `hasNextPage()` to `false`.
- All fetched pages are cached by TanStack Query under the `['starships']` query key for the app's lifetime — scrolling back up and down never triggers a duplicate request for a page that's already been fetched.
- The grid is virtualized with **`@tanstack/angular-virtual`** (`injectVirtualizer`), so only the rows near the viewport are actually rendered to the DOM regardless of how much data has loaded.
- **The "no spinner while scrolling" requirement is satisfied by *when* the next page is requested, not by hiding a loading state.** The table's scroll container has a scroll listener (`onScroll`) that fires `loadNextPage()` once the user is within ~150px of the bottom of the currently-rendered content — i.e., *before* they run out of rows, not after. Because the fetch (usually) resolves and the new rows are appended before the user physically scrolls that far, there's nothing to show a spinner for. `isFetchingNextPage` from the query is deliberately never bound to the template.
- The **very first page load** is the one exception allowed by the brief: `starshipQuery.isLoading()` gates a dedicated `<app-loader />` shown before any data exists.

## Editable Column & Where Edits Live

The **Name** column is editable (marked via `meta: { editable: true }` on its column definition). Editing is click-to-edit:

- Clicking a cell in an editable column swaps its read-only `<span>` for a text `<input>`, pre-filled and focused.
- **Enter** or **blur** commits the value; **Escape** cancels and discards the in-progress edit without touching stored state.
- Committed edits are kept in a `Record<string, Partial<Starship>>` client-state signal (`edits`), keyed by an id derived from each starship's SWAPI `url` field. **No HTTP request is made** — SWAPI is read-only and edits never leave the browser.
- The grid's displayed data (`displayUpdatedData`) is a merge of the original SWAPI row and any matching entry in `edits`, computed at render time — the original fetched/cached data is never mutated, only overlaid.
- This overlay design is intentionally what would make wiring up real API writes later straightforward: a `patchResource()` method already exists on `QueryService` as an unused stub showing the shape a future PATCH call would take, without being called anywhere in the current app.

## Column Resizing

Handled by **TanStack Table's** built-in resizing features (`columnSizingFeature`, `columnResizingFeature`, `columnResizeMode: 'onChange'`). Each header renders a drag handle bound to `header.getResizeHandler()`; column widths update live via `header.getSize()` / `cell.column.getSize()` bindings, so resizing is applied immediately with no extra state management needed on top of what the library provides.

## Search

A single global text input filters rows by starship **name**, using TanStack Table's `columnFilteringFeature` with the `includesString` filter function. The input is debounced (250ms) before updating the active filter, to avoid re-filtering on every keystroke. Filtering runs against **currently loaded rows only** — see trade-offs below. A clear empty-state message is shown when a filter matches zero rows.

## Third-Party Packages

| Package | Purpose |
|---|---|
| `@tanstack/angular-query-experimental` | Infinite pagination, request caching/deduplication |
| `@tanstack/angular-table` | Column definitions, resizing, filtering |
| `@tanstack/angular-virtual` | Row virtualization for smooth scroll performance |
| `tailwindcss` / `@tailwindcss/postcss` | Styling |

## Trade-offs & Limitations

- **Search only covers already-loaded pages.** SWAPI's own search endpoint would require a separate, differently-paginated request stream, which would conflict with the page-cache/no-overfetch requirement — so search is scoped to what's been fetched via scrolling so far. This is called out to the user via copy near the search input.
- **Row height is a fixed estimate** (`estimateSize: () => 56`) for the virtualizer; rows with unusually long wrapped content aren't individually measured.
- The **PATCH stub** in `QueryService` is present but intentionally unused, to demonstrate the future integration point without violating the read-only constraint.
- Filtering, resizing, and virtualization all currently apply to loaded (in-memory) data — there's no server-side filter/sort, consistent with SWAPI's limited query capabilities.