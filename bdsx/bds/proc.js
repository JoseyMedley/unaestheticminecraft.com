"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.procHacker = exports.proc2 = exports.proc = void 0;
const prochacker_1 = require("../prochacker");
const symbols = require("./symbols");
exports.proc = symbols.proc;
exports.proc2 = symbols.proc2;
/** @deprecated use hook() instead, check example_and_test/lowlevel-apihooking.ts */
exports.procHacker = new prochacker_1.ProcHacker(Object.assign({}, exports.proc, exports.proc2));
//# sourceMappingURL=proc.js.map