# Firestore Data Reference

This file documents the current Firestore structure used by the app.

## 1) Auth Allowlist

Path:
`auth_whitelist/config`

```json
{
  "allowedEmails": [
    "owner@yourcompany.com",
    "manager@yourcompany.com"
  ],
  "allowedDomains": [
    "yourcompany.com"
  ]
}
```

Notes:
- Firestore rules enforce `allowedEmails`.
- Login UI checks both `allowedEmails` and `allowedDomains`.

## 2) Settings

Path:
`settings/system`

```json
{
  "exchangeRate": 89500,
  "baseCurrency": "LBP",
  "timezone": "Asia/Beirut"
}
```

Used for:
- LBP -> USD conversion (`USD = LBP / exchangeRate`)
- Global app settings

## 3) Catalog Providers

Collection:
`catalog_providers`

Document example (`catalog_providers/touch`):

```json
{
  "id": "touch",
  "name": "touch",
  "isActive": true,
  "sortOrder": 0
}
```

## 4) Catalog Categories

Collection:
`catalog_categories`

Document example (`catalog_categories/lines`):

```json
{
  "id": "lines",
  "name": "lines",
  "isActive": true,
  "sortOrder": 0
}
```

## 5) Catalog Products

Collection:
`catalog_products`

Document example (`catalog_products/touch-lines-20usd-line`):

```json
{
  "id": "touch-lines-20usd-line",
  "name": "20usd-line",
  "providerId": "touch",
  "categoryId": "lines",
  "prices": {
    "source": 1500000,
    "retail": 1800000,
    "wholesale": 1700000
  },
  "isActive": true
}
```

Notes:
- Prices are stored in **LBP**.
- Product manager in settings can add/edit/remove these docs.

## 6) Customers

Collection:
`customers`

Document example (`customers/acme-sarl`):

```json
{
  "displayName": "Acme SARL",
  "normalizedName": "acme sarl"
}
```

## 7) Monthly Customer Entries

Subcollection:
`customers/{customerId}/months/{YYYY-MM}`

Document example (`customers/acme-sarl/months/2026-02`):

```json
{
  "customerId": "acme-sarl",
  "customerName": "Acme SARL",
  "monthKey": "2026-02",
  "entries": [
    {
      "entryId": "1739953100123-abc123xy",
      "customerName": "Acme SARL",
      "customerId": "acme-sarl",
      "provider": "touch",
      "category": "lines",
      "item": "20usd-line",
      "priceType": "retail",
      "quantity": 3,
      "sourcePrice": 1500000,
      "sellPrice": 1800000,
      "unitProfit": 300000,
      "unitProfitUsd": 3.35,
      "revenue": 900000,
      "revenueUsd": 10.06,
      "exchangeRate": 89500,
      "dateMs": 1767225600000,
      "createdAtMs": 1767225600123
    }
  ],
  "totals": {
    "quantity": 3,
    "totalCost": 4500000,
    "totalSales": 5400000,
    "totalProfit": 900000
  }
}
```

Notes:
- `revenue` and `unitProfit` are stored in **LBP**.
- USD values are derived with `exchangeRate`.

## 8) Useful Scripts

- `npm run seed:settings`
- `npm run migrate:firestore`
- `npm run cleanup:firestore:dry`
- `npm run cleanup:firestore`
