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