/**
 * Curated "Ask this note" demo content.
 *
 * There is no LLM / API key wired in. For client proof-of-concept demos we
 * hand-author believable, citation-first answers for specific notes so the
 * chat feels real when a client opens that note's link and plays with it.
 *
 * Each `section` source carries a `match` string — a normalised substring of a
 * real heading in the note. At answer time it resolves to the live heading id
 * so the citation chip scrolls the reader to that exact section. `statute` /
 * `case` / `note` sources are external authorities (static, like the Library).
 *
 * Notes WITHOUT an entry here fall back to the generic note-aware engine.
 * Questions typed off-script in a curated note also fall back gracefully.
 */

export type AskHeading = { id: string; text: string };

export type SourceKind = "section" | "statute" | "case" | "note";

/** A rendered source chip. `section` chips carry a live heading id (scroll);
 *  the rest are external authorities (static). */
export type Source = { id: string; kind: SourceKind; title: string; meta: string };

export const KIND_LABEL: Record<SourceKind, string> = {
  section: "Section",
  statute: "Statute",
  case: "Case Law",
  note: "Your note",
};

/** Authoring shape — `section` sources carry a `match` (a normalised substring
 *  of a real heading) that resolves to a live heading id at render time. */
export type DemoSource =
  | { kind: "section"; match: string; title: string; meta: string }
  | { kind: "statute" | "case" | "note"; title: string; meta: string };

/** A one-tap structured summary shown at the top of the reader. */
export type DemoSummary = {
  tldr: string;
  points: string[]; // each may contain **bold** spans
  sources: DemoSource[];
};

export type DemoQA = {
  /** Canonical question — used verbatim as a starter chip / follow-up label. */
  q: string;
  /** Extra keywords so free-typed questions can still match this answer. */
  keywords: string[];
  answer: string;
  sources: DemoSource[];
  /** Each must equal another QA's `q` so the chip routes to a real answer. */
  followups: string[];
};

