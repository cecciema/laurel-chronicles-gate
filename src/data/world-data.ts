export interface Character {
  id: string;
  name: string;
  title: string;
  faction: string;
  alignment: string;
  personality: string[];
  background: string;
  relationships: string;
  image: string;
  magistry?: string;
  philosophy?: string;
}

export interface GuideCharacter {
  id: string;
  name: string;
  magistry: string;
  philosophy: string;
  image: string;
  welcomeTone: string;
  recommendedLore: string[];
  startingRegion: string;
  factionTag: string;
  accentColor: string;
}

export interface Faction {
  id: string;
  name: string;
  motto: string;
  description: string;
  leader: string;
  strength: string;
  ideology: string;
  color: string;
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  category: 'political' | 'military' | 'social' | 'technological';
}

export interface WorldRegion {
  id: string;
  name: string;
  description: string;
  faction: string;
  features: string[];
}

export const characters: Character[] = [
  {
    id: "culver",
    name: "Culver Gretell",
    title: "Paragon of the Ocean Magistry",
    faction: "Magistry of Ocean",
    alignment: "Analytical Idealist",
    personality: ["Analytical", "Driven", "Emotionally Guarded", "Quietly Rebellious"],
    background: "A brilliant marine technologist devoted to restoring the planet's oceans, Culver stands at the crossroads between love, duty, and truth. Driven by logic and skepticism, he questions the foundations of a society built on engineered destiny and controlled life cycles. He believes humanity should solve real planetary problems instead of accepting predetermined life cycles and spiritual doctrine.",
    relationships: "Quinnevere — romantic partner, emotional anchor, but also ideological contrast. Carmela — former guardian figure, moral compass and institutional bridge.",
    image: "char-culver",
    magistry: "Ocean",
    philosophy: "Truth lives where the tide meets the unknown shore.",
  },
  {
    id: "quinn",
    name: "Quinnevere",
    title: "Pantheon Ivory Scholar",
    faction: "Sanctorium / Pantheon Ivory",
    alignment: "Devoted Heart",
    personality: ["Emotionally Deep", "Loyal", "Self-Sacrificing", "Highly Observant"],
    background: "A gifted linguistic scholar who rose from a traditional life path into elite Pantheon service, Quinn is torn between personal love and devotion to a greater collective destiny. A specialist in ancient and dead languages, she is a potential interpreter of forbidden or hidden knowledge. Publicly admired as brilliant, elegant, and selfless.",
    relationships: "Culver — patron-soul level bond, threatened by ideology and timing. Carmela — mentor and institutional authority. Pantheon leadership — opportunity and danger.",
    image: "char-quinn",
    magistry: "Sanctorium",
    philosophy: "Every dead language carries the memory of a living truth.",
  },
  {
    id: "carmela",
    name: "Carmela",
    title: "Pantheon Lunary (Ivory)",
    faction: "Pantheon Ivory",
    alignment: "Keeper of Order",
    personality: ["Controlled", "Devoted to Tradition", "Emotionally Restrained", "Deeply Loyal"],
    background: "A master scribe and political operator who rose through the Sanctorium ranks, Carmela now stands at the center of divine transition politics — tasked with guiding a new era while navigating hidden power struggles. As ceremony orchestrator and keeper of sacred institutional continuity, she is publicly regarded as impeccable, trusted, and untouchable.",
    relationships: "Sol Deus Lockland — mentor and emotional anchor. Culver — former ward, symbolic hope for future generation. Other Pantheon rulers — political rivals.",
    image: "char-carmela",
    magistry: "Pantheon Ivory",
    philosophy: "The institution endures when those inside it choose duty over desire.",
  },
  {
    id: "verlaine",
    name: "Verlaine",
    title: "Rising Shadow of the Pantheon",
    faction: "Pantheon Initiate",
    alignment: "Hidden Architect",
    personality: ["Calculated", "Curious", "Patient", "Ambitious"],
    background: "A rising political and spiritual power operating behind secrecy and long-term strategy, Verlaine represents the next generation of leadership — and possibly a hidden agenda that could reshape the world. As Pantheon initiate turned future high leadership, they are a strategic political mover and knowledge seeker, particularly about soul and war truths. Quietly underestimated.",
    relationships: "Pantheon high leadership — ladder and potential trap. Hidden knowledge holders — targets. Other initiates — carefully managed allies.",
    image: "char-verlaine",
    magistry: "Shadow Pantheon",
    philosophy: "The world is built on hidden truths. I intend to find them all.",
  },
  {
    id: "jude",
    name: "Premiere Jude",
    title: "Head of Parliament",
    faction: "The Republic Parliament",
    alignment: "Stabilizing Authority",
    personality: ["Calculated", "Controlled", "Strategic", "Publicly Composed"],
    background: "The political face of the Republic, Premiere Jude represents order, stability, and the visible authority of Parliament. Where the Pantheons govern spiritual and existential destiny, Jude governs the living world — law, security, and societal control. Regarded publicly as a strong leader, stabilizer, and necessary authority figure.",
    relationships: "Chief Magister Remsays — operational enforcement arm. Pantheon Sol Deos — uneasy power-sharing relationship. Republic citizens — symbolic protector.",
    image: "char-jude",
    magistry: "Parliament",
    philosophy: "Order is not a cage. It is the only thing keeping the world from collapse.",
  },
  {
    id: "nefertar",
    name: "Sol Deus Nefertar",
    title: "Divine Ruler, Keeper of the Flame",
    faction: "Pantheon Sol Deus",
    alignment: "Eternal Strategist",
    personality: ["Elegant", "Perceptive", "Emotionally Restrained", "Patient Strategist"],
    background: "Ancient, observant, and quietly formidable, Nefertar embodies Pantheon divinity shaped by centuries of institutional evolution. A Pantheon Sol Deus and keeper of fragmentary soul knowledge, she sees individuals not only for who they are — but for what they may become. Publicly regarded as godlike, untouchable, and benevolently unknowable.",
    relationships: "Carmela — respected institutional peer. Quinnevere — intellectually interesting anomaly. Other Sol Deos — alliance and rivalry matrix.",
    image: "char-nefertar",
    magistry: "Sol Deus",
    philosophy: "I have watched civilizations decide their own fates. The fire remembers what history forgets.",
  },
  {
    id: "remsays",
    name: "Chief Magister Remsays",
    title: "Parliament Chief Magister",
    faction: "The Republic Parliament",
    alignment: "Ruthless Visionary",
    personality: ["Commanding", "Intellectually Intense", "Charismatic", "Predatory Calm"],
    background: "The voice of duty, sacrifice, and planetary survival, Remsays represents the ideological backbone of Republic service. As Parliament Chief Magister and overseer of Paragon elite programs, he believes citizens are not just people — they are custodians of a dying world. A legendary strategist, publicly regarded as ruthless but visionary.",
    relationships: "Premiere Jude — political superior. Paragon recruits — future tools of system survival. Pantheon leadership — necessary but philosophically separate.",
    image: "char-remsays",
    magistry: "Paragon Command",
    philosophy: "Survival justifies sacrifice. Every great structure is built on what had to be given up.",
  },
  {
    id: "soleil",
    name: "Soleil",
    title: "Cultural Icon of the Republic",
    faction: "Republic Elite",
    alignment: "Aspirational Ideal",
    personality: ["Charismatic", "Graceful", "Emotionally Perceptive", "Socially Strategic"],
    background: "A radiant presence within the Republic's upper social and ceremonial strata, Soleil represents the aspirational ideal citizen — polished, admired, and deeply embedded within the cultural mythology of Panterra. A social influence bridge between Parliament and Pantheon society, she shows what the system promises people they can become. Publicly admired and untouchably polished.",
    relationships: "Parliament elite — managed proximity. Pantheon ceremonial circles — graceful navigation. Public — carefully curated adoration.",
    image: "char-soleil",
    magistry: "Cultural Strata",
    philosophy: "To be admired is to hold a mirror to what a society wishes it were.",
  },
  {
    id: "sailor",
    name: "Sailor",
    title: "Frontier Survivor",
    faction: "Civilian / Frontier Class",
    alignment: "Pragmatic Truth-Seeker",
    personality: ["Pragmatic", "Guarded", "Observational", "Morally Flexible"],
    background: "A survivor of the physical world beyond the protected systems of Panterra, Sailor represents the forgotten relationship between humanity and the natural world — and the cost of losing it. With civilian frontier-class ocean-adjacent survival knowledge and potential connection to pre-war truths, they ground the world in physical stakes and reality outside institutional ideology. Unpredictable, useful, and not fully trusted by institutions.",
    relationships: "The ocean — home and teacher. Institutions — suspicious distance. Those who seek real knowledge — rare allies.",
    image: "char-sailor",
    magistry: "Frontier / Ocean Edge",
    philosophy: "The world the institutions built is not the real world. I've seen what's underneath.",
  },
  {
    id: "gemma",
    name: "Gemma",
    title: "Lunary Political Operator",
    faction: "Pantheon (Prisma Alignment)",
    alignment: "Precision Instrument",
    personality: ["Disarmingly Warm", "Highly Observant", "Calculating Beneath Surface", "Loyalty-First"],
    background: "Young, sharp, and politically aware beyond her years, Gemma operates as a precision instrument of Pantheon strategy — appearing supportive while quietly advancing deeper agendas. As Lunary to Sol Deus and political handler and transition facilitator, she is the gatekeeper between power tiers. Shows how power actually moves — quietly, personally, relationally. Publicly regarded as efficient, trustworthy, and a rising star.",
    relationships: "Sol Deus (Prisma) — complex loyalty. Political transition figures — managed carefully. Rising challengers — watched closely.",
    image: "char-gemma",
    magistry: "Pantheon Prisma",
    philosophy: "Power does not shout. It whispers in the right ear at the right moment.",
  },
];

