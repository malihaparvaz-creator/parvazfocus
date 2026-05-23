/**
 * Real-time currency conversion using free API
 * Uses exchangerate-api.com free tier (unlimited free requests for common currencies)
 */

type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'JPY';

interface ExchangeRatesCache {
  rates: Record<CurrencyCode, number>;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

let ratesCache: ExchangeRatesCache | null = null;

// Fallback rates in case API fails (updated ~quarterly)
const FALLBACK_RATES: Record<CurrencyCode, number> = {
  INR: 1,
  USD: 83.42,
  EUR: 91.35,
  GBP: 105.28,
  AED: 22.70,
  JPY: 0.558,
};

/**
 * Fetch live exchange rates from public API
 * Uses ExchangeRate-API's free tier (1500 requests/month)
 */
async function fetchLiveRates(): Promise<Record<CurrencyCode, number>> {
  try {
    // Using exchangerate-api.com free endpoint (no API key needed for basic requests)
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.rates) {
      return {
        INR: 1,
        USD: parseFloat((1 / data.rates.USD).toFixed(4)),
        EUR: parseFloat((1 / data.rates.EUR).toFixed(4)),
        GBP: parseFloat((1 / data.rates.GBP).toFixed(4)),
        AED: parseFloat((1 / data.rates.AED).toFixed(4)),
        JPY: parseFloat((1 / data.rates.JPY).toFixed(4)),
      };
    }

    return FALLBACK_RATES;
  } catch (error) {
    console.warn('Failed to fetch live exchange rates, using fallback rates', error);
    return FALLBACK_RATES;
  }
}

/**
 * Get exchange rates with caching
 * Caches for 1 hour to minimize API calls
 */
export async function getExchangeRates(): Promise<Record<CurrencyCode, number>> {
  const now = Date.now();
  const CACHE_TTL = 60 * 60 * 1000; // 1 hour

  // Return cached rates if still valid
  if (ratesCache && now - ratesCache.timestamp < CACHE_TTL) {
    return ratesCache.rates;
  }

  // Fetch fresh rates
  const rates = await fetchLiveRates();

  // Update cache
  ratesCache = {
    rates,
    timestamp: now,
    ttl: CACHE_TTL,
  };

  return rates;
}

/**
 * Convert amount from one currency to another
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const rates = await getExchangeRates();

  // Convert to INR first, then to target currency
  const amountInINR = amount * rates[fromCurrency];
  const convertedAmount = amountInINR / rates[toCurrency];

  return parseFloat(convertedAmount.toFixed(2));
}

/**
 * Get current exchange rate between two currencies
 */
export async function getExchangeRate(
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return 1;
  }

  const rates = await getExchangeRates();

  // Calculate rate: how many units of toCurrency equal 1 unit of fromCurrency
  const rate = rates[fromCurrency] / rates[toCurrency];

  return parseFloat(rate.toFixed(4));
}

/**
 * Convert multiple currencies to INR (batch operation)
 */
export async function convertToINR(
  amount: number,
  currency: CurrencyCode
): Promise<number> {
  if (currency === 'INR') {
    return amount;
  }

  return convertCurrency(amount, currency, 'INR');
}

/**
 * Manually update rates cache (useful for testing)
 */
export function clearRatesCache(): void {
  ratesCache = null;
}
