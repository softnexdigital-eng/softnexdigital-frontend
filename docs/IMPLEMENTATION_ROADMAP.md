# Implementation Roadmap

## Delivery rule

Implement incrementally in the existing frontend and backend. Keep ecommerce order, cart, payment, invoice, customer, and courier behavior working throughout. Each phase should be deployable behind tenant feature entitlements and should include schema migration, API tests, UI, and regression tests before rollout.

## Phase 0 — Baseline and decisions

**Status: assessment completed; feature implementation not yet started.**

- Confirm product decisions listed in `UNIVERSAL_BUSINESS_ARCHITECTURE.md`: branch defaults, stock timing, tender methods, tax rules, cash sessions, and subscription entitlement source.
- Record current schema/database state in a staging environment; capture representative tenant/variant stock totals and existing online order flows.
- Define initial supported roles and branch capabilities. Avoid enabling staff access until backend authorization is enforced.

**Exit criteria:** approved operational policies, migration/backfill rehearsal, test tenant data baseline, and deployment/rollback plan.

## Phase 1 — Tenant branch and stock foundation

- Add tenant default branches, branch memberships, branch inventory balances, and append-only stock movements.
- Backfill each existing variant stock value as an opening balance into its tenant default branch.
- Add branch ownership validation and central inventory service.
- Migrate stock reads and all stock mutation paths, including variant adjustment, order confirmation/cancellation, returns, and low-stock reports.
- Preserve existing API payloads through a compatibility adapter while validating branch totals against legacy stock.
- Add branch management UI and branch-aware inventory views to the existing dashboard.

**Exit criteria:** ledger/balance consistency; no cross-tenant or cross-branch access; online order confirmation, cancellation, adjustment, and return regression tests pass; zero reconciliation drift in staging.

## Phase 2 — Purchasing and transfer operations

- Add purchase orders, line items, partial receiving, and supplier-linked receiving history.
- Add branch transfers with in-transit and received stages and paired ledger entries.
- Add supplier performance and receiving screens using existing suppliers.
- Add audit history, idempotency, and reconciliation reports.

**Exit criteria:** partial receipts and transfer retries cannot duplicate stock; cancelled/draft documents do not mutate balances; all receipt/transfer movements reconcile to balances.

## Phase 3 — POS and register

- Extend existing orders with source, optional branch/register/cashier fields and payment snapshots.
- Add authorized register opening/closing and cash movement history.
- Implement server-authoritative POS catalog, totals, discounts/tax policy, tenders, and sale idempotency.
- Reuse existing customers, order status/history, payment transactions, and invoice generation for receipt/lookup.
- Add POS UI in the existing protected dashboard; gate it by entitlement and branch membership.

**Exit criteria:** POS orders are ordinary compatible orders, retries create no duplicates, stock/payment/register changes commit atomically, receipts reconcile, and ecommerce remains unchanged.

## Phase 4 — Delivery and dispatch management

- Add dispatch/assignment records linked to existing orders and courier records.
- Provide branch queue, assignment, pickup/dispatch, exception, delivered/failed, and return-to-origin states.
- Reuse provider clients and map provider events through an idempotent transition service.
- Preserve existing tracking links and order status history.

**Exit criteria:** duplicate/out-of-order callbacks do not regress state, assignment and order status remain consistent, existing Steadfast/manual flows remain operable.

## Phase 5 — Business reporting, entitlements, and release hardening

- Add tenant/branch sales, inventory, purchase, cash, and delivery reports with consistent timezone/currency handling.
- Normalize `featureFlags` and centralize package/feature entitlements. Avoid UI-only gating.
- Add role/capability administration only after server enforcement and audit requirements are defined.
- Add performance/index review, migration rehearsal, backups/rollback tests, operational alerts, and tenant-by-tenant rollout.

**Exit criteria:** report totals reconcile to orders, payments, stock ledger, purchases, cash movements, and delivery assignments; paid features are consistently enforced on API and UI; production rollback is rehearsed.

## Cross-phase quality gates

- Prisma migration applies to a recent staging snapshot and has an explicit rollback/recovery plan.
- API tests cover tenant boundary, role, branch membership, status transitions, concurrency, and retries.
- Frontend tests/build/lint cover each changed page and shared navigation.
- Existing auth, public storefront, ecommerce checkout, customer history, invoice, refund, and courier tests remain green.
- No migration deletes historical sales, stock logs, returns, or payment records.
- Every deployment includes dashboards for migration errors, inventory reconciliation drift, duplicate requests, and failed provider events.