// Guide characters — a subset of characters who serve as world entry guides
// Each aligned to a Magistry that shapes the user's first experience
export const guideCharacters: GuideCharacter[] = [
  {
    id: "culver",
    name: "Culver Gretell",
    magistry: "Magistry of Ocean",
    philosophy: "Truth lives where the tide meets the unknown shore.",
    image: "char-culver",
    welcomeTone: "analytical",
    recommendedLore: ["world", "timeline", "factions"],
    startingRegion: "deepforge",
    factionTag: "Ocean Magistry",
    accentColor: "hsl(195 70% 45%)",
  },
  {
    id: "quinn",
    name: "Quinnevere",
    magistry: "Sanctorium Ivory",
    philosophy: "Every dead language carries the memory of a living truth.",
    image: "char-quinn",
    welcomeTone: "poetic",
    recommendedLore: ["characters", "timeline", "world"],
    startingRegion: "citadel",
    factionTag: "Sanctorium",
    accentColor: "hsl(45 80% 65%)",
  },
  {
    id: "verlaine",
    name: "Verlaine",
    magistry: "Shadow Pantheon",
    philosophy: "The world is built on hidden truths. I intend to find them all.",
    image: "char-verlaine",
    welcomeTone: "mysterious",
    recommendedLore: ["factions", "characters", "map"],
    startingRegion: "bureau",
    factionTag: "Shadow Pantheon",
    accentColor: "hsl(270 50% 55%)",
  },
  {
    id: "remsays",
    name: "Chief Magister Remsays",
    magistry: "Paragon Command",
    philosophy: "Survival justifies sacrifice. Every great structure is built on what had to be given up.",
    image: "char-remsays",
    welcomeTone: "commanding",
    recommendedLore: ["factions", "timeline", "world"],
    startingRegion: "citadel",
    factionTag: "Parliament Command",
    accentColor: "hsl(0 60% 45%)",
  },
  {
    id: "nefertar",
    name: "Sol Deus Nefertar",
    magistry: "Sol Deus",
    philosophy: "I have watched civilizations decide their own fates. The fire remembers what history forgets.",
    image: "char-nefertar",
    welcomeTone: "divine",
    recommendedLore: ["world", "timeline", "characters"],
    startingRegion: "deepforge",
    factionTag: "Sol Deus",
    accentColor: "hsl(38 90% 55%)",
  },
  {
    id: "sailor",
    name: "Sailor",
    magistry: "Frontier Edge",
    philosophy: "The world the institutions built is not the real world. I've seen what's underneath.",
    image: "char-sailor",
    welcomeTone: "raw",
    recommendedLore: ["map", "world", "timeline"],
    startingRegion: "ashfields",
    factionTag: "Frontier / Unaligned",
    accentColor: "hsl(210 40% 40%)",
  },
  {
    id: "carmela",
    name: "Carmela",
    magistry: "Pantheon Ivory",
    philosophy: "The institution endures when those inside it choose duty over desire.",
    image: "char-carmela",
    welcomeTone: "ceremonial",
    recommendedLore: ["characters", "factions", "timeline"],
    startingRegion: "citadel",
    factionTag: "Pantheon Ivory",
    accentColor: "hsl(45 60% 50%)",
  },
  {
    id: "jude",
    name: "Premiere Jude",
    magistry: "Parliament",
    philosophy: "Order is not a cage. It is the only thing keeping the world from collapse.",
    image: "char-jude",
    welcomeTone: "authoritative",
    recommendedLore: ["factions", "world", "timeline"],
    startingRegion: "citadel",
    factionTag: "The Republic Parliament",
    accentColor: "hsl(220 50% 45%)",
  },
  {
    id: "soleil",
    name: "Soleil",
    magistry: "Cultural Strata",
    philosophy: "To be admired is to hold a mirror to what a society wishes it were.",
    image: "char-soleil",
    welcomeTone: "radiant",
    recommendedLore: ["characters", "world", "gallery"],
    startingRegion: "citadel",
    factionTag: "Republic Elite",
    accentColor: "hsl(330 60% 55%)",
  },
  {
    id: "gemma",
    name: "Gemma",
    magistry: "Pantheon Prisma",
    philosophy: "Power does not shout. It whispers in the right ear at the right moment.",
    image: "char-gemma",
    welcomeTone: "precise",
    recommendedLore: ["characters", "factions", "map"],
    startingRegion: "bureau",
    factionTag: "Pantheon Prisma",
    accentColor: "hsl(160 50% 40%)",
  },
];

