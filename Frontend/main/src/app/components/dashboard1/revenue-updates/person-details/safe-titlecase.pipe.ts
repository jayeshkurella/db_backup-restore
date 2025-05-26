import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'safeTitlecase'
  
})
export class SafeTitlecasePipe implements PipeTransform {
  transform(value: any, isTitleCase: boolean = true): string {
    // Check if value is null, undefined, or only whitespace
    if (value === null || value === undefined || value.trim?.() === '') {
      return 'N/A';
    }

    // Convert to string and trim
    let stringValue = String(value).trim();

    // Replace single underscore between two words with a space
    if (stringValue.includes('_')) {
      const parts = stringValue.split('_');
      if (parts.length === 2 && parts[0] && parts[1]) {
        stringValue = parts.join(' ');
      }
    }

    // Apply title case if requested
    if (isTitleCase) {
      return this.toTitleCase(stringValue);
    }

    return stringValue;
  }

  private toTitleCase(str: string): string {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }


}

@Pipe({
  name: 'stateAbbreviation'
})
export class StateAbbreviationPipe implements PipeTransform {
  private readonly stateAbbreviations: { [key: string]: string } = {
  // States
  'Andhra Pradesh': 'AP',
  'Arunachal Pradesh': 'AR',
  'Assam': 'AS',
  'Bihar': 'BR',
  'Chhattisgarh': 'CG',
  'Goa': 'GA',
  'Gujarat': 'GJ',
  'Haryana': 'HR',
  'Himachal Pradesh': 'HP',
  'Jharkhand': 'JH',
  'Karnataka': 'KA',
  'Kerala': 'KL',
  'Madhya Pradesh': 'MP',
  'Maharashtra': 'MH',
  'Manipur': 'MN',
  'Meghalaya': 'ML',
  'Mizoram': 'MZ',
  'Nagaland': 'NL',
  'Odisha': 'OR',
  'Punjab': 'PB',
  'Rajasthan': 'RJ',
  'Sikkim': 'SK',
  'Tamil Nadu': 'TN',
  'Telangana': 'TG',
  'Tripura': 'TR',
  'Uttar Pradesh': 'UP',
  'Uttarakhand': 'UK',
  'West Bengal': 'WB',

  // Union Territories
  'Andaman and Nicobar Islands': 'AN',
  'Chandigarh': 'CH',
  'Dadra and Nagar Haveli and Daman and Diu': 'DN',
  'Delhi': 'DL',
  'Jammu and Kashmir': 'JK',
  'Ladakh': 'LA',
  'Lakshadweep': 'LD',
  'Puducherry': 'PY'
};


  transform(state: string): string {
    return this.stateAbbreviations[state] || state;
  }
}