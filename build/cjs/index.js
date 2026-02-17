"use strict";
// This file is the main entry point for the Tira Node.js SDK. It exports the main Tira class, error classes, and type definitions for use in other parts of the application or by users of the SDK.
// Copyright (c) LABEDAN IT SOLUTIONS 2026. All rights reserved. See LICENSE file in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiraApiError = exports.TiraError = exports.Tira = void 0;
// RESOURCES:
var tira_js_1 = require("./tira.js");
Object.defineProperty(exports, "Tira", { enumerable: true, get: function () { return tira_js_1.Tira; } });
var errors_js_1 = require("./errors.js");
Object.defineProperty(exports, "TiraError", { enumerable: true, get: function () { return errors_js_1.TiraError; } });
Object.defineProperty(exports, "TiraApiError", { enumerable: true, get: function () { return errors_js_1.TiraApiError; } });
//# sourceMappingURL=index.js.map