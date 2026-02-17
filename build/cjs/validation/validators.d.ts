import type { TaxCharged } from '../types/common.js';
export declare function validateRequired(value: unknown, fieldName: string): void;
export declare function validateEnum(value: string, options: Record<string, string>, fieldName: string): void;
export declare function validatePositiveNumber(value: number, fieldName: string): void;
export declare function validateNumber(value: number, fieldName: string): void;
export declare function validateDateString(value: string, fieldName: string): void;
export declare function validateDateRange(startDate: string, endDate: string): void;
export declare function validatePhoneNumber(value: string, fieldName: string): void;
export declare function validateEmail(value: string, fieldName: string): void;
export declare function validateHttpsUrl(value: string, fieldName: string): void;
export declare function validateTaxesCharged(taxes: TaxCharged[], parentLabel: string): void;
//# sourceMappingURL=validators.d.ts.map