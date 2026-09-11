/**
 * Cleanly formats scraped service, industry, or category strings.
 * Converts raw stringified Python dicts, JSON arrays/objects, or messy scraped headers
 * into clean, readable text (e.g. "Designer • Office, Restaurant").
 */
export function formatServiceText(raw?: string | null): string {
  if (!raw || typeof raw !== "string") return "General Services";
  
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "[]" || trimmed === "{}" || trimmed === "null" || trimmed === "None") {
    return "General Services";
  }

  // 1. Try parsing if it's a valid JSON array or object
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        const items = parsed
          .map((item) => (typeof item === "string" ? item : item?.att || item?.val || item?.name || ""))
          .filter(Boolean);
        if (items.length > 0) return items.join(", ");
      }
    } catch {
      // Ignore JSON parse error and fallback to regex extraction below
    }
  }

  // 2. Extract 'att' or 'val' from Python stringified dicts like [{'att': 'Designer', ...}]
  if (trimmed.includes("'att':") || trimmed.includes('"att":') || trimmed.includes("'val':") || trimmed.includes('"val":')) {
    const sections = trimmed.split("|");
    const extractedCategories: string[] = [];

    for (const sec of sections) {
      // Find all 'att': '...' or "att": "..."
      const attMatches = [...sec.matchAll(/['"]att['"]\s*:\s*['"]([^'"]+)['"]/gi)];
      const valMatches = [...sec.matchAll(/['"]val['"]\s*:\s*['"]([^'"]+)['"]/gi)];

      const values: string[] = [];
      attMatches.forEach((m) => {
        if (m[1] && m[1].trim()) values.push(m[1].trim());
      });

      if (values.length === 0) {
        valMatches.forEach((m) => {
          if (m[1] && m[1].trim()) values.push(m[1].trim());
        });
      }

      if (values.length > 0) {
        const uniqueVals = Array.from(new Set(values));
        extractedCategories.push(uniqueVals.join(", "));
      }
    }

    if (extractedCategories.length > 0) {
      // Deduplicate items across all categories
      const allUnique = Array.from(
        new Set(extractedCategories.flatMap((cat) => cat.split(", ").map((s) => s.trim())))
      ).filter(Boolean);

      if (allUnique.length > 0) {
        return allUnique.join(" • ");
      }
    }
  }

  // 3. Fallback: Cleanup remaining code markers, brackets, quotes, URLs
  let clean = trimmed
    .replace(/http[s]?:\/\/\S+/gi, "")
    .replace(/\/Vadodara\/\S+/gi, "")
    .replace(/nct-\d+/gi, "")
    .replace(/['"\[\]\{\}]/g, "")
    .replace(/\b(att|val|image|avl|url|image_url)\b\s*:\s*/gi, "")
    .replace(/Profession:|Project Type:|Furniture type:|Type:/gi, "")
    .replace(/,\s*,+/g, ",")
    .replace(/\s+/g, " ")
    .trim();

  // Strip leading/trailing commas or pipes
  clean = clean.replace(/^[,\s|]+|[,\s|]+$/g, "");

  return clean || "General Services";
}