export const factions: Faction[] = [
  {
    id: "parliament",
    name: "The Republic Parliament",
    motto: "Order Through Authority",
    description: "The governing body of the Republic, Parliament controls law, security, and societal policy. Led by Premiere Jude with enforcement through Chief Magister Remsays, Parliament represents visible civic authority — the counterbalance to Pantheon spiritual power. It is the face of order, but beneath that face lies calculated control.",
    leader: "Premiere Jude",
    strength: "Military force, legal authority, Paragon program control",
    ideology: "Stability requires hierarchy. Sacrifice is not a burden — it is a duty. The planet's survival demands elite governance.",
    color: "primary",
  },
  {
    id: "pantheon-ivory",
    name: "Pantheon Ivory",
    motto: "The Word Endures Beyond All Empires",
    description: "The Sanctorium's intellectual and spiritual authority, Pantheon Ivory is the domain of scholars, scribes, and linguistic custodians. They hold the keys to ancient knowledge, dead languages, and sacred institutional memory. Their power is subtle, patient, and deep — rooted in what others cannot read and what history has forgotten.",
    leader: "Carmela, Pantheon Lunary",
    strength: "Ancient knowledge, linguistic mastery, ceremonial authority",
    ideology: "To control language is to control meaning. To control meaning is to control destiny itself.",
    color: "brass",
  },
  {
    id: "sol-deus",
    name: "Pantheon Sol Deus",
    motto: "The Fire Remembers",
    description: "The highest tier of Pantheon divine authority, Sol Deus rulers are ancient, observant, and formidable. They hold fragmentary soul knowledge and see across centuries. Their authority transcends institutional politics — they exist at the intersection of faith, prophecy, and existential power. Nefertar is their most prominent face: godlike, untouchable, and benevolently unknowable.",
    leader: "Sol Deus Nefertar",
    strength: "Divine authority, soul knowledge, multi-Pantheon political influence",
    ideology: "The system is built on incomplete truths. Whether to preserve or reshape it is the only question that matters.",
    color: "copper",
  },
  {
    id: "magistry-ocean",
    name: "Magistry of Ocean",
    motto: "Restore What Was Taken",
    description: "A specialized scientific and spiritual body dedicated to planetary recovery — particularly the restoration of the world's oceans. Where other powers fight for control, the Magistry of Ocean fights for continuation. Their candidates, like Culver, are selected for intellect, dedication, and the rare ability to question doctrine while remaining inside the system.",
    leader: "Culver Gretell (Paragon candidate)",
    strength: "Scientific innovation, ocean knowledge, planetary survival expertise",
    ideology: "The planet is the only institution worth protecting. All others are temporary.",
    color: "accent",
  },
  {
    id: "frontier",
    name: "The Frontier Edge",
    motto: "We Know What the Maps Leave Out",
    description: "Outside the protected systems of Panterra lies the world that institutions do not govern. Frontier survivors carry knowledge of pre-war truths, natural world realities, and the manufactured nature of the Republic's stability. They are unpredictable, useful, and not fully trusted — which makes them dangerous to those who need trust to maintain control.",
    leader: "None (Sailor is a known figure)",
    strength: "Survival knowledge, unfiltered truth, ocean-edge access",
    ideology: "Manufactured stability is still a lie. The real world does not care about your institutions.",
    color: "muted",
  },
];

