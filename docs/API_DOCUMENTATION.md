# API Documentation: Existing and Proposed Business APIs

## Status and conventions

This document records the current relevant API surface and the proposed additive routes. Proposed routes are design targets, not routes currently mounted in Express. All routes use the existing `/api` base URL. Protected tenant routes use the existing bearer JWT; tenant ID comes from the authenticated user, not request payloads. Responses follow the existing `{ success, data, message }` convention where applicable.

## Existing integration surface

### Authentication, tenant, dashboard

| Method | Path | Current purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Register/request OTP |
| `POST` | `/api/auth/verify` | Verify OTP and issue token |
| `POST` | `/api/auth/resend-otp` | Resend OTP |
| `POST` | `/api/auth/login-password` | Password login |
| `POST` | `/api/auth/forgot-password` | Request password reset |
| `POST` | `/api/auth/reset-password` | Reset password |
| `GET` | `/api/auth/me` | Current authenticated profile |
| `POST` | `/api/auth/set-password` | Set initial password |
| `POST` | `/api/auth/change-password` | Change password |
| `GET` | `/api/tenant/me` | Current tenant and tenant users |
| `GET` | `/api/dashboard/stats` | Tenant dashboard stats |

### Existing catalog, stock, and suppliers

| Method | Path | Current purpose |
|---|---|---|
| `GET`, `POST` | `/api/product` | List/create products |
| `GET`, `PUT`, `DELETE` | `/api/product/:id` | Read/update/delete product |
| `POST` | `/api/product/bulk/delete` | Bulk delete |
| `POST` | `/api/product/bulk/update-categories` | Bulk category update |
| `GET`, `POST` | `/api/variants` | List variants for a product/create variant |
| `POST` | `/api/variants/bulk/generate` | Generate variant combinations |
| `POST` | `/api/variants/bulk/upload` | CSV variant import |
| `GET` | `/api/variants/low-stock` | Low-stock variants |
| `PUT`, `DELETE` | `/api/variants/:id` | Update/delete variant |
| `POST` | `/api/variants/:id/adjust-stock` | Adjust aggregate variant stock |
| `GET` | `/api/inventory/logs` | Legacy stock history |
| `GET` | `/api/inventory/report` | Legacy variant stock report |
| `GET`, `POST` | `/api/suppliers` | List/create suppliers |
| `GET`, `PUT`, `DELETE` | `/api/suppliers/:id` | Read/update/delete supplier |

### Existing orders, payments, returns, delivery

| Method | Path | Current purpose |
|---|---|---|
| `GET`, `POST` | `/api/orders` | List orders/create admin order |
| `GET`, `PUT`, `DELETE` | `/api/orders/:id` | Read order/update status/delete order |
| `POST` | `/api/orders/checkout` | Ecommerce cart checkout |
| `POST` | `/api/orders/bulk` | Bulk confirm/cancel |
| `GET` | `/api/orders/:id/invoice` | Generate/download invoice |
| `POST` | `/api/orders/:id/send-invoice` | Send invoice email |
| `POST` | `/api/orders/:id/comment` | Add internal order comment |
| `GET` | `/api/customers` | List tenant customers |
| `GET` | `/api/customers/analytics` | Customer analytics |
| `GET`, `DELETE` | `/api/customers/:id` | Read/delete customer |
| `POST` | `/api/payment/submit` | Submit tenant account payment |
| `GET` | `/api/payment/admin/pending` | List pending tenant payments |
| `PATCH` | `/api/payment/admin/approve/:tenantId` | Approve tenant payment |
| `PATCH` | `/api/payment/admin/reject/:tenantId` | Reject tenant payment |
| `POST`, `GET` | `/api/returns` | Public return request and authenticated return list |
| `GET` | `/api/returns/track` | Public return tracking |
| `PATCH` | `/api/returns/:id/status` | Update return request status |
| `POST` | `/api/returns/:id/refund` | Create refund |
| `GET`, `POST`, `PUT`, `DELETE`, `PATCH` | `/api/couriers/*` | Tenant courier configuration |
| `POST` | `/api/steadfast/send-order`, `/bulk-send` | Send existing orders to Steadfast |
| `GET` | `/api/steadfast/status/*` | Query provider delivery status |
| `GET`, `POST` | `/api/steadfast/returns*`, `/payments*` | Existing provider return/payment operations |
| `GET`, `POST`, `PUT`, `DELETE` | `/api/shipping-methods/*` | Tenant shipping methods |

Other existing mounted prefixes include `/api/settings`, `/api/onboarding`, `/api/expenses`, `/api/reviews`, `/api/blocking`, `/api/categories`, `/api/cart`, `/api/wishlist`, `/api/coupons`, `/api/addresses`, `/api/brands`, `/api/banners`, `/api/notifications`, `/api/incomplete-checkouts`, `/api/webhooks`, and `/api/marketing/meta`.

