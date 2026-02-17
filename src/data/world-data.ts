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
    id: "aldric",
    name: "Emperor Aldric Voss",
    title: "The Iron Sovereign",
    faction: "The Imperial Crown",
    alignment: "Authoritarian Pragmatist",
    personality: ["Calculating", "Charismatic", "Ruthless", "Visionary"],
    background: "Born to the lesser branch of the Voss dynasty, Aldric seized the throne through a combination of political cunning and strategic marriages. He believes the empire's survival demands absolute control, viewing dissent as rot that must be excised before it spreads.",
    relationships: "Complex tension with Lady Seraphine — political alliance masks deeper emotional entanglement. Despises Commander Kael as a threat to imperial order.",
    image: "char-emperor",
  },
  {
    id: "kael",
    name: "Commander Kael Ashford",
    title: "The People's Blade",
    faction: "The Ashborn Resistance",
    alignment: "Revolutionary Idealist",
    personality: ["Passionate", "Stubborn", "Honorable", "Haunted"],
    background: "Once a decorated imperial officer, Kael deserted after witnessing the Crown's atrocities in the Lower Wards. Now leads the resistance with tactical brilliance, carrying the weight of every life lost under his command.",
    relationships: "Former comrade-turned-enemy of Aldric. Unresolved romantic history with Lienna. Mentor to young engineer Wren.",
    image: "char-rebel",
  },
  {
    id: "seraphine",
    name: "Lady Seraphine Duval",
    title: "The Velvet Viper",
    faction: "The Gilded Court",
    alignment: "Self-Serving Strategist",
    personality: ["Elegant", "Manipulative", "Brilliant", "Lonely"],
    background: "The most powerful woman in the empire's aristocracy, Seraphine wields influence through secrets, favors, and an intricate web of alliances. Behind the silk and jewels lies a woman who learned early that vulnerability is a luxury the powerful cannot afford.",
    relationships: "Political and emotional entanglement with Emperor Aldric. Secret benefactor to certain resistance cells. Rival to Spymaster Corvus.",
    image: "char-aristocrat",
  },
  {
    id: "corvus",
    name: "Corvus Nyx",
    title: "The Shadow Architect",
    faction: "The Bureau of Whispers",
    alignment: "Enigmatic Neutral",
    personality: ["Secretive", "Patient", "Amoral", "Perceptive"],
    background: "No one knows Corvus's true origins. The empire's spymaster operates from the shadows, collecting secrets like currency. Their loyalty shifts with the political winds — or perhaps follows a deeper agenda no one has yet uncovered.",
    relationships: "Serves the Emperor but answers to no one. Has unknown history with the Oracle of the Deep Forge. Seraphine considers them her most dangerous rival.",
    image: "char-spymaster",
  },
  {
    id: "wren",
    name: "Wren Gallagher",
    title: "The Forgeborn",
    faction: "The Ashborn Resistance",
    alignment: "Reluctant Hero",
    personality: ["Inventive", "Anxious", "Compassionate", "Reckless"],
    background: "A prodigy mechanic from the industrial slums, Wren builds weapons for the resistance while dreaming of a world where technology uplifts rather than oppresses. Lost his arm in a factory accident at fourteen — replaced it with a mechanical limb of his own design.",
    relationships: "Protégé of Commander Kael. Complicated feelings for someone on the wrong side of the conflict. Sees the Oracle as a kindred spirit.",
    image: "char-engineer",
  },
  {
    id: "lienna",
    name: "Lienna Ashvale",
    title: "The Ember Oracle",
    faction: "The Order of the Deep Forge",
    alignment: "Mystical Guardian",
    personality: ["Ethereal", "Wise", "Burdened", "Fierce"],
    background: "High priestess of an ancient order that tends to the empire's geothermal power source — the Deep Forge. Lienna sees visions in the steam and fire, prophecies that have made her both revered and feared. She carries knowledge that could reshape the empire.",
    relationships: "Former lover of Commander Kael. The Emperor seeks her prophetic gifts. Shares a spiritual bond with Wren. Corvus watches her closely.",
    image: "char-oracle",
  },
];

