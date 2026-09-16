# SmartESH v45 QPay + Premium
Production flow based on QPay Merchant V2:
1. Server obtains/refreshes access token.
2. Server creates invoice with unique sender invoice number.
3. Browser shows returned QR/deeplinks.
4. QPay calls the public HTTPS callback after payment.
5. After callback, SmartESH server calls QPay payment check.
6. Validate invoice, expected amount, user/plan and duplicate processing.
7. Only verified payment creates or extends a 365-day entitlement.
8. Active renewal extends from current expiry; expired renewal starts from verified payment time.
Never trust a browser success state and never expose QPay credentials in browser code.
