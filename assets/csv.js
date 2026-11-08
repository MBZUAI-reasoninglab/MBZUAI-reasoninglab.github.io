(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.RDM_CSV = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function parse(text) {
    const rows = [];
    let row = [];
    let field = "";
    let quoted = false;

    const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");

    for (let i = 0; i < normalized.length; i += 1) {
      const character = normalized[i];
      const next = normalized[i + 1];

      if (quoted) {
        if (character === '"' && next === '"') {
          field += '"';
          i += 1;
        } else if (character === '"') {
          quoted = false;
        } else {
          field += character;
        }
      } else if (character === '"') {
        quoted = true;
      } else if (character === ",") {
        row.push(field.trim());
        field = "";
      } else if (character === "\n") {
        row.push(field.trim());
        if (row.some((cell) => cell !== "")) rows.push(row);
        row = [];
        field = "";
      } else {
        field += character;
      }
    }

    row.push(field.trim());
    if (row.some((cell) => cell !== "")) rows.push(row);
    if (rows.length < 2) return [];

    const headers = rows[0].map((header) => header.trim());
    return rows.slice(1).map((cells) =>
      Object.fromEntries(
        headers.map((header, index) => [header, cells[index]?.trim() || ""]),
      ),
    );
  }

  return { parse };
});
