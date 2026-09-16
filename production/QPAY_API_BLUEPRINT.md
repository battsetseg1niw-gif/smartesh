# API
POST /payments/qpay/invoice
POST /webhooks/qpay
GET /me/entitlement
GET /admin/payments
POST /admin/entitlements/grant
POST /admin/entitlements/extend

QPay credentials remain server-side. Callback handling must be idempotent.
