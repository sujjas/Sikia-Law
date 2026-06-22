import { getAllNotes, type FlatNote } from "./curriculum-lookup";

export type SearchHit = FlatNote & { score: number };
export type SearchOutcome = { hits: SearchHit[]; semanticTerms: string[] };

/** Lightweight "semantic" layer (no API): map how a student might phrase a
 *  topic to the words that actually appear in course / note titles. Lets a
 *  search for "fairness" surface Equity, "crime" surface Criminal Law, etc. */
const SYNONYMS: { triggers: string[]; expand: string[] }[] = [
  { triggers: ["fairness", "conscience", "equitable", "trustee", "trusts"], expand: ["equity", "trust"] },
  { triggers: ["crime", "criminal", "offence", "offense", "murder", "theft"], expand: ["criminal"] },
  { triggers: ["agreement", "contracts", "promise", "breach"], expand: ["contract"] },
  { triggers: ["property", "conveyancing", "tenancy", "ownership"], expand: ["land", "property"] },
  { triggers: ["witness", "proof", "testimony", "identification"], expand: ["evidence"] },
  { triggers: ["rights", "freedom", "freedoms", "constitution"], expand: ["constitutional", "human rights"] },
  { triggers: ["negligence", "injury", "liability", "damages"], expand: ["tort"] },
  { triggers: ["marriage", "divorce", "custody", "succession"], expand: ["family", "succession"] },
  { triggers: ["company", "corporate", "business"], expand: ["commercial", "company"] },
  { triggers: ["theory", "schools", "jurisprudence", "philosophy"], expand: ["jurisprudence", "legal method", "introducing law"] },
];

const tokenize = (s: string) =>
  s.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length >= 2);

let cache: FlatNote[] | null = null;
const allNotes = () => (cache ??= getAllNotes());

export function searchNotes(query: string, limit = 30): SearchOutcome {
  const tokens = tokenize(query);
  if (!tokens.length) return { hits: [], semanticTerms: [] };

  // Expand with synonyms — kept separate so direct matches always outrank them.
  const semantic = new Set<string>();
  for (const t of tokens) {
    for (const s of SYNONYMS) {
      if (s.triggers.includes(t) || s.expand.includes(t)) s.expand.forEach((e) => semantic.add(e));
    }
  }
  // Don't double-count terms the user already typed.
  tokens.forEach((t) => semantic.delete(t));

  const semanticTokens = [...semantic].flatMap(tokenize);

  const hits: SearchHit[] = [];
  for (const n of allNotes()) {
    const title = n.title.toLowerCase();
    const course = n.courseTitle.toLowerCase();
    const rest = `${n.courseCode ?? ""} ${n.yearLabel} ${n.semesterLabel}`.toLowerCase();
    let score = 0;
    for (const t of tokens) {
      if (title.includes(t)) score += 3;
      else if (course.includes(t)) score += 2;
      else if (rest.includes(t)) score += 1;
    }
    for (const t of semanticTokens) {
      if (title.includes(t)) score += 1.5;
      else if (course.includes(t)) score += 1;
    }
    if (score > 0) hits.push({ ...n, score });
  }

  hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  // Which semantic terms actually pulled in results (for the "smart" hint).
  const used = [...semantic].filter((term) =>
    hits.some((h) => `${h.title} ${h.courseTitle}`.toLowerCase().includes(term))
  );

  return { hits: hits.slice(0, limit), semanticTerms: used };
}
