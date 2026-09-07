# Update WhatsApp Checkout Message Format

## Goal
Rewrite the cart-to-WhatsApp message so it reads like the PLAIN Society membership pledge the user shared, and add a delivery address field to the checkout form.

## Changes

### 1. `src/lib/site.ts` — new `cartMessage` format
- Add optional parameters: `name`, `phone`, `address`.
- Keep the first product image URL at the very top so WhatsApp renders a preview.
- Replace the opening line with: `{brand} Society, I'm pledging my membership.`
- List each item as: `The {name} ({color} / {size}) is my entry piece.` (multiple items each get their own line).
- Keep the total line: `Total: $X (₦Y)`.
- Add pre-filled customer block:
  ```
  Name: {name or "[Insert name]"}
  Phone: {phone or "[Insert phone]"}
  Address: {address or "[Insert address]"}
  ```
- Close with: `Let me in. I'm ready.`

### 2. `src/components/site/CartSheet.tsx` — checkout form update
- Add an `address` state and a third input field for delivery address.
- Pass `name`, `phone`, and `address` into `cartMessage`.
- Remove the current manual `\nName: ...` and `\nPhone: ...` appending.
- Keep the existing `placeOrder` call and WhatsApp redirect flow unchanged.

## Out of scope
- No database or server changes.
- No changes to pricing, currency conversion, or order recording.
