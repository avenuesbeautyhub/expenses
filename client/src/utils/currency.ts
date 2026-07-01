import { CURRENCIES } from '../types';

export const getCurrencySymbol = (currencyCode: string): string => {
  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  return currency?.symbol || '$';
};
