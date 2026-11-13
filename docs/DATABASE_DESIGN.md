# Database Design: Universal Business Management

## Design status

This is the proposed extension to the existing PostgreSQL/Prisma schema. It is not a migration and does not claim that the proposed models exist. Existing models remain the source of identity for tenants, catalog, orders, customers, payments, suppliers, returns, and courier integrations.

## Existing schema reused

| Existing model | Reuse |
|---|---|
| `Tenant`, `User` | Tenant ownership and authenticated actors. Extend user access with branch memberships instead of adding another account system. |
| `Product`, `Variant` | Catalog identity, SKU, price, attributes, and supplier association. |
| `Customer`, `Address` | Customer profiles and delivery addresses. |
| `Order`, `OrderItem`, `OrderStatusHistory` | Ecommerce and POS sales, receipts, customer history, delivery lifecycle. |
| `InventoryLog` | Legacy stock log. Keep readable during migration; new stock mutations use the proposed complete ledger. |
| `PaymentTransaction` | Existing order payment record; extend/add tender details without introducing a second order payment owner. |
| `Supplier`, `Expense` | Supplier identity and operating expenses. |
| `ReturnRequest`, `Refund` | Existing customer return and refund lifecycle. |
| `Courier`, `ShippingMethod` | Provider configuration and shipping options. |

## Proposed model set

Names and fields below are logical design requirements; final Prisma naming should follow the repository's migration conventions.

### `Branch`

- `id`, `tenantId`, `name`, `code`, `status`, `isDefault`
- Address/contact fields and optional timezone override
- `createdAt`, `updatedAt`, optional soft-deactivation timestamp
- Unique `(tenantId, code)`; at most one default branch per tenant (enforce in service/migration if the Prisma/PostgreSQL partial unique index is required).
- Tenant relation; owned branch memberships, balances, stock movements, register sessions, orders, and purchases.

Create one default branch for each existing tenant. The initial backfill puts every existing variant's current stock into that branch. Keep inactive branches available for historical references but reject new business operations against them.

### `BranchMembership`

- `tenantId`, `branchId`, `userId`, `role`, `isActive`, `createdAt`
- Unique `(tenantId, branchId, userId)` and indexes for `(tenantId, userId)` and `(tenantId, branchId)`.
- A membership is valid only when branch and user belong to the same tenant.
- `role` should be an enum or validated capability set (for example `MANAGER`, `CASHIER`, `INVENTORY`, `DELIVERY`). Do not rely on arbitrary frontend role strings.

This model scopes staff to one or more branches while preserving the existing `User` and tenant login flow. Avoid a separate auth principal or duplicate user identity.

### `BranchInventory`

- `id`, `tenantId`, `branchId`, `variantId`
- `onHand Decimal(18,3)`, `reserved Decimal(18,3)`, `reorderPoint Decimal(18,3)` (or nullable)
- `updatedAt`
- Unique `(tenantId, branchId, variantId)`; index `(tenantId, variantId)` for cross-branch availability.
- `available` is derived as `onHand - reserved`; validate it cannot become negative unless tenant policy explicitly permits backorders.

The ledger is the audit source; this row is the transactional balance projection. New catalog variants should receive zeroed balances for active branches as needed. Do not copy all products/variants per branch.

### `StockMovement`

- `id`, `tenantId`, `branchId`, `variantId`
- `quantityDelta Decimal(18,3)`, `onHandAfter Decimal(18,3)`, `reason`, `occurredAt`
- Optional `actorUserId`, `orderId`, `purchaseOrderId`, `transferId`, `returnRequestId`, `reference`, `note`
- `idempotencyKey` scoped to tenant/operation (unique when present).
- Indexes `(tenantId, branchId, occurredAt)`, `(tenantId, variantId, occurredAt)`, `(tenantId, orderId)`.
- Append-only after creation; corrections use a compensating movement.

Use enumerated reasons: `OPENING_BALANCE`, `SALE`, `RECEIPT`, `TRANSFER_OUT`, `TRANSFER_IN`, `RETURN_RESTOCK`, `DAMAGE`, `ADJUSTMENT`, `RESERVATION`, and `RELEASE`. If reservations have separate balance events, identify their state unambiguously; do not count them as physical stock change.

### Order extensions and line snapshots

Add backward-compatible optional fields:

- `Order.source` defaulting existing rows to `ONLINE`; initial values `ONLINE`, `POS`, and optionally `PHONE`.
- Optional `Order.branchId`, `Order.registerSessionId`, `Order.cashierId`, `Order.idempotencyKey`.
- Optional order-level `taxAmount`/`taxRateSnapshot` and discount/tender snapshots if existing equivalents cannot preserve receipt calculations.
- Add `OrderItem` unit price, discount, tax, and display-name snapshots only where current snapshot data is insufficient. Preserve current `skuAtTime`, `attributes`, `priceAtTime`, and `total`.
- Index `(tenantId, source, createdAt)`, `(tenantId, branchId, createdAt)`, and unique tenant-scoped retry key.

