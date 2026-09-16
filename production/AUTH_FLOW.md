# SmartESH v41 Authentication Flow

## Registration
1. User enters full name, email, password and chooses Student or Teacher.
2. Auth provider creates identity.
3. Email verification is required.
4. Server/database trigger creates `profiles` row using the authenticated user ID.
5. Public registration may create only `student` or `teacher`; never `admin`.
6. New account starts with Free access.
7. QPay or an authorized Admin grant creates/updates `entitlements`.

## Login
1. Auth provider validates email/password.
2. Browser receives a secure provider session.
3. App reads the user's `profiles.role`.
4. Role-based UI is rendered.
5. Every protected database operation is still checked by RLS/server authorization.

## Password reset
- User requests reset by email.
- Provider sends a short-lived recovery link/token.
- App never knows or stores the old password.

## Annual access
- Student: 10,000 MNT / 365 days.
- Teacher: 20,000 MNT / 365 days.
- Payment success in the browser is NOT sufficient.
- QPay webhook/server verification is required before entitlement activation.

## Admin accounts
Admin is an internal privileged role. Do not allow a registration form to choose Admin.
Create/promote Admin only through a protected operational process with audit logging.
