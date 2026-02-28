# Telecom Dashboard

Telecom Dashboard is a private operations app to manage telecom sales, customers, product pricing, and monthly profit tracking.

The main goal is to give a fast internal workflow for:
- adding sales entries
- managing providers/categories/products
- tracking profit in LBP with USD conversion from exchange rate
- reviewing monthly customer activity

## Core Purpose

This project is designed for daily business operations, not public self-service.
It focuses on:
- simple data entry
- strict access control (allowlisted emails)
- clean Firestore structure for long-term maintainability

## Tech Stack

- React + TypeScript
- Firebase Auth (email/password + Google)
- Firestore
- Styled Components + MUI

## Security Model

- Frontend Firebase config is loaded from `REACT_APP_FIREBASE_CONFIG_B64`
- CI deploy uses service-account credentials from GitHub Secrets
- Firestore access is restricted with rules + allowlisted emails:
  - `auth_whitelist/config -> allowedEmails`

## Firestore Structure

Main collections:
- `settings/system`
- `catalog_providers`
- `catalog_categories`
- `catalog_products`
- `customers/{customerId}/months/{YYYY-MM}`
- `auth_whitelist/config`

See detailed structure and scripts in:
- `FIRESTORE_DATA.md`

## Scripts

### App

- `npm start` — run local dev server
- `npm run build` — production build

## Local Setup

1. Install dependencies:
```bash
npm ci
```

2. Create `.env` (or use your existing one) with:
```bash
REACT_APP_FIREBASE_CONFIG_B64=...
```

3. Start app:
```bash
npm start
```

## Notes

- Profit is stored in LBP.
- USD values are derived using `settings/system.exchangeRate`.
- Product management (add/edit/remove) is available inside dashboard settings.