export const factions: Faction[] = [
  {
    id: "crown",
    name: "The Imperial Crown",
    motto: "Order Through Dominion",
    description: "The ruling power of the empire, centered in the Brass Citadel. The Crown maintains control through military might, propaganda, and the monopoly on steam-powered technology. Its aristocracy lives in opulence while the lower wards decay.",
    leader: "Emperor Aldric Voss",
    strength: "Military force, technological monopoly, institutional control",
    ideology: "Hierarchical order is the natural state. The strong rule, the weak serve, and the empire endures.",
    color: "primary",
  },
  {
    id: "resistance",
    name: "The Ashborn Resistance",
    motto: "From Ash, We Rise",
    description: "A growing insurgency born in the industrial slums and factory districts. The Ashborn fight for liberation from imperial oppression, using guerrilla tactics and repurposed technology. They are divided between those who seek reform and those who demand revolution.",
    leader: "Commander Kael Ashford",
    strength: "Popular support, guerrilla warfare, ingenuity",
    ideology: "Every person deserves freedom and dignity. The empire's hierarchy is a machine built on suffering.",
    color: "accent",
  },
  {
    id: "court",
    name: "The Gilded Court",
    motto: "Influence Is the Truest Power",
    description: "The aristocratic elite who wield power through wealth, marriage, and political maneuvering. They maintain the social hierarchy but are not above playing all sides when it serves their interests. Many secretly fund both the Crown and the resistance.",
    leader: "Lady Seraphine Duval (unofficial)",
    strength: "Wealth, information networks, political alliances",
    ideology: "Power belongs to those clever enough to claim it and ruthless enough to keep it.",
    color: "brass",
  },
  {
    id: "bureau",
    name: "The Bureau of Whispers",
    motto: "We See All, We Serve None",
    description: "The empire's intelligence apparatus, operating in shadows. The Bureau's agents are everywhere — in the court, the resistance, the factories, and the temples. Their true agenda remains unknown even to the Emperor who nominally commands them.",
    leader: "Corvus Nyx",
    strength: "Espionage, blackmail, infiltration",
    ideology: "Information is the only true currency. All other power is an illusion.",
    color: "muted",
  },
  {
    id: "forge",
    name: "The Order of the Deep Forge",
    motto: "The Fire Remembers",
    description: "An ancient religious order that tends to the geothermal energy source powering the empire's steam technology. Part spiritual guardians, part engineers, the Order possesses knowledge predating the current empire — secrets that could change everything.",
    leader: "Lienna Ashvale, Ember Oracle",
    strength: "Ancient knowledge, geothermal control, prophecy",
    ideology: "The earth's fire is sacred. Technology and spirit must exist in balance, or both will consume us.",
    color: "copper",
  },
];

export const timeline: TimelineEvent[] = [
  { year: "Year 0", title: "The Founding Fire", description: "Discovery of the Deep Forge — a massive geothermal vent that becomes the foundation of steam-powered civilization.", category: "technological" },
  { year: "Year 87", title: "The First Crown", description: "The Voss dynasty unifies warring city-states under a single imperial banner, establishing the Brass Citadel as the capital.", category: "political" },
  { year: "Year 134", title: "The Great Expansion", description: "Imperial forces conquer the outer territories, establishing mining colonies and factory districts that fuel the empire's industrial machine.", category: "military" },
  { year: "Year 201", title: "The Gilded Compact", description: "The aristocracy formalizes its power through the Compact — a political agreement that grants noble houses control over trade and industry.", category: "political" },
  { year: "Year 248", title: "The Lower Ward Plague", description: "A devastating illness sweeps through the industrial districts. The Crown's delayed response ignites the first sparks of organized resistance.", category: "social" },
  { year: "Year 267", title: "The Mechanist Revolution", description: "Breakthrough in steam-powered prosthetics and automated machinery transforms both industry and warfare.", category: "technological" },
  { year: "Year 289", title: "The Ashborn Uprising", description: "Commander Kael Ashford leads the first coordinated resistance action, liberating three factory districts before imperial forces respond.", category: "military" },
  { year: "Year 293", title: "The Present Day", description: "The empire teeters on the edge of civil war. Alliances shift, secrets surface, and the Deep Forge grows increasingly unstable.", category: "political" },
];

export const worldRegions: WorldRegion[] = [
  {
    id: "citadel",
    name: "The Brass Citadel",
    description: "The imperial capital, a towering fortress-city of gleaming brass spires and steam-powered infrastructure. Home to the Emperor, the Gilded Court, and the empire's most advanced technology.",
    faction: "The Imperial Crown",
    features: ["Imperial Palace", "The Grand Clocktower", "Senate of Gears", "Royal Armory"],
  },
  {
    id: "lowerwards",
    name: "The Lower Wards",
    description: "Sprawling industrial districts beneath the Citadel, choked with smog and poverty. Factory workers labor in dangerous conditions while resistance cells organize in the shadows.",
    faction: "The Ashborn Resistance",
    features: ["Iron Mile Factories", "The Soot Markets", "Underground Rail Network", "Hidden Resistance Cells"],
  },
  {
    id: "deepforge",
    name: "The Deep Forge",
    description: "A vast underground cavern network centered around the empire's primary geothermal vent. Sacred to the Order, it provides the steam power that drives all imperial technology.",
    faction: "The Order of the Deep Forge",
    features: ["The Ember Sanctum", "Geothermal Vents", "Ancient Carvings", "The Oracle's Chamber"],
  },
  {
    id: "gildedhills",
    name: "The Gilded Hills",
    description: "Rolling estates and manor houses of the aristocracy, surrounded by manicured gardens and private armies. A world of luxury built on the labor of the Lower Wards.",
    faction: "The Gilded Court",
    features: ["Duval Manor", "The Crystal Conservatory", "Aristocratic Academies", "Private Sky Docks"],
  },
  {
    id: "ashfields",
    name: "The Ash Fields",
    description: "Scarred borderlands between imperial control and the contested outer territories. Ruined towns and abandoned mines mark the empire's violent expansion.",
    faction: "Contested",
    features: ["Abandoned Mines", "Refugee Camps", "Rusted War Machines", "The Memorial Wall"],
  },
];
