
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
  totalIncome?: ItemDetail;
  totalExpenses?: ItemDetail;
  header?: string[];
  periodBreakdownData?: Record<string, RowModel>;
  categorySummaryData?: Record<string, ItemDetail>;
  rentalItemMap?: Record<string, RentalItem>
  success: boolean
  error: string
}

export interface ItemDetail {
  amountInGbp: number;
  amountInEur: number;
  identifiers: string[];
}

export interface RowModel {
  period: string;
  items: Record<string, ItemDetail>;
  totalIncome: ItemDetail;
  totalExpenses: ItemDetail;
}

export function getTaxYearFilterValues(): string[] {
  let values: string[] = [];
  const currentYear = new Date().getFullYear();
  // french
  for (let year = 2022; year <= currentYear; year++) {
     values.push(`FR: ${year}`);
     values.push(`UK: ${year}-${year + 1}`);
  }
  return values;
}
