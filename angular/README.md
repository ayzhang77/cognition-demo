# Ops Console — Angular

Angular (standalone components + Router) port of the Next.js prototype in the repository root.
The app is a client-side SPA: all data comes from the in-memory mock services under `src/app/services`.

## Migration status

| Layer | Source (Next.js) | Angular | Done |
| --- | --- | --- | --- |
| Domain types | `types/` | `src/app/types/` | yes |
| Mock data | `services/mock-data.ts` | `src/app/services/mock-data.ts` | yes |
| Utils | `lib/utils.ts` | `src/app/lib/utils.ts` | yes |
| Services | `services/*-service.ts` | `src/app/services/*-service.ts` (`@Injectable({providedIn:'root'})`) | yes |
| Auth / RBAC | `lib/auth.ts` | `src/app/services/auth-service.ts` (signal + observable) | yes |
| Shared UI | `components/shared/` | `src/app/shared/` | yes |
| Layout shell | `components/layout/`, `app/layout.tsx` | `src/app/layout/`, `src/app/app.ts` | yes |
| Routes | `app/**/page.tsx` (file routes) | `src/app/app.routes.ts` | yes |
| Dashboard home | `app/page.tsx` | `src/app/pages/dashboard.ts` | yes |
| Refunds page | `app/refunds/page.tsx` | `src/app/pages/refunds.ts` | yes |
| KYC page | `app/kyc/page.tsx` | `src/app/pages/kyc.ts` | yes |
| Feature flags page | `app/feature-flags/page.tsx` | `src/app/pages/feature-flags.ts` | yes |
| Tests | `__tests__/` | `*.spec.ts` (Karma + Jasmine) | yes |

The migration is complete: every route, component, service, and test suite of the Next.js
prototype has an Angular counterpart. The Next.js app in the repository root is kept unchanged as
the reference implementation.

RBAC checks that were duplicated in the feature services (`refundService.canRefundAmount`,
`kycService.canApproveHighRisk`, `featureFlagService.canModifyProduction`) are consolidated into
`AuthService.canRefundAmount` / `canApproveKYCHighRisk` / `canModifyProductionFlags`.

The default user (`MOCK_USERS[0]`) is set by an app initializer in `src/app/app.config.ts`,
replacing the render-time bootstrap in `app/layout.tsx`.

`usePathname()`-based nav highlighting is replaced by `routerLinkActive` (exact match), and the
reactive `authService.subscribe` pattern by the `AuthService.currentUser` signal.
React `useEffect(loadPayments, [filters])` becomes a `Subject` piped through `switchMap` in
`ngOnInit`, so filter changes cancel in-flight loads.

## Tests

`__tests__/auth.test.ts` and `__tests__/refund-validation.test.ts` become
`src/app/services/auth-service.spec.ts` and `src/app/services/refund-validation.spec.ts`, with the
singletons obtained through `TestBed.inject(...)`; RBAC assertions go through `AuthService`
(set the current user, then call e.g. `canRefundAmount`). Component behaviour is covered by
`TestBed` specs (`app.spec.ts`, `shared/*.spec.ts`, `pages/kyc.spec.ts`,
`pages/feature-flags.spec.ts`).

Caveat carried over from the original repo: the root-provided services mutate shared in-memory
arrays, so suites can interfere with each other. The original refundable-amount tracking test was
removed for that reason and is not reintroduced — avoid order-dependent tests, and spy on mutating
service methods (as the page specs do) instead of letting them write to the shared data.

## Running

Requires Node 22 (`nvm use 22`).

```bash
npm install
npm start        # dev server on http://localhost:4200
npm run build
npm test         # Karma + Jasmine, headless Chrome (set CHROME_BIN if Chrome is not auto-detected)
```

## Table columns

The generic `Table<T>` replaces React `render` callbacks with `ng-template`s:

```html
<ng-template #amountCell let-value let-row="row">
  <span>{{ value | currency }} for {{ row.customerName }}</span>
</ng-template>
<app-table [data]="payments" [columns]="columns" (rowClick)="select($event)" />
```

```ts
columns: TableColumn<Payment>[] = [
  { key: 'id', header: 'Payment ID' },
  { key: 'amount', header: 'Amount', cell: this.amountCell },
];
```
