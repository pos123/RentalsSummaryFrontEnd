import type { Result, ModelParameters, RentalItem, SummaryModel, RowModel, ItemDetail }  from './common'
import { DataRetrieval } from './data-retrieval'
import { List } from 'linqts';


export class ReportingSummary {

  private static INCOME: string = "Income";
  private static EXPENSE: string = "Expense";
  private static RENT_AND_OTHER_INCOME: string = "Rent and other Income";
  private static REPAIRS_AND_MAINTENANCE: string = "Repairs and Maintenance";
  private static INSURANCE_AND_GROUND_RENT: string = "Insurance and Ground rent";
  private static PROFESSIONAL_FEES: string = "Professional Fees";
  private static FINANCE_COSTS: string = "Finance costs";
  private static OTHER_EXPENSES: string = "Other Expenses";
  private static ALL: string = "ALL";
  private static UK: string = "UK:";
  private static ALL_UK: string = "ALL_UK";
  private static ALL_FR: string = "ALL_FR";
  private static CHIPPENHAM: string = "CHIPPENHAM";
  private static MEADOWCROFT: string = "MEADOWCROFT";

  
  public async getModelData(parameters: ModelParameters): Promise<SummaryModel> {
    
    try {
      // 1. get data from server
      const refreshResult: Result<RentalItem[]> = await new DataRetrieval()
                                        .refreshData(parameters.chippenhamAllocation, parameters.meadowcroftAllocation);
      if (!refreshResult.success) return { success: false, error: refreshResult.error.message } as SummaryModel;
      

      // 2. filter data based on tax year range    
      const searchPeriod: string = parameters.periodName.substring(3).trim();
      const rentalItemsFiltered = new List<RentalItem>(refreshResult.value).Where(item => {
        // if ALL then return everything
        if (parameters.periodName.startsWith(ReportingSummary.ALL)) return true;
        
        if (parameters.periodName.startsWith(ReportingSummary.UK)) {
          return item.ukTaxYear === searchPeriod;
        } else {
          return item.frTaxYear === searchPeriod;
        }
      }).ToArray()
      
      // 3. create summary model to send back
      const summaryInfo: SummaryModel = {        
        // successful here an no error
        success: true,
        error: "",
        // total income and expenses
        totalIncome: this.sumItemAmount(rentalItemsFiltered, ReportingSummary.INCOME),
        totalExpenses: this.sumItemAmount(rentalItemsFiltered, ReportingSummary.EXPENSE),
        // header categories
        header: this.getCategoryList(),
        // period breakdown and category summary data
        periodBreakdownData: this.getPeriodBreakdownData(rentalItemsFiltered, parameters),
        categorySummaryData: this.getCategoryBreakdownData(rentalItemsFiltered),
        // map of rental items by identifier
        rentalItemMap: this.getRentalItemMap(rentalItemsFiltered)
      }
      
      return summaryInfo;

    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) } as SummaryModel;
    }
  }
    
  private getPeriodBreakdownData(rentalItems: RentalItem[], parameters: ModelParameters) : Record<string, RowModel> {
      
      const rowsSummaryModel = rentalItems.reduce((acc, item) => {
        
        try {
          let key = item.period;
          if (parameters.periodName.startsWith(ReportingSummary.ALL_UK)) key = item.ukTaxYear
          if (parameters.periodName.startsWith(ReportingSummary.ALL_FR)) key = item.frTaxYear
          
          if (!acc[key]) acc[key] = this.createEmptyRowModel(key);
          
          if (item.property === ReportingSummary.CHIPPENHAM && parameters.chippenhamAllocation === 0 )
            return acc;
          if (item.property === ReportingSummary.MEADOWCROFT && parameters.meadowcroftAllocation === 0 )
            return acc;

          // update totals and item detail for the category subtype
          acc[key].items[item.subType].amountInGbp += item.amountAllocationInGpb;
          acc[key].items[item.subType].amountInEur += item.amountAllocationInEur;
          acc[key].items[item.subType].identifiers.push(item.identifier);
          
          // update totals and item detail for the whole period/row
          if (item.type === ReportingSummary.INCOME){
            acc[key].totalIncome.amountInGbp += item.amountAllocationInGpb;
            acc[key].totalIncome.amountInEur += item.amountAllocationInEur;
            acc[key].totalIncome.identifiers.push(item.identifier);
          }
          else if (item.type === ReportingSummary.EXPENSE){
            acc[key].totalExpenses.amountInGbp += item.amountAllocationInGpb;
            acc[key].totalExpenses.amountInEur += item.amountAllocationInEur;
            acc[key].totalExpenses.identifiers.push(item.identifier);
          }    
          
          return acc;

        } catch (e) {
          
          console.error(`Error processing item ${item.identifier}:`, e);
          return acc;
        }
        
      }, {} as Record<string, RowModel>);
      
      return rowsSummaryModel;
  }

  private getCategoryBreakdownData(items: RentalItem[]) : Record<string, ItemDetail> {
    let data: Record<string, ItemDetail> = {};
    for (const key of this.getCategoryList()) {
      // for each category, sum up amounts and collect itemm identifiers
      const filteredItems = new List<RentalItem>(items).Where(item => item.subType === key).ToArray();
      const totalGbp = filteredItems.reduce((sum, item) => sum + item.amountAllocationInGpb, 0);
      const totalEur = filteredItems.reduce((sum, item) => sum + item.amountAllocationInEur, 0);
      const componentIdentifiers = filteredItems.map(item => item.identifier);
      data[key] = {
        amountInGbp: totalGbp,
        amountInEur: totalEur,
        identifiers: componentIdentifiers
      };
    }
    return data
  }
  
  private getRentalItemMap(items: RentalItem[]) : Record<string, RentalItem> {
    // given the rental items create a map of identifier to rental items
    return items.reduce((acc, item) => {
      acc[item.identifier] = item;
      return acc; }, {} as Record<string, RentalItem>);
  }
  
  private sumItemAmount(rentalItems: RentalItem[], categoryType: string): ItemDetail {
      const summedItemDetail = rentalItems.reduce((acc, item) => {
        if (item.type === categoryType) {
          acc.amountInGbp += item.amountAllocationInGpb;
          acc.amountInEur += item.amountAllocationInEur;
          acc.identifiers.push(item.identifier);
        }
        return acc;            
      }, 
      {   amountInGbp: 0,
        amountInEur: 0,
        identifiers: [] 
      } as ItemDetail);
      return summedItemDetail;
  }
    
  private getCategoryList(): string[] {
      return [
        // income
        ReportingSummary.RENT_AND_OTHER_INCOME,
        // expenses
        ReportingSummary.REPAIRS_AND_MAINTENANCE,
        ReportingSummary.INSURANCE_AND_GROUND_RENT,
        ReportingSummary.PROFESSIONAL_FEES,
        ReportingSummary.FINANCE_COSTS,
        ReportingSummary.OTHER_EXPENSES
      ];
  }
  
  private createEmptyRowModel(period: string) : RowModel {
      return {
        period: period,
        items: Object.fromEntries(this.getCategoryList().map(key => [key, this.createEmptyItemDetail()])),
        totalIncome: this.createEmptyItemDetail(),
        totalExpenses: this.createEmptyItemDetail(),
      };
  }
  
  private createEmptyItemDetail() : ItemDetail {
      return {
        amountInGbp: 0,
        amountInEur: 0,
        identifiers: []
      };
  }
}
  