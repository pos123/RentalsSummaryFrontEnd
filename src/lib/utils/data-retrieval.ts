import { List } from 'linqts';
import { success, failure, fail } from './common';
import type { Result, RentalItem, RentalDto, RatesApiResponse }  from './common';


export class DataRetrieval {
  
  private static URL_GET_RATES: string =
    'https://ecbapi.fusionconnect.top/api/ecb/range?yearFrom=XXXX' +
    '&monthFrom=01' +
    '&yearTo=YYYY' +
    '&monthTo=12' +
    '&useDefaultCurrentOnError=true';  
  private static URL_GET_RENTAL_DATA: string = 'https://rentaldata.fusionconnect.top/';
  private static CHIPPENHAM_PROPERTY_NAME: string = 'CHIPPENHAM';
  private static START_YEAR: string = "2015";
  
  async refreshData(chippenhamAllocation: number, meadowcroftAllocation: number) : Promise<Result<RentalItem[]>> {

    const [ratesMapResult, rentalDtosResult] = await Promise.all([this.fetchRates(), this.fetchRentalData()]);
    if (!ratesMapResult.success) return fail(ratesMapResult.error.message)
    const ratesMap = ratesMapResult.value;
    if (!rentalDtosResult.success) return fail(rentalDtosResult.error.message)
    const rentalDtos = rentalDtosResult.value;
    
    // map rental dtos to rental items
    let data = new List<RentalDto>(rentalDtos)
      .Where(item => item.TYPE != "Tax" && item.SUBTYPE != "Ignore")
      .Select(item => ( {
      
      // property name
      property: item.PROPERTY.toUpperCase(),
      // unique identifier ( property + number e.g. CHIPPENHAM-185 )
      identifier: item.PROPERTY.toUpperCase() + "-" + item.NUMBER,
      // date of transaction
      date: new Date(item.DATE),
      // type info
      type: item.TYPE,
      subType: item.SUBTYPE,
      // description
      description: item.DESCRIPTION,
      // comments
      comments: item.COMMENTS,
      // GBP to EUR rate for period
      gbpEurRate: ratesMap ? (ratesMap[item.PERIOD] || 1) : 1,
      // straight amount in GBP
      amount: item.AMOUNT,
      // straight amount after applying property allocation percentage in GBP
      amountAllocationInGpb: item.AMOUNT * (item.PROPERTY.toUpperCase() == DataRetrieval.CHIPPENHAM_PROPERTY_NAME
          ? chippenhamAllocation / 100 
          : meadowcroftAllocation / 100),
      
      // amount after applying property allocation percentage in EURO
      amountAllocationInEur: item.AMOUNT * (item.PROPERTY.toUpperCase() == DataRetrieval.CHIPPENHAM_PROPERTY_NAME
          ? chippenhamAllocation / 100 
          : meadowcroftAllocation / 100) * (ratesMap ? (ratesMap[item.PERIOD] || 1) : 1),
      
      // period i.e. year-month ( 2022-01 )
      period: item.PERIOD,
      // in the uk tax year format - 2024-2025 i.e. from april to april
      ukTaxYear: item.UK_TAX_YEAR.replace(" ", "").replace(" ", ""),
      // in the fr tax year is just the year
      frTaxYear: item.FR_TAX_YEAR.toString(10)
    })).ToArray();

    return success(data);
  }
  
  private async fetchRates(): Promise<Result<Record<string, number>>> {
    
    try 
    {
      const currentYear = new Date().getFullYear();
      let modifiedUrl: string = DataRetrieval.URL_GET_RATES
                                              .replace("XXXX", DataRetrieval.START_YEAR)
                                              .replace("YYYY", (currentYear + 1).toString(10));  
      const response = await fetch(modifiedUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const json = (await response.json()) as RatesApiResponse;

      // Convert array to dictionary
      const ratesMap: Record<string, number> = json.data.reduce((dict, rate) => {
        dict[rate.period] = rate.rate;
        return dict;
      }, {} as Record<string, number>);

      return success(ratesMap);
    }
    catch (e) {
       return failure(e instanceof Error ? e : new Error("fetching rates: " + String(e)));
    }
    
  }

  private async fetchRentalData() : Promise<Result<RentalDto[]>> {
    try {

      const response = await fetch(DataRetrieval.URL_GET_RENTAL_DATA);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const transactions = (await response.json()) as RentalDto[];
      return success(transactions);

    } catch (e) {
      return failure(e instanceof Error ? e : new Error("fetching rental data: " + String(e)));
    }
  }

}

