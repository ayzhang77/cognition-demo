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
| Layout shell | `components/layout/`, `app/layout.tsx` | — | pending |
| Routes / pages | `app/**/page.tsx` | `src/app/app.routes.ts` | pending |
| Tests | `__tests__/` | `*.spec.ts` (Karma + Jasmine) | pending |

RBAC checks that were duplicated in the feature services (`refundService.canRefundAmount`,
`kycService.canApproveHighRisk`, `featureFlagService.canModifyProduction`) are consolidated into
`AuthService.canRefundAmount` / `canApproveKYCHighRisk` / `canModifyProductionFlags`.

The default user (`MOCK_USERS[0]`) is set by an app initializer in `src/app/app.config.ts`,
replacing the render-time bootstrap in `app/layout.tsx`.

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
