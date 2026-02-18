import { TiraValidationError } from '../errors.js';
import type { TaxCharged } from '../types/common.js';

export function validateRequired(value: unknown, fieldName: string): void {
  if (value === undefined || value === null || value === '') {
    throw new TiraValidationError(
      `${fieldName} is required.`,
      fieldName
    );
  }
}

export function validateEnum(value: string, options: Record<string, string>, fieldName: string): void {
  const allowed = Object.keys(options);
  if (!allowed.includes(value)) {
    const formatted = allowed.map(v => `'${v}' (${options[v]})`).join(', ');
    throw new TiraValidationError(
      `${fieldName} must be one of: ${formatted}.`,
      fieldName
    );
  }
}

export function validatePositiveNumber(value: number, fieldName: string): void {
  if (isNaN(value) || value <= 0) {
    throw new TiraValidationError(
      `${fieldName} must be a positive number.`,
      fieldName
    );
  }
}

export function validateNumber(value: number, fieldName: string): void {
  if (isNaN(value)) {
    throw new TiraValidationError(
      `${fieldName} must be a valid number.`,
      fieldName
    );
  }
}

export function validateDateString(value: string, fieldName: string): void {
  if (isNaN(Date.parse(value))) {
    throw new TiraValidationError(
      `${fieldName} must be a valid date string.`,
      fieldName
    );
  }
}

export function validateDateRange(startDate: string, endDate: string): void {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end <= start) {
    throw new TiraValidationError(
      'End date must be after start date.',
      'covernote_end_date'
    );
  }
}

export function validatePhoneNumber(value: string, fieldName: string): void {
  if (!/^\d{12}$/.test(value)) {
    throw new TiraValidationError(
      `${fieldName} must be 12 digits (e.g., 2557XXXXXXXX).`,
      fieldName
    );
  }
}

export function validateEmail(value: string, fieldName: string): void {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new TiraValidationError(
      `${fieldName} is not a valid email address.`,
      fieldName
    );
  }
}

export function validateUrl(value: string, fieldName: string): void {
  if (typeof value !== 'string' || (!value.startsWith('http://') && !value.startsWith('https://'))) {
    throw new TiraValidationError(
      `${fieldName} must be a valid HTTP or HTTPS URL.`,
      fieldName
    );
  }
}

export function validateTaxesCharged(taxes: TaxCharged[], parentLabel: string): void {
  if (!Array.isArray(taxes) || taxes.length === 0) {
    throw new TiraValidationError(
      `At least one tax entry is required in taxes_charged for ${parentLabel}.`,
      `${parentLabel}.taxes_charged`
    );
  }

  for (let i = 0; i < taxes.length; i++) {
    const t = taxes[i]!;
    const label = `${parentLabel}.taxes_charged[${i}]`;

    validateRequired(t.tax_code, `${label}.tax_code`);
    validateEnum(t.is_tax_exempted, { 'Y': 'Yes', 'N': 'No' }, `${label}.is_tax_exempted`);

    if (t.is_tax_exempted === 'Y') {
      if (!t.tax_exemption_type || !['1', '2'].includes(t.tax_exemption_type)) {
        throw new TiraValidationError(
          `Tax exemption type is required when tax is exempted and must be '1' (Policy Holder Exempted) or '2' (Risk Exempted).`,
          `${label}.tax_exemption_type`
        );
      }
      validateRequired(t.tax_exemption_reference, `${label}.tax_exemption_reference`);
    }

    validateNumber(t.tax_rate, `${label}.tax_rate`);
    validateNumber(t.tax_amount, `${label}.tax_amount`);
  }
}
