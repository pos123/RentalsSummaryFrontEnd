# Feature request: Add summary data to the "Summary" card


If you look at `+page.svelete` you will see the "Summary" card displayed which currently has no data displayed. What
we want in this feature is to display the data that is held in the variable `modelData` which is of type `SummaryModel`

see: `let modelData: SummaryModel = $state({} as SummaryModel);` in `page.svelte`

The `SummaryModel` type is defined in `src/lib/utils/common.ts` as follows

```typescript
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
```

So in the "Summary" card we want to display the data:

1. We need a toggle using svelte/shadcn library to switch between GBP and EUR display. The purpose of this toggle is to
allow the user to switch between the two currencies and view any amounts in the "Summary" card in one of those currencies.
Note: in the `ItemDetail` interface we have both the amount in GBP and EUR so we can use this to display the amounts in the
correct currency. We also have a function in `common.ts` called `formatItemDetail` that will render a string in the correct
currency, decimal places and with the correct symbol. The default will be GBP and when the user switch the toggle the remaining display should update accordingly.

2. We want to display total amounts first of all in the "Summary" card:
    - Total Income
    - Total Expenses
    - Total Net Income (Total Income - Total Expenses)

Within the `modelData` we have the `totalIncome` and `totalExpenses` properties which are of type `ItemDetail`. We can use these to display the total amounts and you can use the `formatItemDetail` function to format the amounts. Note: you will need
to calculate Total Net Income from the `totalIncome` and `totalExpenses` properties in the currency specified in the toggle.


I would like the display to be in the following format:

    Total Income       Total Expenses   Total Net Income 
    £1,000.00           £500.00         £500.00
    
I would like the values to be a bit bigger than the default text size as these are the headline figures


3. Now we need a table (use the shadcn/svelte table ) for the period breakdown of the data. This data is held in the `periodBreakdownData` property of the `SummaryModel` interface. The `headers` property of the `SummaryModel` interface contains the list of headers for the table. These are the distinct list of item subtypes. We want to display the data in the following format see `src/lib/utils/reporting-summary.ts`:

```typescript
  private static RENT_AND_OTHER_INCOME: string = "Rent and other Income";
  private static REPAIRS_AND_MAINTENANCE: string = "Repairs and Maintenance";
  private static INSURANCE_AND_GROUND_RENT: string = "Insurance and Ground rent";
  private static PROFESSIONAL_FEES: string = "Professional Fees";
  private static FINANCE_COSTS: string = "Finance costs";
  private static OTHER_EXPENSES: string = "Other Expenses";
```

    Period      'Rent and other Income'   'Repairs and Maintenance'  and so on...
    Jan-2024    £1,000.00                        £500.00
    Feb-2024    £1,000.00                        £500.00
    ...
    Total       £1,000.00                        £500.00

    Note: if any cell has zero for the amount then we should display nothing. Also all values should be centered within the cell including the headers. Also remove the 'and' and replace with & to save column width space

the final row of this table will be a summary row with the total for each column. We will need to calculate the totals for 
as we have them in the `periodBreakdownData` property of the `SummaryModel` interface.