Keep existing global `orderNumber` compatibility unless a safe backfill is agreed. Existing storefront flows must continue to create `ONLINE` orders without a branch until migration/feature rollout is complete.

### `RegisterSession`

- `id`, `tenantId`, `branchId`, `openedByUserId`, `closedByUserId`
- `status` (`OPEN`, `CLOSED`), `openedAt`, `closedAt`
- Opening/closing and expected cash amounts as decimal money; optional discrepancy note.
- Unique/open-session enforcement per register or cashier according to the confirmed operating rule.
- Index `(tenantId, branchId, status, openedAt)`.

### `CashMovement`

- `id`, `tenantId`, `branchId`, `registerSessionId`, `actorUserId`
- `type` (`OPENING_FLOAT`, `SALE_TENDER`, `CASH_IN`, `CASH_OUT`, `REFUND`, `CLOSE_ADJUSTMENT`)
- Decimal amount, currency, occurred time, optional `orderId`, `paymentTransactionId`, reason and idempotency key.
- Index `(tenantId, registerSessionId, occurredAt)`.

Cash movement history is append-only. A closing report is derived from session opening float, cash tenders, cash-ins/outs, and refunds rather than a mutable running total alone.

### `PurchaseOrder` and `PurchaseOrderItem`

- `PurchaseOrder`: tenant, supplier, receiving branch, unique human-readable purchase number, status, dates, currency, subtotal/tax/total, notes, creator and timestamps.
- Status lifecycle: `DRAFT -> SUBMITTED -> PARTIALLY_RECEIVED -> RECEIVED`; allow cancellation only where no receipt has been posted.
- `PurchaseOrderItem`: purchase, existing variant, ordered/received quantities, unit cost, tax/discount snapshot, SKU/name snapshot.
- Unique/order indexes scoped to tenant. Check all referenced supplier, branch, and variant ownership in the service transaction.
- Receiving event rows or a `PurchaseReceipt`/`PurchaseReceiptItem` pair are recommended if multiple partial receipts or audit-level receiving are required. Each receipt has an idempotency key and creates stock movements atomically.

### `StockTransfer` and `StockTransferItem`

- Transfer header: tenant, source branch, destination branch, status, initiator/receiver, timestamps and idempotency/reference.
- Transfer items: variant, requested/sent/received quantities.
- Lifecycle: `DRAFT -> IN_TRANSIT -> RECEIVED`; cancellation is allowed before posting only.
- Record `TRANSFER_OUT` at dispatch and `TRANSFER_IN` at receipt. The in-transit quantity remains visible until receipt or an explicitly audited exception. Do not perform a direct balance rewrite.

### Delivery assignment

Add a delivery assignment entity only for the dispatch lifecycle that cannot be represented safely by existing order fields:

- `id`, `tenantId`, `orderId`, optional `branchId`, optional existing `courierId`
- `status`, provider consignment/tracking identifiers, assignment actor, assigned/shipped/delivered timestamps, last provider event ID
- Unique provider event/consignment keys as supported by provider semantics.
- Index `(tenantId, status, createdAt)` and `(tenantId, orderId)`.

Continue using existing `Order.deliveryPartner`, tracking fields, and order status during compatibility rollout. A dispatch record must not become a second source of order status; define one service that synchronizes the historical order state and the assignment state.

## Tenant and referential integrity

- Every new tenant-owned table includes `tenantId`, even when `branchId` implies it.
- Service transactions validate that all referenced records share the authenticated tenant. Prefer composite foreign keys where practical; Prisma schema support and existing relation conventions must be checked before choosing them.
- Use `onDelete: Restrict` or soft deactivation for branches referenced by history. Do not cascade-delete sales, receipts, ledger, or register history.
- Add indexes for actual tenant-scoped list/report queries and enforce tenant-scoped uniqueness at the database layer.

## Migration and backfill

1. Add `Branch`, membership, balance, and stock movement tables without removing or renaming existing fields.
2. Create a default branch for each tenant. Use deterministic unique codes and preserve tenant timezone/address settings.
3. For each existing `Variant`, insert `BranchInventory.onHand = Variant.stock` and one `OPENING_BALANCE` movement, idempotently.
4. Add order source with `ONLINE` default and leave `branchId` null on existing ecommerce orders.
5. Compare sum of branch opening balances with legacy variant stock by tenant/variant; block cutover on any mismatch.
6. Switch stock APIs and all stock mutation paths to the transactional inventory service. Keep legacy `Variant.stock` synchronized only as a temporary compatibility projection.
7. Add purchases, POS, transfers, and delivery assignment in separate deployable migrations. Avoid destructive migration of historical rows.

## Consistency and numeric rules

New monetary and fractional quantity fields should use `Decimal`, not binary floating point. API serialization should return decimal values consistently (string or documented numeric conversion) and frontend formatting should convert at the display boundary. Define currency precision per tenant; do not assume two decimal places for all currencies. Validate quantity scale per product/unit before creating a movement.

