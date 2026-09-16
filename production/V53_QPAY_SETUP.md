# SmartESH v53 — QPay Production Setup

## 1. Supabase
Run `production/v53_qpay_payment.sql` once.

## 2. Vercel Environment Variables
Keep the existing:
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

Add server-only:
- `SUPABASE_SERVICE_ROLE_KEY`
- `QPAY_CLIENT_ID`
- `QPAY_CLIENT_SECRET`
- `QPAY_INVOICE_CODE`
- `PUBLIC_SITE_URL` (for example your production https://...vercel.app domain)

Optional:
- `QPAY_BASE_URL=https://merchant.qpay.mn`
- for sandbox: `https://merchant-sandbox.qpay.mn`

Never put QPay Client Secret or Supabase Service Role Key in browser code.

## 3. Flow
User chooses annual plan → Vercel server creates QPay invoice → QR/deeplinks shown →
QPay callback reaches `/api/qpay-callback` → server calls QPay `/v2/payment/check` →
server validates paid amount and payment → 365-day entitlement is created/extended.

The browser `Төлбөр шалгах` button only reads SmartESH's verified database status.
It does not poll QPay directly and cannot grant Premium by itself.