export const timeline: TimelineEvent[] = [
  { year: "Age Unknown", title: "Before the Veil", description: "The era before Panterra's protective systems. A world of raw ocean, untamed land, and pre-war civilizations whose knowledge would later be locked inside Pantheon archives.", category: "social" },
  { year: "Year 0", title: "The Founding of Panterra", description: "The Republic establishes the protected city-state of Panterra, drawing its first boundaries between governed society and the frontier beyond. The Parliament structure is formalized.", category: "political" },
  { year: "Year 47", title: "The First Sol Deus Ascension", description: "The Pantheon Sol Deus tier is formally established, elevating its first divine rulers above standard political authority. The separation between spiritual and civic power is institutionalized.", category: "political" },
  { year: "Year 89", title: "The Ocean Accords", description: "Following evidence of accelerating ocean degradation, the Magistry of Ocean is formally chartered. The first Paragon candidates are selected and trained for planetary recovery roles.", category: "technological" },
  { year: "Year 134", title: "The Language Purge", description: "The Sanctorium locks away certain ancient texts deemed destabilizing. Pantheon Ivory scholars become the sole authorized interpreters. Dead languages are reclassified as restricted knowledge.", category: "political" },
  { year: "Year 201", title: "The Apotheosis Protocol", description: "A new divine transition ceremony — the Apotheosis — is formalized. Carmela is appointed ceremony orchestrator, marking the first time a Lunary holds full ceremonial authority over Sol Deus succession.", category: "social" },
  { year: "Year 248", title: "The Frontier Breach", description: "Frontier survivors make contact with the Republic for the first time in three generations. The encounter forces Parliament to acknowledge what exists beyond their governed systems.", category: "military" },
  { year: "Year 267", title: "The Paragon Selection", description: "Culver Gretell is selected as a Paragon candidate for the Magistry of Ocean. Quinn is elevated into elite Pantheon service. The intersection of their paths begins here.", category: "social" },
  { year: "Year 289", title: "The Whisper Campaigns", description: "Verlaine begins their quiet ascent through Pantheon politics. Gemma is appointed as Lunary support. Something shifts in the alignment of power behind the visible structures.", category: "political" },
  { year: "Year 293", title: "The Present Hour", description: "The ocean systems grow more unstable. Parliamentary authority and Pantheon power move toward inevitable collision. Secrets long buried in dead languages begin to surface. Everything is in motion.", category: "political" },
];

