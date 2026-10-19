## Export Software Frontend

Built on top of [fe-zen-arch](git@github.com:shivamkj/fe-zen-arch.git) — the core shared architecture for B2B SaaS frontends.

### Libraries

- **React** [Docs](https://react.dev/reference/react)
- **Tailwind CSS** [Docs](https://tailwindcss.com/docs/installation)
- **React Query** [Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- **React Hook Form** [Docs](https://www.react-hook-form.com/get-started)
- **Zustand** [Docs](https://zustand.docs.pmnd.rs/)

### Setup

```bash
pnpm install   # fe-zen-arch is included as a git submodule, init it first if missing
pnpm dev       # dev server on port 5173
pnpm lint      # prettier + tsc + eslint (fe-zen-arch lint pipeline)
pnpm build     # production build
```

### Notes

- `core`, `ui`, `auth`, `icons` are fe-zen-arch workspace packages, aliased via tsconfig paths & vite aliases.
- Forms are built directly with `useForm` from `core/form` + `Form` / `SubmitButton` from `core/form/components` — no generic form templates.
- Routing uses fe-zen-arch's zustand router: routes defined in `src/shared/routes.tsx`, paths in `src/shared/route-paths.ts`.
- Auth uses the fe-zen-arch auth module (routes, interceptors, login pages) out of the box.
- API base URL comes from `PUBLIC_API_URL` (`.env`).
- Don't use react-query mutation for react-hook-form submit handler.
- For HMR (hot refresh), the file must export only react component, and not any other constant or object.
- While most input elements use `...register('name')`, custom elements like select require `<Select<T> name="name" />` instead.

---

## Shipping Bill refactor

The shipping bill form used to be one 1,761-line component that imported hardcoded arrays, kept its own
store, and mixed validation, formatting and API calls into the JSX. It is now split by responsibility.

```
src/shipping-bills/
  domain/       Pure TypeScript, no React. Types, defaults, totals, validation rules, the API payload
                mapper, the flat-file generator. Fully unit-tested.
  api/          `contract.ts`  the ShippingBillApi interface the UI depends on
                `index.ts`     the one line that picks the implementation (mock today)
                `mock/`        mock backend: in-memory "database", fixtures, latency + failure injection
  hooks/        react-query reads (`queries.ts`), writes that invalidate caches (`actions.ts`),
                lookups for searchable selects, and `use-bill-editor.ts` (form state, tabs, save, submit)
  schema/       per-field rules (required / format) for the form and the party dialogs
  components/   fields/ (reusable inputs), sections/ (one per area of the form), the editor, dialogs
  shipping-bill-form.tsx   route component: loads data, handles loading / error / not found
```

Data flow: `component -> hook -> api interface -> mock`. Components never import mock data or the mock
module. React Hook Form owns form values, React Query owns server data, and nothing else is global.

### Mock services

Every `ShippingBillApi` method is async and returns plain JSON, through `respond()` which adds latency and
returns a deep copy (so a caller can never mutate the stored data by accident). It covers form options,
searchable ports / document types / parties, party and branch creation, listing, loading, draft saving,
submitting and the flat-file download.

States handled in the UI: loading, empty (no bills, no search results), error with retry (page, list,
select popovers, marks and numbers), success (toast and redirect), and server-rejected submissions
(field errors shown next to the inputs, jumping to the right tab).

Dev-only URL flags let you see each state (use them on any page):

| Flag                 | Effect                                                                               |
| -------------------- | ------------------------------------------------------------------------------------ |
| `?mock-latency=2000` | every call takes 2 s                                                                 |
| `?mock-fail=options` | fail a group: `options`, `parties`, `ports`, `bills`, `submit`, `download`, or `all` |
| `?mock-empty=bills`  | the bill list comes back empty                                                       |

Mock data persists in `localStorage` (key `export-software-mock-db-v3`). Clear it to reset.

### Swapping in a real API

`api/http/http-api.ts` is a complete `ShippingBillApi` over HTTP, built on `core/request`. To use it, set
`PUBLIC_API_MODE=http` and `PUBLIC_API_URL=...` in `.env`: `api/index.ts` is the only place that reads them,
so no component, hook or form code changes. The endpoints it expects are listed at the top of that file.

Its behaviour is unit-tested against a fake `fetch` (URLs, POST vs PUT, 404 -> `undefined` for reads). A
rejected submission is an HTTP 422 whose body is `{ "message": "...", "description": "<JSON of {path: message}>" }`;
the adapter turns it into `SubmissionRejectedError`, the same thing the mock throws. (`core/request` keeps only
`message` / `description` from an error body, which is why the field errors travel in `description`.) The
adapter has not been run against a live server, because none exists for this exercise.

### Validation

- **Schema rules** (`schema/`): required fields and formats (8-digit RITC code, IEC, PAN, GSTIN, IFSC),
  shown inline. fe-zen-arch looks rules up by the last path segment, so leaf names must be unique.
- **Cross-field rules** (`domain/validation.ts`): rules that relate fields to each other. They run in the
  browser (shown together with the required-field errors on the first failed submit) and again in the mock
  server, as a real backend would.
- **Server-only rules** (`api/mock/mock-api.ts`): referenced exporter / consignee / branches / ports exist,
  and an invoice number is not already used on another bill.

### Domain assumptions

Chosen after a short read of export documentation, not verified with a customs expert:

- Port of loading is an Indian port; the final destination is outside India. Port codes are UN/LOCODE, so the
  first two letters give the country (derived into the payload).
- Net weight cannot exceed gross weight. Job date cannot be in the future. An invoice date cannot be after the
  job date.
- The items total of an invoice is the sum of its lines. A manually typed invoice total must match it.
- A charge (freight, insurance, commission, discount, other) is a % rate or an amount, never both. Discount
  cannot exceed the invoice value.
- Containerized cargo (`C`, `CP`) needs at least one container. Container numbers follow ISO 6346
  (4 letters + 7 digits) and must be unique.
- Packing ranges must not overlap or run past the total packages.
- Documents and licences that point at "invoice N, item M" must point at something that exists.
- RBI waiver number and date go together, as do AR4 number and date. IGST paid requires taxable value + amount.
- Backend field names such as `freight_insaurance_included` and `packging_list` are kept exactly as the
  existing contract spells them.

### Behaviour changes from the starter

- "Previous" no longer silently saves a draft (every tab's values stay in the form anyway). There is an
  explicit "Save draft" button instead, and "Save & Next" waits for the save before moving on.
- Bills have a `draft` / `submitted` status. Submitting validates everything and returns to the list.
- The list is built from summary rows (names and totals resolved by the "server"). The 23 identical filler
  rows were replaced by two realistic seed bills.
- Buyer and third-party pickers now search by their own role, not only consignees.
- Fixed: the unit placeholder used the invoice index as an item index (crash risk); the form stayed disabled
  after saving an existing bill; decimal prices were blocked by native number validation; errors hidden inside
  collapsed "Advanced" sections now open that section.
- Removed unused code: second payload builder (`toHttpShippingBillPayload`, which dropped most fields),
  delete helpers nobody called, the `useSyncExternalStore` demo store.

### Responsive layout

Checked at 390 px wide (no horizontal overflow on the list, form tabs or editors). Note that fe-zen-arch itself
shows a "desktop & tablet" notice on phones, with a "Continue anyway" button; that is the starter's choice.

### Commands

```bash
pnpm test    # 66 unit tests, Node's built-in runner (no new dependencies)
pnpm lint    # prettier + tsc + eslint + spell check: clean
pnpm build
```

## AI Usage & Approach

- **Tool:** Claude (chat), used for reading the starter, proposing the architecture, writing most of the code
  and tests, and driving the app in a headless browser to check it.
- **Approach:** audit first (duplication, hardcoded data, mixed responsibilities), then domain logic, then the
  API contract and mock, then hooks, then UI. Components were rewritten around those layers, not patched.
- **Judgment:** I kept `fe-zen-arch` untouched and worked within its quirks (rules by leaf name, `Form` retries
  failed submits). I dropped features the starter never used rather than porting them, and chose not to write
  an untested HTTP adapter: the interface plus the swap instructions are the boundary.
- **Validation:** tests for the domain and the mock service, `tsc` / eslint / prettier clean, and a browser pass
  over loading, empty, error, validation, server-rejection and happy paths. The browser pass found real bugs
  that type-checking missed: a crash from `useWatch` without an explicit `control`, and decimal prices being
  blocked by native number validation.
- **Learning / caveat:** the validation rules are assumptions (above). Read and be able to explain every file.