export type DemoBank = {
  /** The three starter chips shown in the empty state. */
  starters: string[];
  /** One-tap summary shown at the top of the reader. */
  summary?: DemoSummary;
  qa: DemoQA[];
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

/* ─────────────────────────────────────────────────────────────────────────
   INTRODUCING LAW NOTES  (Year 1 · Sem 1)
   ──────────────────────────────────────────────────────────────────────── */
const INTRODUCING_LAW: DemoBank = {
  starters: [
    "Summarise this note",
    "What is the definition of law?",
    "What are the main theories of law?",
  ],
  summary: {
    tldr: "A foundations primer: **what law is**, the **schools of thought** that explain it, how law is **classified**, and where it comes from in **Uganda**.",
    points: [
      "**Definition.** Law is a body of **rules guiding conduct** in a community, enforceable by a **sanction** — in Uganda, a rule ultimately enforceable by a court, tribunal or arbitration.",
      "**Theories.** Seven schools, the key contrast being **Natural Law** (law tied to morality) vs **Positivism** (law as the sovereign's command).",
      "**Classifications.** Written vs unwritten, public vs private, **criminal vs civil**, and substantive vs procedural law.",
      "**Sources in Uganda.** The **1995 Constitution** (supreme), legislation, received common law & equity, and customary law.",
    ],
    sources: [
      { kind: "section", match: "definition of law", title: "The Definition of Law", meta: "What law is and its elements." },
      { kind: "section", match: "theories of law", title: "The Theories of Law", meta: "The schools of thought." },
      { kind: "section", match: "applicable in uganda", title: "The Law Applicable in Uganda / Sources of Law", meta: "Where Ugandan law comes from." },
    ],
  },
  qa: [
    {
      q: "Summarise this note",
      keywords: ["summar", "overview", "tldr", "gist"],
      answer:
        "This note is a foundations primer. It works through four things in order: **what law is**, **why it matters**, the **theories** that explain its nature, and how law is **classified** and **sourced** in Uganda.\n\nFor revision, anchor on the definition first, then the seven schools of thought, then the classifications — most intro exam questions sit on one of those three.",
      sources: [
        { kind: "section", match: "definition of law", title: "The Definition of Law", meta: "Where the note sets out what law is." },
        { kind: "section", match: "theories of law", title: "The Theories of Law", meta: "The schools of thought the note surveys." },
      ],
      followups: ["What are the main theories of law?", "How is law classified?"],
    },
    {
      q: "What is the definition of law?",
      keywords: ["definition", "define law", "what is law", "meaning of law"],
      answer:
        "The note defines **law** as a set of **rules or principles that guide human conduct** within a community, the breach of which carries a **sanction**.\n\nIn the Ugandan context it puts it plainly: a rule that is **backed by a sanction for its breach, ultimately enforceable by a court, a tribunal or arbitration**. So three ideas matter — it is a *rule*, it is *applicable to a community*, and it is *enforceable*.",
      sources: [
        { kind: "section", match: "definition of law", title: "The Definition of Law", meta: "The working definition and its elements." },
        { kind: "section", match: "enforcement", title: "5. Enforcement", meta: "Why enforceability is part of the definition." },
      ],
      followups: ["What are the sources of law in Uganda?", "What are the main theories of law?"],
    },
    {
      q: "What are the main theories of law?",
      keywords: ["theories", "schools of thought", "jurisprudence", "schools of law"],
      answer:
        "The note surveys the major **schools of thought** on the nature of law: **Natural Law**, the **Analytical / Positivist** school, the **Historical** school, the **Sociological** school, the **Realist** movement, the **Pure Theory of Law**, and the **Marxist** theory.\n\nThe usual exam split is Natural Law (law is tied to morality) versus Positivism (law is the command of the sovereign, separate from morality) — know that contrast well.",
      sources: [
        { kind: "section", match: "theories of law", title: "The Theories of Law", meta: "The list of schools, in order." },
        { kind: "section", match: "natural law school", title: "Natural Law School of Thought", meta: "Law derived from morality and reason." },
        { kind: "section", match: "positivist school", title: "The Positivist School of Thought", meta: "Law as the command of the sovereign." },
      ],
      followups: ["Explain the natural law school", "How is law classified?"],
    },
    {
      q: "Explain the natural law school",
      keywords: ["natural law", "aquinas", "morality", "natural"],
      answer:
        "The **Natural Law** school holds that law is grounded in **morality and reason** — an unjust law is, on this view, not truly law.\n\nThe note centres **Thomas Aquinas (1225–1274)**, who divided law into four kinds: **eternal**, **divine**, **natural**, and **human** law, with human (positive) law deriving its authority from natural law. It contrasts sharply with the positivists, who separate law from morality.",
      sources: [
        { kind: "section", match: "natural law school", title: "Natural Law School of Thought", meta: "The school's core claim." },
        { kind: "section", match: "theories of law", title: "The Theories of Law", meta: "How it sits among the other schools." },
      ],
      followups: ["What are the main theories of law?", "What is the definition of law?"],
    },
    {
      q: "How is law classified?",
      keywords: ["classif", "division", "types of law", "categories"],
      answer:
        "The note sets out the standard **classifications**: **written vs unwritten** law, **public vs private** law, **criminal vs civil** law, and **substantive vs procedural** law.\n\nThe one students trip on is criminal vs civil: criminal law is the State prosecuting an offence (punishment); civil law resolves disputes between persons (remedy/compensation). Different parties, standard of proof, and outcome.",
      sources: [
        { kind: "section", match: "classification of law", title: "Classification of Law", meta: "The overview of how law is divided." },
        { kind: "section", match: "written law versus unwritten", title: "Written Law Versus Unwritten Law", meta: "The first division." },
        { kind: "section", match: "criminal versus civil", title: "Criminal Versus Civil Law", meta: "Parties, proof, and outcome compared." },
      ],
      followups: ["What are the sources of law in Uganda?", "What is the definition of law?"],
    },
    {
      q: "What are the sources of law in Uganda?",
      keywords: ["sources of law", "applicable in uganda", "where does law come"],
      answer:
        "The note's closing section sets out the **law applicable in Uganda**: the **1995 Constitution** (the supreme law), **legislation / statutes**, the **received common law and doctrines of equity**, and **customary law** (so far as it isn't repugnant to written law or morality).\n\nStart every \"sources\" answer with the Constitution — Article 2 makes it supreme, so any other source is valid only to the extent it conforms to it.",
      sources: [
        { kind: "section", match: "applicable in uganda", title: "The Law Applicable in Uganda / Sources of Law", meta: "The note's list of sources." },
        { kind: "statute", title: "Constitution of Uganda 1995", meta: "The supreme law — Article 2. Every other source ranks below it." },
      ],
      followups: ["How is law classified?", "Summarise this note"],
    },
  ],
};

/* ─────────────────────────────────────────────────────────────────────────
   EQUITY & TRUSTS — Q&A  (Year 2 · Sem 2)
   ──────────────────────────────────────────────────────────────────────── */
const EQUITY_TRUSTS: DemoBank = {
  starters: [
    "Summarise this note",
    "What led to the development of equity?",
    "What are the duties of a trustee?",
  ],
  summary: {
    tldr: "An exam Q&A set on **Equity & Trusts**: why equity **developed**, how it **fused** with the common law, the equitable **doctrines**, and the **duties of trustees** — all under Ugandan statute.",
    points: [
      "**Development.** Equity arose to cure the **rigidity of the common law** — the writ system, damages as the only remedy, and no recognition of the trust — via the **Court of Chancery**.",
      "**Fusion.** The **Judicature Acts 1873–75** had law and equity administered in the same courts; where they **conflict, equity prevails**.",
      "**Doctrines.** Equitable doctrines such as **satisfaction** and **performance**, and their application in Uganda.",
      "**Trustees.** Core **duties** — reduce property into possession, invest, distribute, keep equality and accounts — all under a **fiduciary** standard.",
    ],
    sources: [
      { kind: "section", match: "account for and against", title: "The Development of Equity", meta: "Why equity arose." },
      { kind: "section", match: "reduction of property", title: "Duties of a Trustee", meta: "The trustee's obligations." },
      { kind: "statute", title: "Judicature Act (Cap 13)", meta: "Receives equity; equity prevails on conflict." },
    ],
  },
  qa: [
    {
      q: "Summarise this note",
      keywords: ["summar", "overview", "tldr", "gist"],
      answer:
        "This is an exam Q&A set on **Equity and Trusts**. It covers four big themes: **why equity developed** alongside the common law, how the two were eventually **fused**, the equitable **doctrines** (notably **satisfaction** and **performance**), and the **duties and powers of trustees** — all framed against the Ugandan statutes.\n\nIf you only revise two things: the *development & fusion* story, and the *trustee duties* list.",
      sources: [
        { kind: "section", match: "account for and against", title: "The Development of Equity", meta: "The factors that gave rise to equity." },
        { kind: "section", match: "doctrine of satisfaction", title: "Doctrine of Satisfaction", meta: "A worked equitable doctrine." },
      ],
      followups: ["What led to the development of equity?", "What are the duties of a trustee?"],
    },
    {
      q: "What led to the development of equity?",
      keywords: ["development of equity", "origin of equity", "why equity", "rise of equity", "chancery"],
      answer:
        "Equity grew up to cure the **rigidity and defects of the common law**. The note points to the **writ system** (no writ, no remedy), the common law's **single remedy of damages** (inadequate where a person needed an injunction or specific performance), and its **failure to recognise the trust**.\n\nAggrieved parties petitioned the **King**, who passed them to the **Lord Chancellor** — the \"keeper of the King's conscience\" — and from this grew the **Court of Chancery**, applying conscience-based relief.",
      sources: [
        { kind: "section", match: "account for and against", title: "The Development of Equity", meta: "The defects of common law that equity answered." },
        { kind: "case", title: "Earl of Oxford's Case (1615)", meta: "Where the two systems conflict, equity prevails." },
      ],
      followups: ["How were common law and equity fused?", "What is the doctrine of satisfaction?"],
    },
    {
      q: "What are the duties of a trustee?",
      keywords: ["duties of a trustee", "trustee duties", "duties of trustees", "obligations of a trustee"],
      answer:
        "The note lists the trustee's core **duties**: to **reduce the trust property into possession**, to **invest** the trust fund properly, to **distribute** to the right beneficiaries, to **maintain equality between beneficiaries**, to **keep and provide accounts and information**, and the broader **fiduciary duties** (no unauthorised profit, no conflict of interest).\n\nThe thread running through all of them is the **fiduciary** standard — the trustee must act in the beneficiaries' interest, not their own.",
      sources: [
        { kind: "section", match: "reduction of property", title: "Reduction of Property Into Possession", meta: "The first duty on taking office." },
        { kind: "section", match: "duty to invest", title: "Duty to Invest", meta: "Invest prudently for the fund." },
        { kind: "section", match: "duty to maintain equality", title: "Duty to Maintain Equality Between Beneficiaries", meta: "Even-handedness between beneficiaries." },
      ],
      followups: ["Which laws apply to trusts in Uganda?", "What is the doctrine of satisfaction?"],
    },
    {
      q: "What is the doctrine of satisfaction?",
      keywords: ["doctrine of satisfaction", "satisfaction", "performance"],
      answer:
        "**Satisfaction** is the equitable presumption that a person does not intend to do the same thing twice — so a gift or payment may be treated as **satisfying** an existing obligation rather than being an additional benefit. Equity imputes the intention to fulfil the obligation.\n\nIt sits beside **performance** (treating an act as a part- or full performance of a covenant). The note discusses how both apply in **Uganda**, where they operate through the received doctrines of equity.",
      sources: [
        { kind: "section", match: "doctrine of satisfaction", title: "Doctrine of Satisfaction", meta: "Definition and how equity presumes intention." },
      ],
      followups: ["What led to the development of equity?", "Which laws apply to trusts in Uganda?"],
    },
    {
      q: "How were common law and equity fused?",
      keywords: ["fusion", "fused", "judicature", "common law and equity", "section 25"],
      answer:
        "Procedurally, by the **Judicature Acts 1873–1875**. They abolished the separate courts and provided that **law and equity be administered side by side in the same courts**, so a litigant no longer had to choose the right court.\n\nCrucially, where the rules **conflict, equity prevails** (the principle in **s.25(11)** of the 1873 Act, echoed in Uganda's Judicature Act). Note the debate the question flags: this was a *fusion of administration*, not necessarily a fusion of the two bodies of substantive law.",
      sources: [
        { kind: "section", match: "question 2", title: "Question 2 — Fusion of Law and Equity", meta: "The note's treatment of fusion." },
        { kind: "statute", title: "Judicature Act (Cap 13)", meta: "Administers law and equity in the same courts; equity prevails on conflict." },
      ],
      followups: ["What led to the development of equity?", "What are the duties of a trustee?"],
    },
    {
      q: "Which laws apply to trusts in Uganda?",
      keywords: ["laws applicable", "which laws", "statutes", "applicable law", "uganda law trust"],
      answer:
        "The note's **applicable law** covers the **1995 Constitution**, the **Succession Act** (e.g. **s.50** on trusts created by will), the **Children Act** (**s.4**, welfare of the child where minors are beneficiaries), and the **Judicature Act** (which receives the doctrines of equity and grants the High Court its powers).\n\nLayer them in that order in an answer: constitutional supremacy first, then the specific statute, then equity filling the gaps.",
      sources: [
        { kind: "section", match: "laws applicable", title: "Laws Applicable", meta: "The statutes the note relies on." },
        { kind: "section", match: "succession act provide", title: "Section 50, Succession Act", meta: "Trusts created by will." },
        { kind: "statute", title: "Constitution of Uganda 1995", meta: "The supreme law — the starting point." },
      ],
      followups: ["What are the duties of a trustee?", "Summarise this note"],
    },
  ],
};

/** Keyed by the note title, normalised. */
const BANKS: { keys: string[]; bank: DemoBank }[] = [
  { keys: ["introducing law notes", "introducing law"], bank: INTRODUCING_LAW },
  { keys: ["equity & trusts — q&a", "equity and trusts qa", "equity and trust qa"], bank: EQUITY_TRUSTS },
];

export function findDemoBank(noteTitle: string): DemoBank | null {
  const n = norm(noteTitle);
  for (const { keys, bank } of BANKS) {
    if (keys.some((k) => norm(k) === n || n.includes(norm(k)))) return bank;
  }
  return null;
}

/** Match a question to a curated answer: exact chip text first, then keywords. */
export function matchDemoQA(bank: DemoBank, query: string): DemoQA | null {
  const n = norm(query);
  if (!n) return null;
  const exact = bank.qa.find((x) => norm(x.q) === n);
  if (exact) return exact;
  let best: DemoQA | null = null;
  let bestScore = 0;
  for (const x of bank.qa) {
    const score = x.keywords.filter((k) => n.includes(norm(k))).length;
    if (score > bestScore) {
      bestScore = score;
      best = x;
    }
  }
  return bestScore >= 1 ? best : null;
}

/* ─────────────────────────────────────────────────────────────────────────
   Shared heading / source helpers (used by the chat and the summary card).
   ──────────────────────────────────────────────────────────────────────── */

/** Extracted notes carry junk leaf headings ("No.1", "Note:", a bare number)
 *  that make poor citations and worse suggestions. Keep only real wording. */
const JUNK_HEADINGS = new Set([
  "note", "notes", "pdf", "summary", "introduction", "intro", "contents",
]);
export function meaningfulHeadings(headings: AskHeading[]): AskHeading[] {
  return headings.filter((h) => {
    const t = h.text.trim();
    return (
      t.replace(/[^a-z]/gi, "").length >= 5 &&
      !JUNK_HEADINGS.has(t.toLowerCase().replace(/[^a-z]/g, ""))
    );
  });
}

/** Turn authored demo sources into rendered Source objects. `section` sources
 *  resolve their `match` to a live heading id so the chip scrolls the reader. */
export function resolveDemoSources(ds: DemoSource[], headings: AskHeading[]): Source[] {
  return ds.map((s) => {
    if (s.kind === "section") {
      const m = norm(s.match);
      const h = headings.find((hh) => norm(hh.text).includes(m));
      return { id: h ? h.id : `sec-${m}`, kind: "section" as const, title: s.title, meta: s.meta };
    }
    return { id: `lib-${norm(s.title)}`, kind: s.kind, title: s.title, meta: s.meta };
  });
}

/* ─────────────────────────────────────────────────────────────────────────
   DEFINE INLINE — select a legal term → plain-English definition.
   A curated Ugandan-law glossary, shared across all notes. No API: unknown
   selections return an honest "no entry" rather than a guessed definition.
   ──────────────────────────────────────────────────────────────────────── */

export type Definition = {
  term: string;
  /** Plain-English definition, Ugandan context where it helps. */
  plain: string;
  /** Short cited authority, e.g. "Judicature Act, s.14". Optional. */
  authority?: string;
  /** True when this is the honest fallback (no glossary entry). */
  unknown?: boolean;
};

const GLOSSARY: Record<string, Omit<Definition, "term">> = {
  equity: {
    plain: "A body of rules developed by the Court of Chancery to soften the rigidity of the common law, acting on conscience and fairness. In Uganda it is received law and applies alongside the common law.",
    authority: "Judicature Act, s.14 — receives the doctrines of equity.",
  },
  trust: {
    plain: "An arrangement where a person (the trustee) holds property for the benefit of another (the beneficiary). Equity recognises and enforces the trust even though the common law did not.",
  },
  trustee: {
    plain: "The person who holds and manages trust property for the beneficiaries. A trustee owes fiduciary duties and must act in the beneficiaries' interest, not their own.",
  },
  fiduciary: {
    plain: "A relationship of trust and confidence that imposes the highest duty of loyalty — no unauthorised profit and no conflict between duty and self-interest. Trustees, agents and directors are fiduciaries.",
  },
  "ratio decidendi": {
    plain: "The legal reason for a decision — the binding principle of a case. It is what later courts must follow under the doctrine of precedent.",
  },
  ratio: {
    plain: "Short for ratio decidendi — the binding legal reason for a court's decision; the part of a judgment that creates precedent.",
  },
  "obiter dictum": {
    plain: "A remark made 'by the way' in a judgment that is not necessary for the decision. It is persuasive only, not binding on later courts.",
  },
  obiter: {
    plain: "Short for obiter dictum — a judge's passing remark that is not essential to the decision, so it is persuasive but not binding.",
  },
  "common law": {
    plain: "Judge-made law built from decided cases and precedent, as distinct from statute or equity. Uganda received the common law of England as a source of law.",
  },
  "natural law": {
    plain: "The theory that law is grounded in morality and reason — an unjust law is, on this view, not truly law. Associated with Aquinas; contrasted with positivism.",
  },
  positivism: {
    plain: "The theory that law is the command of the sovereign, valid because of its source and not its moral content. The law as it is, separate from the law as it ought to be.",
  },
  sanction: {
    plain: "The penalty or consequence attached to breaking a legal rule. The note treats enforceability by sanction as part of the very definition of law.",
  },
  precedent: {
    plain: "An earlier decision that later courts follow on similar facts (stare decisis). Decisions of higher courts bind lower ones.",
  },
  "stare decisis": {
    plain: "Latin for 'to stand by decided cases' — the doctrine that courts follow precedent, giving the law consistency and predictability.",
  },
  injunction: {
    plain: "An equitable remedy ordering a party to do, or stop doing, something. Equity created it because the common law offered only damages.",
  },
  "specific performance": {
    plain: "An equitable remedy compelling a party to perform their contractual obligation, granted where damages would be inadequate (e.g. a sale of land).",
  },
  statute: {
    plain: "A law made by the legislature (an Act of Parliament). In Uganda statutes rank below the 1995 Constitution but above common law and custom.",
  },
  jurisdiction: {
    plain: "The authority of a court to hear and decide a matter — by subject, territory, or value. A court acting outside its jurisdiction acts without power.",
  },
  "court of chancery": {
    plain: "The historical English court, presided over by the Lord Chancellor, that developed equity to relieve the harshness of the common law.",
  },
  "doctrine of satisfaction": {
    plain: "An equitable presumption that a person does not intend to confer a benefit twice, so a later gift or payment may satisfy an existing obligation.",
  },
};

const norm2 = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, "").replace(/\s+/g, " ").trim();

