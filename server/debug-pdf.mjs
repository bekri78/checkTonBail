import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParseModule = require("pdf-parse");

console.log("=== DEBUG pdf-parse ===");
console.log("Type de pdfParseModule:", typeof pdfParseModule);
console.log("Clés de pdfParseModule:", Object.keys(pdfParseModule));
console.log("pdfParseModule.default:", typeof pdfParseModule.default);
console.log("pdfParseModule === fonction?", typeof pdfParseModule === "function");
console.log("pdfParseModule.default === fonction?", typeof pdfParseModule.default === "function");

// Essayer d'utiliser la bonne version
const pdfParse = typeof pdfParseModule === "function" ? pdfParseModule : pdfParseModule.default;
console.log("\nVersion choisie:", typeof pdfParse === "function" ? "✅ fonction" : "❌ pas une fonction");
console.log("typeof pdfParse:", typeof pdfParse);