export const worldRegions: WorldRegion[] = [
  {
    id: "panterra",
    name: "Panterra",
    description: "The Republic's protected central city-state — an engineered civilization designed to survive planetary instability. Gleaming institutional architecture masks the controlled nature of every life lived within its borders.",
    faction: "The Republic Parliament",
    features: ["Parliament Hall", "Paragon Training Academies", "The Grand Archive", "Controlled Environmental Systems"],
  },
  {
    id: "sanctorium",
    name: "The Sanctorium",
    description: "The vast knowledge-keeping complex where Pantheon Ivory scholars preserve and guard ancient texts, dead languages, and sacred institutional memory. Access is strictly tiered.",
    faction: "Pantheon Ivory",
    features: ["The Ivory Vaults", "Dead Language Archives", "Ceremony Halls", "Carmela's Chambers"],
  },
  {
    id: "deepforge",
    name: "The Deep Forge",
    description: "Below the visible world, the geothermal nexus that powers Panterra's systems. Ancient carvings predate the Republic. The Sol Deus order watches over it. Something about it is growing unstable.",
    faction: "Pantheon Sol Deus",
    features: ["Geothermal Vents", "Ancient Pre-Republic Carvings", "Oracle Chamber", "The Memory Pools"],
  },
  {
    id: "ocean-reaches",
    name: "The Ocean Reaches",
    description: "The degraded but vast ocean territories where Magistry of Ocean Paragon candidates work. Beautiful and haunting — what the world was before systems of control replaced natural order.",
    faction: "Magistry of Ocean",
    features: ["Research Stations", "Degraded Reef Systems", "Culver's Field Labs", "The Tide Markers"],
  },
  {
    id: "ashfields",
    name: "The Frontier Borderlands",
    description: "Beyond the Republic's governed edge — the world the maps leave out. Frontier survivors here know truths the institutions spend enormous energy hiding. Not all of them are willing to share.",
    faction: "Frontier / Unaligned",
    features: ["Survivor Camps", "Pre-War Ruins", "Sailor's Routes", "Ungoverned Ocean Channels"],
  },
];
