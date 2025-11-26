
export type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

export const success = <T>(value: T): Result<T, never> => ({ success: true, value });
export const failure = <E extends Error>(error: E): Result<never, E> => ({ success: false, error });

export function fail(message: string): never {
  throw new Error(message);
}

export interface GbpToEurRate {
  period: string;
  rate: number;
}

export interface RatesApiResponse {
  data: GbpToEurRate[];
}

export interface RentalDto {
  PROPERTY: string;
  NUMBER: number;
  DATE: string;
  TYPE: string;
  SUBTYPE: string;
  DESCRIPTION: string;
  COMMENTS: string;
  AMOUNT: number;
  PERIOD: string;
  UK_TAX_YEAR: string;
  FR_TAX_YEAR: number;
}

export interface RentalItem {
  property: string;
  identifier: string;
  date: Date;
  type: string;
  subType: string;
  description: string;
  comments: string;
  gbpEurRate: number;
  amount: number;
  amountAllocationInGpb: number;
  amountAllocationInEur: number;
  period: string;
  ukTaxYear: string;
  frTaxYear: string;
}

export interface ModelParameters {
  periodName: string;
  chippenhamAllocation: 0 | 50 | 100;
  meadowcroftAllocation: 0 | 100;
}

export interface SummaryModel {
  // for the items in the rentalMap we get the total income
  totalIncome?: ItemDetail;
  // for the items in the rentalMap we get the total expenses
  totalExpenses?: ItemDetail;
  // this is a list of the headers for the table. These are the
  // distinct list of item subtypes
  header?: string[];
  // this is the data for the table. The key is the period, the value is the RowModel
  periodBreakdownData?: Record<string, RowModel>;
  // this is the summary total of all the indiviudal subTypes ( headings ). this allows
  // us to show the total for each subType across all periods
  categorySummaryData?: Record<string, ItemDetail>;
  // all the items in the summary keyed by identifier
  rentalItemMap?: Record<string, RentalItem>
  // whether this summaryModel is valid
  success: boolean
  // id the summaryModel is not valid, this is the error message
  error: string
}

// This represents an item, its value in GBP and EUR, and its constituent identifiers
// that make up its value. Identifiers allow us to find the source of the item in the rentalItemMap
export interface ItemDetail {
  amountInGbp: number;
  amountInEur: number;
  identifiers: string[];
}

// This represents a row in the table, with a period and a collection of items
export interface RowModel {
  // montly period
  period: string;
  // row of items. this is keyed by the item subtype and the ItemDetail represents
  // the amount in both EUR and GBP and all the identifiers that make up the item
  items: Record<string, ItemDetail>;
  // this is the total income for the period
  totalIncome: ItemDetail;
  // this is the total expenses for the period - calcuated by adding all the non-income
  // items in the row
  totalExpenses: ItemDetail;
}

export interface ValueLabel {
  value: string;
  label: string;
}

export function getTaxYearFilterValues(): ValueLabel[] {
  let valuesLabels: ValueLabel[] = [];
  const currentYear = new Date().getFullYear();
  for (let year = 2022; year <= currentYear; year++) {
    valuesLabels.push({ value: `UK:${year}-${year + 1}`, label: `UK tax year ${year}-${year + 1}` });
  }

  for (let year = 2022; year <= currentYear; year++) {
    valuesLabels.push({ value: `FR:${year}`, label: `FR tax year ${year}` });
  }

  return valuesLabels;
}

export function formatItemDetail(itemDetail: ItemDetail, currency: 'EUR' | 'GBP',
  displaySymbol: boolean = false): string {
  const amount = currency === 'EUR' ? itemDetail.amountInEur : itemDetail.amountInGbp;
  const formattedAmount = amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const symbol = currency === 'EUR' ? '€' : '£';
  return displaySymbol ? `${symbol}${formattedAmount}` : formattedAmount;
}