## Proposed additive routes

Every proposed protected endpoint must apply authentication, active-tenant/feature entitlement, role capability, and tenant/branch ownership checks. Exact response envelopes and pagination should match neighboring controllers.

### Branches and access

| Method | Path | Purpose |
|---|---|---|
| `GET`, `POST` | `/api/branches` | List/create tenant branches |
| `GET`, `PATCH` | `/api/branches/:branchId` | Read/update a tenant branch |
| `PATCH` | `/api/branches/:branchId/status` | Activate/deactivate branch without deleting history |
| `GET`, `PUT` | `/api/branches/:branchId/members` | List/assign branch memberships |

### Stock and procurement

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/inventory/branches/:branchId/balances` | Paginated stock by branch, with search/reorder filters |
| `GET` | `/api/inventory/branches/:branchId/movements` | Auditable movement history by variant/reason/date |
| `POST` | `/api/inventory/branches/:branchId/adjustments` | Create a reasoned, idempotent adjustment |
| `GET`, `POST` | `/api/purchase-orders` | List/create purchase orders |
| `GET`, `PATCH` | `/api/purchase-orders/:purchaseOrderId` | Read/update a draft purchase |
| `POST` | `/api/purchase-orders/:purchaseOrderId/submit` | Submit purchase order |
| `POST` | `/api/purchase-orders/:purchaseOrderId/receipts` | Receive all/partial quantities with retry key |
| `GET`, `POST` | `/api/stock-transfers` | List/create branch transfers |
| `POST` | `/api/stock-transfers/:transferId/dispatch` | Dispatch validated quantities |
| `POST` | `/api/stock-transfers/:transferId/receive` | Receive quantities at destination |

### POS and register

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/pos/catalog?branchId=...` | Search sellable tenant products and branch availability |
| `POST` | `/api/pos/register-sessions` | Open an authorized branch register session |
| `GET` | `/api/pos/register-sessions/current?branchId=...` | Read current user's eligible open session |
| `POST` | `/api/pos/register-sessions/:sessionId/close` | Close session with counted cash and discrepancy |
| `POST` | `/api/pos/sales` | Create an idempotent POS sale using existing order/payment/stock services |
| `GET` | `/api/pos/register-sessions/:sessionId/summary` | Return tender and cash movement summary |

`POST /api/pos/sales` accepts branch/session, item variant IDs and quantities, optional existing customer ID or customer contact snapshot, discount/tax inputs within authorized policy, and one or more tender methods/amounts. It must not trust client-supplied prices, totals, tenant IDs, or payment status. The response includes the created existing `Order`, payment/tender details, receipt data, and updated availability.

### Delivery and business reporting

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/delivery/queue?branchId=...` | List orders awaiting assignment or action |
| `POST` | `/api/orders/:orderId/delivery-assignment` | Assign an existing order to an eligible courier/driver |
| `PATCH` | `/api/delivery/assignments/:assignmentId/status` | Update dispatch lifecycle with transition validation |
| `GET` | `/api/delivery/assignments/:assignmentId` | Read assignment and tracking details |
| `GET` | `/api/business/reports/sales` | Sales by date/source/branch/tender |
| `GET` | `/api/business/reports/inventory` | On-hand, reserved, stock value, reorder and movement summary |
| `GET` | `/api/business/reports/purchases` | Ordered/received quantities and supplier totals |
| `GET` | `/api/business/reports/delivery` | Delivery outcomes and time-in-state |

## Compatibility requirements

- Existing ecommerce checkout remains on `/api/orders/checkout`; it must continue to create an `ONLINE` order.
- Existing orders without a branch remain valid historical records.
- Existing order status, invoice, payment, return, courier, and shipment APIs remain supported while new screens are introduced.
- Current inventory endpoints should return a documented aggregate or a branch-required response after migration; never silently mix legacy stock and branch balances.
- Use HTTP `409` for duplicate idempotency keys with different request contents, invalid lifecycle transitions, and insufficient stock where that matches existing client error conventions; document the final convention before client integration.

## API validation and tests

##At minimum, integration tests should cover cross-tenant IDs, inactive branch and entitlement denial, insufficient inventory under concurrent checkout, idempotent retries, partial receiving, transfer dispatch/receipt, cash reconciliation, POS invoice compatibility, online checkout regression, and courier event retries.##

## API validation and tests

##At minimum, integration tests should cover cross-tenant IDs, inactive branch and entitlement denial, insufficient inventory under concurrent checkout, idempotent retries, partial receiving, transfer dispatch/receipt, cash reconciliation, POS invoice compatibility, online checkout regression, and courier event retries.##

