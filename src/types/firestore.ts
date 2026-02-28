export interface AuthWhitelistConfig {
  allowedEmails: string[];
}

export interface SettingsSystemDoc {
  exchangeRate: number;
  baseCurrency: "LBP" | "USD";
  timezone: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CatalogProviderDoc {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CatalogCategoryDoc {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CatalogProductDoc {
  id: string;
  name: string;
  providerId: string;
  categoryId: string;
  prices: {
    source: number;
    retail: number;
    wholesale: number;
  };
  isActive: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface LegacyTransactionDoc {
  customerName: string;
  provider: string;
  category: string;
  item: string;
  sourcePrice: number;
  sellPrice: number;
  revenue?: number;
  quantity?: number;
  date?: {
    toDate: () => Date;
  };
}

export interface CustomerDoc {
  displayName: string;
  normalizedName: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CustomerMonthEntry {
  entryId: string;
  customerName: string;
  customerId: string;
  provider: string;
  category: string;
  item: string;
  priceType: "retail" | "wholesale";
  quantity: number;
  sourcePrice: number;
  sellPrice: number;
  unitProfit: number;
  revenue: number;
  dateMs: number;
  createdAtMs: number;
}

export interface CustomerMonthTotals {
  quantity: number;
  totalCost: number;
  totalSales: number;
  totalProfit: number;
}

export interface CustomerMonthDoc {
  customerId: string;
  customerName: string;
  monthKey: string;
  entries: CustomerMonthEntry[];
  totals: CustomerMonthTotals;
  createdAt?: unknown;
  updatedAt?: unknown;
}
