"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMotorCoverNotePayload = validateMotorCoverNotePayload;
const validators_js_1 = require("./validators.js");
const errors_js_1 = require("../errors.js");
function validateMotorCoverNotePayload(payload) {
    // --- Top-level fields ---
    (0, validators_js_1.validateRequired)(payload.request_id, "request_id");
    (0, validators_js_1.validateRequired)(payload.callback_url, "callback_url");
    (0, validators_js_1.validateHttpsUrl)(payload.callback_url, "callback_url");
    (0, validators_js_1.validateRequired)(payload.insurer_company_code, "insurer_company_code");
    (0, validators_js_1.validateEnum)(payload.covernote_type, {
        '1': 'New',
        '2': 'Renewal',
        '3': 'Endorsement',
    }, "covernote_type");
    // Cover note number required for new and renewal (not endorsement)
    if (payload.covernote_type !== "3") {
        (0, validators_js_1.validateRequired)(payload.covernote_number, "covernote_number");
    }
    // Previous cover note required for renewal and endorsement
    if (payload.covernote_type !== "1") {
        (0, validators_js_1.validateRequired)(payload.previous_covernote_reference_number, "previous_covernote_reference_number");
    }
    (0, validators_js_1.validateRequired)(payload.sales_point_code, "sales_point_code");
    // Dates
    const startStr = typeof payload.covernote_start_date === "string"
        ? payload.covernote_start_date
        : payload.covernote_start_date.toISOString();
    const endStr = typeof payload.covernote_end_date === "string"
        ? payload.covernote_end_date
        : payload.covernote_end_date.toISOString();
    (0, validators_js_1.validateDateString)(startStr, "covernote_start_date");
    (0, validators_js_1.validateDateString)(endStr, "covernote_end_date");
    (0, validators_js_1.validateDateRange)(startStr, endStr);
    (0, validators_js_1.validateRequired)(payload.covernote_desc, "covernote_desc");
    (0, validators_js_1.validateRequired)(payload.operative_clause, "operative_clause");
    (0, validators_js_1.validateEnum)(payload.payment_mode, {
        '1': 'Cash',
        '2': 'Cheque',
        '3': 'EFT',
    }, "payment_mode");
    // Premiums
    (0, validators_js_1.validatePositiveNumber)(payload.total_premium_excluding_tax, "total_premium_excluding_tax");
    (0, validators_js_1.validatePositiveNumber)(payload.total_premium_including_tax, "total_premium_including_tax");
    if (payload.total_premium_including_tax < payload.total_premium_excluding_tax) {
        throw new errors_js_1.TiraValidationError("total_premium_including_tax must be greater than or equal to total_premium_excluding_tax.", "total_premium_including_tax");
    }
    (0, validators_js_1.validateRequired)(payload.officer_name, "officer_name");
    (0, validators_js_1.validateRequired)(payload.officer_title, "officer_title");
    (0, validators_js_1.validateRequired)(payload.product_code, "product_code");
    // Endorsement fields
    if (payload.covernote_type === "3") {
        if (!payload.endorsement_type) {
            throw new errors_js_1.TiraValidationError("Endorsement type is required for endorsements.", "endorsement_type");
        }
        (0, validators_js_1.validateEnum)(payload.endorsement_type, {
            '1': 'Increasing Premium',
            '2': 'Decreasing Premium',
            '3': 'Cover Details Changed',
            '4': 'Cancellation',
        }, "endorsement_type");
        (0, validators_js_1.validateRequired)(payload.endorsement_reason, "endorsement_reason");
    }
    // --- Risks Covered ---
    if (!Array.isArray(payload.risks_covered) ||
        payload.risks_covered.length === 0) {
        throw new errors_js_1.TiraValidationError("At least one risk must be provided.", "risks_covered");
    }
    for (let i = 0; i < payload.risks_covered.length; i++) {
        const r = payload.risks_covered[i];
        const label = `risks_covered[${i}]`;
        (0, validators_js_1.validateRequired)(r.risk_code, `${label}.risk_code`);
        (0, validators_js_1.validateNumber)(r.sum_insured, `${label}.sum_insured`);
        (0, validators_js_1.validateNumber)(r.sum_insured_equivalent, `${label}.sum_insured_equivalent`);
        (0, validators_js_1.validateNumber)(r.premium_rate, `${label}.premium_rate`);
        (0, validators_js_1.validateNumber)(r.premium_before_discount, `${label}.premium_before_discount`);
        (0, validators_js_1.validateNumber)(r.premium_after_discount, `${label}.premium_after_discount`);
        (0, validators_js_1.validateNumber)(r.premium_excluding_tax_equivalent, `${label}.premium_excluding_tax_equivalent`);
        (0, validators_js_1.validateNumber)(r.premium_including_tax, `${label}.premium_including_tax`);
        // Discounts - optional but validate if present
        if (r.discounts_offered) {
            if (!Array.isArray(r.discounts_offered)) {
                throw new errors_js_1.TiraValidationError("discounts_offered must be an array.", `${label}.discounts_offered`);
            }
            for (let j = 0; j < r.discounts_offered.length; j++) {
                const d = r.discounts_offered[j];
                const dLabel = `${label}.discounts_offered[${j}]`;
                (0, validators_js_1.validateEnum)(d.discount_type, { '1': 'Fleet Discount' }, `${dLabel}.discount_type`);
                (0, validators_js_1.validateNumber)(d.discount_rate, `${dLabel}.discount_rate`);
                (0, validators_js_1.validateNumber)(d.discount_amount, `${dLabel}.discount_amount`);
            }
        }
        (0, validators_js_1.validateTaxesCharged)(r.taxes_charged, label);
    }
    // --- Subject Matters ---
    if (!Array.isArray(payload.subject_matters_covered) ||
        payload.subject_matters_covered.length === 0) {
        throw new errors_js_1.TiraValidationError("At least one subject matter must be provided.", "subject_matters_covered");
    }
    for (let i = 0; i < payload.subject_matters_covered.length; i++) {
        const s = payload.subject_matters_covered[i];
        const label = `subject_matters_covered[${i}]`;
        (0, validators_js_1.validateRequired)(s.subject_matter_reference, `${label}.subject_matter_reference`);
        (0, validators_js_1.validateRequired)(s.subject_matter_desc, `${label}.subject_matter_desc`);
    }
    // --- Cover Note Addons (optional) ---
    if (payload.covernote_addons) {
        if (!Array.isArray(payload.covernote_addons)) {
            throw new errors_js_1.TiraValidationError("covernote_addons must be an array.", "covernote_addons");
        }
        for (let i = 0; i < payload.covernote_addons.length; i++) {
            const a = payload.covernote_addons[i];
            const label = `covernote_addons[${i}]`;
            (0, validators_js_1.validateRequired)(a.addon_reference, `${label}.addon_reference`);
            (0, validators_js_1.validateRequired)(a.addon_description, `${label}.addon_description`);
            (0, validators_js_1.validateNumber)(a.addon_amount, `${label}.addon_amount`);
            (0, validators_js_1.validateNumber)(a.addon_premium_rate, `${label}.addon_premium_rate`);
            (0, validators_js_1.validateNumber)(a.premium_excluding_tax, `${label}.premium_excluding_tax`);
            (0, validators_js_1.validateNumber)(a.premium_excluding_tax_equivalent, `${label}.premium_excluding_tax_equivalent`);
            (0, validators_js_1.validateNumber)(a.premium_including_tax, `${label}.premium_including_tax`);
            (0, validators_js_1.validateTaxesCharged)(a.taxes_charged, label);
        }
    }
    // --- Policy Holders ---
    if (!Array.isArray(payload.policy_holders) ||
        payload.policy_holders.length === 0) {
        throw new errors_js_1.TiraValidationError("At least one policy holder must be provided.", "policy_holders");
    }
    for (let i = 0; i < payload.policy_holders.length; i++) {
        const p = payload.policy_holders[i];
        const label = `policy_holders[${i}]`;
        (0, validators_js_1.validateRequired)(p.policyholder_name, `${label}.policyholder_name`);
        (0, validators_js_1.validateDateString)(p.policyholder_birthdate, `${label}.policyholder_birthdate`);
        (0, validators_js_1.validateEnum)(p.policyholder_type, {
            '1': 'Individual',
            '2': 'Corporate',
        }, `${label}.policyholder_type`);
        (0, validators_js_1.validateEnum)(p.policyholder_id_type, {
            '1': 'NIDA',
            '2': 'Voters ID Card',
            '3': 'Passport',
            '4': 'Driving License',
            '5': 'Zanzibar ID',
            '6': 'TIN',
            '7': 'Company Incorporation Certificate Number',
        }, `${label}.policyholder_id_type`);
        (0, validators_js_1.validateRequired)(p.policyholder_id_number, `${label}.policyholder_id_number`);
        (0, validators_js_1.validateEnum)(p.gender, { 'M': 'Male', 'F': 'Female' }, `${label}.gender`);
        (0, validators_js_1.validateRequired)(p.region, `${label}.region`);
        (0, validators_js_1.validateRequired)(p.district, `${label}.district`);
        (0, validators_js_1.validateRequired)(p.street, `${label}.street`);
        (0, validators_js_1.validateRequired)(p.phone_number, `${label}.phone_number`);
        (0, validators_js_1.validatePhoneNumber)(p.phone_number, `${label}.phone_number`);
        (0, validators_js_1.validateRequired)(p.postal_address, `${label}.postal_address`);
        if (p.email_address) {
            (0, validators_js_1.validateEmail)(p.email_address, `${label}.email_address`);
        }
    }
    // --- Motor Details ---
    const m = payload.motor_details;
    (0, validators_js_1.validateEnum)(m.motor_category, {
        '1': 'Motor Vehicle',
        '2': 'Motor Cycle',
    }, "motor_details.motor_category");
    (0, validators_js_1.validateEnum)(m.motor_type, {
        '1': 'Registered',
        '2': 'In Transit',
    }, "motor_details.motor_type");
    if (m.motor_type === "1") {
        (0, validators_js_1.validateRequired)(m.registration_number, "motor_details.registration_number");
    }
    (0, validators_js_1.validateRequired)(m.chassis_number, "motor_details.chassis_number");
    (0, validators_js_1.validateRequired)(m.make, "motor_details.make");
    (0, validators_js_1.validateRequired)(m.model, "motor_details.model");
    (0, validators_js_1.validateRequired)(m.model_number, "motor_details.model_number");
    (0, validators_js_1.validateRequired)(m.body_type, "motor_details.body_type");
    (0, validators_js_1.validateRequired)(m.color, "motor_details.color");
    (0, validators_js_1.validateRequired)(m.engine_number, "motor_details.engine_number");
    (0, validators_js_1.validateRequired)(m.engine_capacity, "motor_details.engine_capacity");
    (0, validators_js_1.validateRequired)(m.fuel_used, "motor_details.fuel_used");
    // Axles, axle distance, sitting capacity required for motor vehicles (not motor cycles)
    if (m.motor_category === "1") {
        (0, validators_js_1.validateNumber)(m.number_of_axles, "motor_details.number_of_axles");
        (0, validators_js_1.validateNumber)(m.axle_distance, "motor_details.axle_distance");
        (0, validators_js_1.validateNumber)(m.sitting_capacity, "motor_details.sitting_capacity");
    }
    if (isNaN(m.year_of_manufacture) ||
        m.year_of_manufacture < 1900 ||
        m.year_of_manufacture > new Date().getFullYear() + 1) {
        throw new errors_js_1.TiraValidationError("A valid year of manufacture is required.", "motor_details.year_of_manufacture");
    }
    (0, validators_js_1.validatePositiveNumber)(m.tare_weight, "motor_details.tare_weight");
    (0, validators_js_1.validatePositiveNumber)(m.gross_weight, "motor_details.gross_weight");
    (0, validators_js_1.validateEnum)(m.motor_usage, {
        '1': 'Private',
        '2': 'Commercial',
    }, "motor_details.motor_usage");
    (0, validators_js_1.validateRequired)(m.owner_name, "motor_details.owner_name");
    (0, validators_js_1.validateEnum)(m.owner_category, {
        '1': 'Sole Proprietor',
        '2': 'Corporate',
    }, "motor_details.owner_category");
    (0, validators_js_1.validateRequired)(m.owner_address, "motor_details.owner_address");
}
//# sourceMappingURL=motor.js.map