# Integration Mapping

## Existing feature to proposed business system

| Requested capability | Existing implementation | Extension strategy | Compatibility boundary |
|---|---|---|---|
| Authentication | `User`, `Tenant`, JWT auth routes, `AuthContext`, `ProtectedRoute` | Use existing token and add branch membership/capability resolution server-side. | No second login, tenant, or frontend auth context. |
| Tenant isolation | `req.user.tenantId`, controller-level filters, `requireActiveTenant` | Require tenant ownership checks for every new branch/reference and consistent active-tenant/entitlement middleware. | Never accept tenant ID from POS or inventory request bodies as authority. |
| Subscription/feature access | `Tenant.package`, `featureFlags`, payment approval state | Normalize and centralize feature entitlement checks for `branches`, `inventory`, `purchasing`, `pos`, and `delivery`. | Do not invent a parallel billing/subscription owner; current flow is manual payment and activation, not a recurring subscription service. |
| Roles and users | `User.role`, `/api/users`, `users` dashboard page | Add validated branch membership and server-side action capabilities; scope user mutations by tenant and actor permissions. | Preserve `SUPER_ADMIN` and existing business admin behavior until capability migration. |
| Store settings | Tenant preferences, currency, tax percentage, delivery charge, settings endpoints | Reuse tenant defaults and snapshot effective settings on orders/receipts. Add branch overrides only when explicitly required. | Existing public storefront settings and checkout contract remain stable. |
| Branch management | No branch model, route, or dashboard page found | Add branch schema/API/page, default-branch backfill, and memberships. | Branch is an operational child of a tenant, not a separate tenant/store. |
| Products/categories/variants | `Product`, `Variant`, category/brand controllers and dashboard screens | Continue using the same product and SKU; make stock visibility branch-aware. | Never clone products per branch. |
| Inventory | `Variant.stock`, `InventoryLog`, variant stock adjustment, stock report | Introduce branch balance and movement ledger; migrate current stock and route all future writes through one service. | Keep old stock APIs compatible while switching; no split source of truth. |
| Suppliers and receiving | `Supplier`, variant `supplierId`, supplier UI; no purchase order/receipt models found | Reuse suppliers and variants; add purchase documents, partial receipt and ledger movements. | Do not add a duplicate supplier record or change variant identity. |
| Customers | `Customer`, `Address`, order snapshots, customer list/analytics/detail | POS uses existing customer lookup/create flow and saves order snapshots. | No duplicate POS customer model. Allow walk-in sales without forcing a profile if product policy permits. |
| Ecommerce orders | `Order`, `OrderItem`, order status/history, order list/detail pages | Extend with `source=ONLINE` default and optional branch/register context; POS creates the same order aggregate. | Preserve `/api/orders/checkout`, historical orders, status transitions, and storefront-facing response shape. |
| Payments/invoices | `PaymentTransaction`, payment controller, `invoiceService`, PDF/email routes | Add POS tender details under existing order payments; reuse invoice/receipt code with POS-specific output only as needed. | Do not add another payment or invoice system. Tenant onboarding payment is distinct from customer order payments. |
| Returns/refunds | `ReturnRequest`, `Refund`, status/refund UI and controller | Add restock disposition/branch and create compensating stock movement when approved. | Existing public request/tracking and refund semantics remain. |
| Shipping/delivery | `ShippingMethod`, `Courier`, Steadfast routes, order delivery fields/status | Add assignment/dispatch lifecycle that references existing order/courier; centralize status mapping. | Do not duplicate courier credentials, replace provider integrations, or make POS pickup require a delivery. |
| Expenses/reporting | `Expense`, expense UI, dashboard stats | Reuse expenses; add branch association only for newly recorded branch expense. Derive sales/inventory metrics from source records. | Existing expense and dashboard endpoints continue to work. |
| Frontend shell/design | Next.js App Router, `app/dashboard/layout.tsx`, `Sidebar.tsx`, `LanguageContext`, toast helpers | Add nested dashboard pages and navigation entries, use current API client and protected layout. | No standalone app or duplicate design system. |

## Relevant existing files

### Frontend

- Dashboard routes: `app/dashboard/orders`, `product`, `variants`, `customers`, `suppliers`, `couriers`, `shipping-methods`, `payments`, `expenses`, `returns`, and `settings`.
- Dashboard composition/navigation: `app/dashboard/layout.tsx`, `components/dashboard/Sidebar.tsx`, `components/dashboard/ProtectedRoute.tsx`.
- Authentication and API transport: `contexts/AuthContext.tsx`, `lib/auth.ts`, `lib/api.ts`.
- Shared domain types: `types/index.ts`.
- Product and order examples: `app/dashboard/product/page.tsx`, `app/dashboard/orders/page.tsx`, `app/dashboard/orders/[id]/page.tsx`.

### Backend

- Schema and Prisma client: `../backend/prisma/schema.prisma`, `../backend/models/index.js`.
- API mounting: `../backend/server.js`; routes are in `../backend/routes`.
- Tenant/auth middleware: `../backend/middleware/authMiddleware.js`, `../backend/middleware/requireActiveTenant.js`.
- Existing order and stock lifecycle: `../backend/controllers/orderController.js`, `../backend/controllers/inventoryController.js`, `../backend/controllers/variantController.js`.
- Existing purchasing-related records: `../backend/controllers/supplierController.js`, `../backend/controllers/expenseController.js`.
- Existing delivery and return lifecycle: `../backend/controllers/courierController.js`, `../backend/controllers/steadfastController.js`, `../backend/controllers/returnController.js`.
- Existing payment, tenant activation, and user workflows: `../backend/controllers/paymentController.js`, `../backend/controllers/tenantController.js`, `../backend/controllers/userController.js`.

## Important integration gaps to resolve during implementation

1. `Variant.stock` is global per variant, and inventory reports currently choose a single product before reporting. Replace that logic with tenant-wide branch queries; preserve an aggregate compatibility result where required.
2. Order status confirmation checks stock before running its transaction. The new inventory service must perform availability checks and balance writes atomically to avoid concurrent oversell.
3. Tenant-scoped `User.role` is not a complete staff permission system. User status/deletion mutations must be authorized and tenant-scoped before branch users are enabled.
4. The current role and order source are strings/status values. Add validated enums/transition policy without changing legacy ecommerce status values unexpectedly.
5. Tenant `featureFlags` is read as JSON in some controllers but may be stored as a JSON object; normalize once and share the parser/entitlement service.
6. Existing backend migrations should be inspected and applied against a staging database before a stock backfill; do not execute the seed script against production data.
7. This workspace has pre-existing local changes in the frontend `README.md` and `lib/api.ts`, and the sibling backend has local changes including `server.js`. Those changes are intentionally not modified by this assessment.

