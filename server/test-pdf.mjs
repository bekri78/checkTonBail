import { createRequire } from "module";
const require = createRequire(import.meta.url);
const fs = require("fs");
const pdfParse = require("pdf-parse");

const pdfPath = "./Contrat.pdf"; // copie ton PDF ici à côté du script

(async () => {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    console.log("Pages :", data.numpages);
    console.log("Caractères de texte :", data.text.length);
    console.log("Début du texte :");
    console.log(data.text.slice(0, 500));
  } catch (err) {
    console.error("Erreur pdf-parse:", err);
  }
})();