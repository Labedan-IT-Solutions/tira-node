"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequired = validateRequired;
exports.validateEnum = validateEnum;
exports.validatePositiveNumber = validatePositiveNumber;
exports.validateNumber = validateNumber;
exports.validateDateString = validateDateString;
exports.validateDateRange = validateDateRange;
exports.validatePhoneNumber = validatePhoneNumber;
exports.validateEmail = validateEmail;
exports.validateHttpsUrl = validateHttpsUrl;
exports.validateTaxesCharged = validateTaxesCharged;
const errors_js_1 = require("../errors.js");
function validateRequired(value, fieldName) {
    if (value === undefined || value === null || value === '') {
        throw new errors_js_1.TiraValidationError(`${fieldName} is required.`, fieldName);
    }
}
function validateEnum(value, options, fieldName) {
    const allowed = Object.keys(options);
    if (!allowed.includes(value)) {
        const formatted = allowed.map(v => `'${v}' (${options[v]})`).join(', ');
        throw new errors_js_1.TiraValidationError(`${fieldName} must be one of: ${formatted}.`, fieldName);
    }
}
function validatePositiveNumber(value, fieldName) {
    if (isNaN(value) || value <= 0) {
        throw new errors_js_1.TiraValidationError(`${fieldName} must be a positive number.`, fieldName);
    }
}
function validateNumber(value, fieldName) {
    if (isNaN(value)) {
        throw new errors_js_1.TiraValidationError(`${fieldName} must be a valid number.`, fieldName);
    }
}
function validateDateString(value, fieldName) {
    if (isNaN(Date.parse(value))) {
        throw new errors_js_1.TiraValidationError(`${fieldName} must be a valid date string.`, fieldName);
    }
}
function validateDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
        throw new errors_js_1.TiraValidationError('End date must be after start date.', 'covernote_end_date');
    }
}
function validatePhoneNumber(value, fieldName) {
    if (!/^\d{12}$/.test(value)) {
        throw new errors_js_1.TiraValidationError(`${fieldName} must be 12 digits (e.g., 2557XXXXXXXX).`, fieldName);
    }
}
function validateEmail(value, fieldName) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        throw new errors_js_1.TiraValidationError(`${fieldName} is not a valid email address.`, fieldName);
    }
}
function validateHttpsUrl(value, fieldName) {
    if (typeof value !== 'string' || !value.startsWith('https://')) {
        throw new errors_js_1.TiraValidationError(`${fieldName} must be a valid HTTPS URL.`, fieldName);
    }
}
function validateTaxesCharged(taxes, parentLabel) {
    if (!Array.isArray(taxes) || taxes.length === 0) {
        throw new errors_js_1.TiraValidationError(`At least one tax entry is required in taxes_charged for ${parentLabel}.`, `${parentLabel}.taxes_charged`);
    }
    for (let i = 0; i < taxes.length; i++) {
        const t = taxes[i];
        const label = `${parentLabel}.taxes_charged[${i}]`;
        validateRequired(t.tax_code, `${label}.tax_code`);
        validateEnum(t.is_tax_exempted, { 'Y': 'Yes', 'N': 'No' }, `${label}.is_tax_exempted`);
        if (t.is_tax_exempted === 'Y') {
            if (!t.tax_exemption_type || !['1', '2'].includes(t.tax_exemption_type)) {
                throw new errors_js_1.TiraValidationError(`Tax exemption type is required when tax is exempted and must be '1' (Policy Holder Exempted) or '2' (Risk Exempted).`, `${label}.tax_exemption_type`);
            }
            validateRequired(t.tax_exemption_reference, `${label}.tax_exemption_reference`);
        }
        validateNumber(t.tax_rate, `${label}.tax_rate`);
        validateNumber(t.tax_amount, `${label}.tax_amount`);
    }
}
//# sourceMappingURL=validators.js.map