/** Look up a selected term. Returns a curated definition, or an honest
 *  "no entry" fallback (never a guessed one). Returns null if the selection
 *  isn't a plausible term (too long, empty). */
export function lookupDefinition(selection: string): Definition | null {
  const n = norm2(selection);
  if (!n) return null;
  const words = n.split(" ");
  if (words.length > 6 || n.length > 60) return null; // it's a sentence, not a term

  // Exact, then containment either way (so "the ratio decidendi" → "ratio decidendi").
  if (GLOSSARY[n]) return { term: selection.trim(), ...GLOSSARY[n] };
  for (const key of Object.keys(GLOSSARY)) {
    if (n.includes(key) || (key.includes(n) && n.length >= 4)) {
      return { term: selection.trim(), ...GLOSSARY[key] };
    }
  }
  return {
    term: selection.trim(),
    plain: "",
    unknown: true,
  };
}

/** Generic summary for notes without a curated entry — derived from the note's
 *  own meaningful section headings. Believable, if less polished. */
export function buildNoteSummary(noteTitle: string, headings: AskHeading[]): DemoSummary {
  const pool = meaningfulHeadings(headings).slice(0, 4);
  const names = pool.map((h) => h.text);
  const lead =
    names.length >= 2
      ? `**${noteTitle}** works through **${names[0]}**, **${names[1]}**${names[2] ? `, **${names[2]}**` : ""} and more.`
      : `An overview of **${noteTitle}**.`;
  return {
    tldr: lead,
    points: pool.map((h) => `**${h.text}** — a key section of this note.`),
    sources: pool.slice(0, 3).map((h) => ({
      kind: "section" as const,
      match: h.text,
      title: h.text,
      meta: "Section in this note.",
    })),
  };
}
