# Constraints — 0002 Production Ready

## Security
- NEVER store eToro API keys in localStorage or client-readable cookies
- All eToro API calls MUST go through backend proxy routes
- Encrypt stored keys at rest using a server-side secret
- Sanitize all error messages before sending to client

## eToro API
- Use demo endpoints (`/demo/`) by default for all trading
- Always resolve instrumentId via search before trading — never hardcode IDs
- Include required headers: x-request-id (unique UUID), x-api-key, x-user-key
- Use PascalCase for trading request bodies (InstrumentID, IsBuy, Leverage, Amount)

## UX
- Trade confirmation dialog is MANDATORY before executing any trade
- Show clear demo/real mode indicator
- Toast notifications for all trade/watchlist actions
- Loading states for all async operations
- Maintain eToro design system consistency
