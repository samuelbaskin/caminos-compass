const fs = require("fs");
const path = require("path");

const RUBRIC_PATH = path.join(__dirname, "../../docs/paso-response-rubrics.md");

let cacheMap = null;

function parseRubricFile(content) {
  const map = new Map();
  const lines = content.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("### ")) {
      const id = line.slice(4).trim();
      i += 1;
      const bodyLines = [];
      while (i < lines.length && !lines[i].startsWith("### ")) {
        bodyLines.push(lines[i]);
        i += 1;
      }
      map.set(id, bodyLines.join("\n").trim());
    } else {
      i += 1;
    }
  }
  return map;
}

function loadRubricMap() {
  if (cacheMap) return cacheMap;
  const raw = fs.readFileSync(RUBRIC_PATH, "utf8");
  cacheMap = parseRubricFile(raw);
  return cacheMap;
}

/**
 * @param {string} stage - pre | observation | post
 * @param {number} pasoNum - 1-6
 * @param {string} section - main | general | plan | guidelines | advocacy
 * @param {string} fieldKey
 * @returns {string|null}
 */
function getRubricBlock(stage, pasoNum, section, fieldKey) {
  const map = loadRubricMap();
  const paso = `paso${pasoNum}`;
  const sec = section || "main";
  const candidates = [
    `${stage}|${paso}|${sec}|${fieldKey}`,
    `any|${paso}|${sec}|${fieldKey}`,
  ];
  for (const id of candidates) {
    const b = map.get(id);
    if (b) return b;
  }
  return null;
}

function rubricId(stage, pasoNum, section, fieldKey) {
  return `${stage}|paso${pasoNum}|${section || "main"}|${fieldKey}`;
}

module.exports = { getRubricBlock, rubricId, loadRubricMap, RUBRIC_PATH };
