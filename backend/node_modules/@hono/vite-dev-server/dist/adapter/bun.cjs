"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var bun_exports = {};
__export(bun_exports, {
  bunAdapter: () => bunAdapter,
  default: () => bun_default
});
module.exports = __toCommonJS(bun_exports);
const bunAdapter = () => {
  if (typeof globalThis.navigator === "undefined") {
    globalThis.navigator = {
      userAgent: "Bun"
    };
  } else {
    Object.defineProperty(globalThis.navigator, "userAgent", {
      value: "Bun",
      writable: false
    });
  }
  return {
    env: process.env
  };
};
var bun_default = bunAdapter;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  bunAdapter
});
