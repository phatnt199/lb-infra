"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSchemaObject = exports.getNumberValue = exports.toStringDecimal = exports.float = exports.int = exports.isFloat = exports.isInt = exports.keysToCamel = exports.toCamel = exports.getUID = exports.parseMultipartBody = void 0;
const get_1 = __importDefault(require("lodash/get"));
const round_1 = __importDefault(require("lodash/round"));
const multer_1 = __importDefault(require("multer"));
const rest_1 = require("@loopback/rest");
// -------------------------------------------------------------------------
const INTL_0_DIGITS_FORMATER = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
});
const INTL_2_DIGITS_FORMATER = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
});
// -------------------------------------------------------------------------
const parseMultipartBody = (opts) => {
    const { storage: cStorage, request, response } = opts;
    const storage = cStorage !== null && cStorage !== void 0 ? cStorage : multer_1.default.memoryStorage();
    const upload = (0, multer_1.default)({ storage });
    return new Promise((resolve, reject) => {
        upload.any()(request, response, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(request.files);
        });
    });
};
exports.parseMultipartBody = parseMultipartBody;
// -------------------------------------------------------------------------
const getUID = () => Math.random().toString(36).slice(2).toUpperCase();
exports.getUID = getUID;
// -------------------------------------------------------------------------
const toCamel = (s) => {
    return s.replace(/([-_][a-z])/gi, (sub) => {
        return sub.toUpperCase().replace('-', '').replace('_', '');
    });
};
exports.toCamel = toCamel;
// -------------------------------------------------------------------------
const keysToCamel = (object) => {
    const n = {};
    const keys = Object.keys(object);
    for (const key of keys) {
        const value = (0, get_1.default)(object, key);
        let valueType = typeof value;
        if (Array.isArray(value)) {
            valueType = 'array';
        }
        else if (value instanceof Date) {
            valueType = 'date';
        }
        switch (valueType) {
            case 'object': {
                if (!value) {
                    n[(0, exports.toCamel)(key)] = value;
                    break;
                }
                n[(0, exports.toCamel)(key)] = (0, exports.keysToCamel)(value);
                break;
            }
            /* case 'array': {
              n[toCamel(key)] = value;
              break;
            } */
            default: {
                n[(0, exports.toCamel)(key)] = value;
                break;
            }
        }
    }
    return n;
};
exports.keysToCamel = keysToCamel;
// -------------------------------------------------------------------------
const isInt = (n) => {
    if (isNaN(n)) {
        return false;
    }
    return Number.isInteger(n) || Math.floor(Number(n)) === n || Number(n) % 1 === 0;
};
exports.isInt = isInt;
// -------------------------------------------------------------------------
const isFloat = (input) => {
    if (isNaN(input)) {
        return false;
    }
    return Number(input) === input || Number(input) % 1 !== 0;
};
exports.isFloat = isFloat;
// -------------------------------------------------------------------------
const int = (input) => {
    var _a, _b;
    if (!input || isNaN(input)) {
        return 0;
    }
    const normalized = (_a = input === null || input === void 0 ? void 0 : input.toString()) === null || _a === void 0 ? void 0 : _a.replace(/,/g, '');
    return (_b = Number.parseInt(normalized, 10)) !== null && _b !== void 0 ? _b : 0;
};
exports.int = int;
// -------------------------------------------------------------------------
const float = (input, digit = 2) => {
    var _a;
    if (!input || isNaN(input)) {
        return 0;
    }
    const normalized = (_a = input === null || input === void 0 ? void 0 : input.toString()) === null || _a === void 0 ? void 0 : _a.replace(/,/g, '');
    return (0, round_1.default)(Number.parseFloat(normalized), digit);
};
exports.float = float;
// -------------------------------------------------------------------------
const toStringDecimal = (input, digit = 2, options = { localeFormat: true }) => {
    const { localeFormat } = options;
    if (isNaN(input)) {
        return 0;
    }
    let number = 0;
    if ((0, exports.isInt)(input)) {
        number = (0, exports.int)(input);
    }
    else {
        number = (0, exports.float)(input, digit);
    }
    if (!localeFormat) {
        return number.toFixed(digit);
    }
    if (Number.isInteger(number)) {
        return INTL_0_DIGITS_FORMATER.format(number);
    }
    if (digit === 2) {
        return INTL_2_DIGITS_FORMATER.format(number);
    }
    const formater = new Intl.NumberFormat('en-US', { maximumFractionDigits: digit, minimumFractionDigits: digit });
    return formater.format(number);
};
exports.toStringDecimal = toStringDecimal;
// -------------------------------------------------------------------------
const getNumberValue = (input, method = 'int') => {
    if (!input) {
        return 0;
    }
    let raw;
    switch (typeof input) {
        case 'string': {
            raw = input.replace(/,|\./gi, '');
            break;
        }
        default: {
            raw = input;
            break;
        }
    }
    switch (method) {
        case 'int': {
            return (0, exports.int)(raw);
        }
        default: {
            return (0, exports.float)(raw);
        }
    }
};
exports.getNumberValue = getNumberValue;
// -------------------------------------------------------------------------
const getSchemaObject = (ctor) => {
    const name = ctor.name;
    return (0, rest_1.getModelSchemaRef)(ctor).definitions[name];
};
exports.getSchemaObject = getSchemaObject;
//# sourceMappingURL=parse.utility.js.map