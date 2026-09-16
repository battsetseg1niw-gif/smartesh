# SmartESH v72 — Manual Bank Payment
- Student 10,000₮ / Teacher 20,000₮ / 365 days preserved.
- Bank details are Admin-configurable; no bank/account values are fabricated.
- User receives stable SmartESH transfer code from account UUID.
- Receipt accepts JPG/PNG <=5MB and uploads to private Supabase Storage bucket.
- User can only create own pending request with valid role price.
- Admin sees requests, opens signed receipt URL, approves/rejects.
- Approval RPC is admin-only, row-locks request, prevents double approval, grants/extends 365-day entitlement.
- QPay API files remain in project for possible future reactivation, but main payment UI uses manual bank transfer.
- Requires production/v72_manual_bank_payment.sql once before use.
