# Portal authentication

YUSFAITH uses Clerk for sign-in and sign-out. Application roles are stored on `UserProfile` in PostgreSQL. Clerk public metadata and any field a user can edit are not used to authorize portal access.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/portal` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/portal` |
| `PORTAL_ALLOW_DEMO_DATA` | Development only. When `true` and Clerk keys are absent, the portal can read seeded records as the demo operations profile. Ignored when `NODE_ENV` is `production`. |

Copy the names from `.env.example`. Restart the app after changing them.

## Setup

1. Create a Clerk application.
2. Set the keys and the sign-in URLs above.
3. In Clerk, enable email sign-in. The portal sign-in page is `/sign-in` and sign-out is the Clerk user button, which returns to `/`.
4. `src/proxy.ts` calls Clerk `auth.protect()` for `/portal` when both keys are set.
5. After the first sign-in, insert a `UserProfile` for that Clerk user id. The server synchronises the profile name and email from Clerk. It does not copy a role from the Clerk user.

```sql
INSERT INTO "UserProfile" ("id", "clerkUserId", "name", "email", "role", "active", "updatedAt")
VALUES ('profile_1', 'user_clerk_id', 'Ada Okonkwo', 'ada@example.com', 'SALES_OFFICER', true, CURRENT_TIMESTAMP);
```

Roles: `SUPER_ADMIN`, `OPERATIONS_MANAGER`, `SALES_OFFICER`, `WAREHOUSE_OFFICER`, `WHOLESALE_CUSTOMER`.

A wholesale profile must also set `customerId` to the buyer row that person may see. Without it, other customers' orders and quotations stay hidden. Changing an order or quote id in the URL does not reveal another buyer's record.

Set `active` to false to block a signed-in user. Inactive profiles cannot load records or run server actions.

## What each role can do

- Super Admin: full portal access, including settings, catalogue prices, stock movements, and approvals.
- Operations Manager: oversight, order approval, inventory visibility, and reports. Stock movements stay with warehouse staff.
- Sales Officer: customers, enquiries, quotations, and order creation. No approvals, reports, catalogue price edits, or stock movements.
- Warehouse Officer: inventory movements and fulfilment status updates after approval. No price edits and no order approval.
- Wholesale Customer: their own customer profile, orders, quotations, and the active catalogue.

`PORTAL_ALLOW_DEMO_DATA` does not authenticate anyone. Production with missing Clerk keys fails closed.
