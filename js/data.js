/**
 * ═══════════════════════════════════════════════════════════════
 * FastBoard — Data & State Layer
 * ═══════════════════════════════════════════════════════════════
 * All mock data, application state, and data utilities.
 * Must be loaded BEFORE app.js.
 */

/* ───────────────────── Level Titles ───────────────────── */
const LevelTitles = {
    1: 'Spark',
    2: 'Ember',
    3: 'Flame',
    4: 'Blaze',
    5: 'Torch',
    6: 'Beacon',
    7: 'Luminary',
    8: 'Radiant',
    9: 'Stellar',
    10: 'Supernova'
};

/* ───────────────────── Avatar Colors ───────────────────── */
const AvatarColors = [
    '#EAE6DF',
    '#FAD4D8',
    '#D4DFFA',
    '#E2E8DE',
    '#F5E8D3',
    '#E6D6E9',
    '#DCE9E2',
    '#F0E5D8'
];

/**
 * Deterministic avatar gradient from a name string.
 * @param {string} name
 * @returns {string} CSS linear-gradient value
 */
function getAvatarColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AvatarColors[Math.abs(hash) % AvatarColors.length];
}

/* ═══════════════════════════════════════════════════════════════
   APPLICATION STATE
   ═══════════════════════════════════════════════════════════════ */
const AppState = {
    currentView: 'queue',
    friends: [],
    messages: {},

    /* ── User ── */
    user: {
        id: 'user-001',
        name: 'Aria Kumar',
        initials: 'AK',
        email: 'aria@example.com',
        level: 6,
        levelTitle: 'Beacon',
        xp: 2450,
        xpToNextLevel: 3600,
        streak: 14,
        longestStreak: 21,
        avgRecall: 87,
        unitsMastered: 142,
        rank: 12,
        rankChange: +3,
        archetype: { audio: 0.45, visual: 0.35, textual: 0.20 },
        badges: [
            { id: 'fire-starter', icon: '🔥', name: 'Fire Starter', desc: 'Complete first session', earned: true, earnedDate: '2026-05-05' },
            { id: 'sharpshooter', icon: '🎯', name: 'Sharpshooter', desc: '10 correct in a row', earned: true, earnedDate: '2026-05-12' },
            { id: 'consistency', icon: '🌊', name: 'Consistency', desc: '14-day streak', earned: true, earnedDate: '2026-06-19' },
            { id: 'mentor', icon: '🤝', name: 'Mentor', desc: '10 helpful replies', earned: true, earnedDate: '2026-06-01' },
            { id: 'polymath', icon: '🧬', name: 'Polymath', desc: 'Master 5 topics', earned: false },
            { id: 'mastery', icon: '⭐', name: 'Mastery', desc: '100 units at 5 stars', earned: false }
        ],
        mastery: [
            { topic: 'Cell Biology', stars: 4, progress: 82 },
            { topic: 'Genetics', stars: 3, progress: 65 },
            { topic: 'Organic Chemistry', stars: 2, progress: 42 },
            { topic: 'Thermodynamics', stars: 5, progress: 96 },
            { topic: 'Linear Algebra', stars: 3, progress: 60 },
            { topic: 'Calculus II', stars: 2, progress: 38 },
            { topic: 'Data Structures', stars: 4, progress: 78 },
            { topic: 'Algorithms', stars: 3, progress: 55 }
        ],
        weeklyActivity: [
            { day: 'Mon', minutes: 22, cards: 14 },
            { day: 'Tue', minutes: 18, cards: 11 },
            { day: 'Wed', minutes: 25, cards: 16 },
            { day: 'Thu', minutes: 15, cards: 9 },
            { day: 'Fri', minutes: 20, cards: 13 },
            { day: 'Sat', minutes: 28, cards: 18 },
            { day: 'Sun', minutes: 12, cards: 8 }
        ]
    },

    /* ── Queue / Session ── */
    queue: {
        totalCards: 6,
        cardOrder: ['audio-digest', 'recall-flashcard', 'visual-miniboard', 'community-pulse', 'micro-read', 'concept-link']
    },

    session: {
        isActive: true,
        currentCardIndex: 0,
        totalCards: 6,
        completedCards: 0,
        xpEarned: 0,
        correctAnswers: 0,
        totalAnswers: 0,
        startTime: null
    },

    notifications: [],
    settings: {}
};

/* ═══════════════════════════════════════════════════════════════
   LEADERBOARD DATA
   ═══════════════════════════════════════════════════════════════ */
const LeaderboardData = {
    recall: [
        { rank: 1, name: 'Dr. Marcus Chen', initials: 'MC', level: 9, levelTitle: 'Stellar', score: '96.8%', xp: 48200, change: 0 },
        { rank: 2, name: 'Sarah Mitchell', initials: 'SM', level: 7, levelTitle: 'Luminary', score: '94.2%', xp: 12450, change: +1 },
        { rank: 3, name: 'Alex Johnson', initials: 'AJ', level: 6, levelTitle: 'Beacon', score: '91.7%', xp: 8900, change: -1 },
        { rank: 4, name: 'Priya Sharma', initials: 'PS', level: 6, levelTitle: 'Beacon', score: '90.3%', xp: 7800, change: +2 },
        { rank: 5, name: 'Tom Williams', initials: 'TW', level: 5, levelTitle: 'Torch', score: '89.1%', xp: 6200, change: 0 },
        { rank: 6, name: 'Emma Davis', initials: 'ED', level: 5, levelTitle: 'Torch', score: '88.4%', xp: 5900, change: -1 },
        { rank: 7, name: 'Liu Wei', initials: 'LW', level: 5, levelTitle: 'Torch', score: '87.9%', xp: 5400, change: +3 },
        { rank: 8, name: 'Carlos Ruiz', initials: 'CR', level: 5, levelTitle: 'Torch', score: '87.5%', xp: 5100, change: -2 },
        { rank: 9, name: 'Nina Popov', initials: 'NP', level: 4, levelTitle: 'Blaze', score: '86.8%', xp: 4200, change: +1 },
        { rank: 10, name: 'James O\'Brien', initials: 'JO', level: 4, levelTitle: 'Blaze', score: '86.2%', xp: 3900, change: 0 },
        { rank: 11, name: 'Yuki Tanaka', initials: 'YT', level: 4, levelTitle: 'Blaze', score: '85.9%', xp: 3600, change: +2 },
        { rank: 12, name: 'Aria Kumar', initials: 'AK', level: 6, levelTitle: 'Beacon', score: '85.3%', xp: 2450, change: +3, isCurrentUser: true },
        { rank: 13, name: 'Sophie Martin', initials: 'SM', level: 3, levelTitle: 'Flame', score: '84.7%', xp: 2100, change: -1 },
        { rank: 14, name: 'David Kim', initials: 'DK', level: 3, levelTitle: 'Flame', score: '83.9%', xp: 1800, change: -3 },
        { rank: 15, name: 'Rachel Green', initials: 'RG', level: 3, levelTitle: 'Flame', score: '82.4%', xp: 1500, change: 0 }
    ],

    streak: [
        { rank: 1, name: 'Tom Williams', initials: 'TW', level: 5, levelTitle: 'Torch', score: '45 days', change: 0 },
        { rank: 2, name: 'Sarah Mitchell', initials: 'SM', level: 7, levelTitle: 'Luminary', score: '38 days', change: 0 },
        { rank: 3, name: 'Emma Davis', initials: 'ED', level: 5, levelTitle: 'Torch', score: '31 days', change: +1 },
        { rank: 4, name: 'Dr. Marcus Chen', initials: 'MC', level: 9, levelTitle: 'Stellar', score: '28 days', change: -1 },
        { rank: 5, name: 'Liu Wei', initials: 'LW', level: 5, levelTitle: 'Torch', score: '22 days', change: +2 },
        { rank: 6, name: 'Priya Sharma', initials: 'PS', level: 6, levelTitle: 'Beacon', score: '19 days', change: 0 },
        { rank: 7, name: 'Aria Kumar', initials: 'AK', level: 6, levelTitle: 'Beacon', score: '14 days', change: +3, isCurrentUser: true },
        { rank: 8, name: 'Carlos Ruiz', initials: 'CR', level: 5, levelTitle: 'Torch', score: '12 days', change: -1 },
        { rank: 9, name: 'Nina Popov', initials: 'NP', level: 4, levelTitle: 'Blaze', score: '10 days', change: 0 },
        { rank: 10, name: 'Alex Johnson', initials: 'AJ', level: 6, levelTitle: 'Beacon', score: '8 days', change: -2 },
        { rank: 11, name: 'Yuki Tanaka', initials: 'YT', level: 4, levelTitle: 'Blaze', score: '7 days', change: +1 },
        { rank: 12, name: 'James O\'Brien', initials: 'JO', level: 4, levelTitle: 'Blaze', score: '6 days', change: 0 },
        { rank: 13, name: 'Sophie Martin', initials: 'SM', level: 3, levelTitle: 'Flame', score: '5 days', change: 0 },
        { rank: 14, name: 'Raj Kumar', initials: 'RK', level: 3, levelTitle: 'Flame', score: '4 days', change: +2 },
        { rank: 15, name: 'Rachel Green', initials: 'RG', level: 3, levelTitle: 'Flame', score: '3 days', change: -1 }
    ],

    contributor: [
        { rank: 1, name: 'Sarah Mitchell', initials: 'SM', level: 7, levelTitle: 'Luminary', score: '2,340 pts', change: 0 },
        { rank: 2, name: 'Dr. Marcus Chen', initials: 'MC', level: 9, levelTitle: 'Stellar', score: '2,180 pts', change: 0 },
        { rank: 3, name: 'Lisa Park', initials: 'LP', level: 5, levelTitle: 'Torch', score: '1,890 pts', change: +2 },
        { rank: 4, name: 'Aria Kumar', initials: 'AK', level: 6, levelTitle: 'Beacon', score: '1,650 pts', change: +1, isCurrentUser: true },
        { rank: 5, name: 'Jake Morrison', initials: 'JM', level: 4, levelTitle: 'Blaze', score: '1,420 pts', change: -2 },
        { rank: 6, name: 'Emma Davis', initials: 'ED', level: 5, levelTitle: 'Torch', score: '1,280 pts', change: 0 },
        { rank: 7, name: 'Alex Johnson', initials: 'AJ', level: 6, levelTitle: 'Beacon', score: '1,100 pts', change: +1 },
        { rank: 8, name: 'Priya Sharma', initials: 'PS', level: 6, levelTitle: 'Beacon', score: '980 pts', change: -1 },
        { rank: 9, name: 'Tom Williams', initials: 'TW', level: 5, levelTitle: 'Torch', score: '870 pts', change: 0 },
        { rank: 10, name: 'Liu Wei', initials: 'LW', level: 5, levelTitle: 'Torch', score: '740 pts', change: +2 },
        { rank: 11, name: 'Carlos Ruiz', initials: 'CR', level: 5, levelTitle: 'Torch', score: '650 pts', change: 0 },
        { rank: 12, name: 'Nina Popov', initials: 'NP', level: 4, levelTitle: 'Blaze', score: '580 pts', change: -1 },
        { rank: 13, name: 'David Kim', initials: 'DK', level: 3, levelTitle: 'Flame', score: '490 pts', change: 0 },
        { rank: 14, name: 'Yuki Tanaka', initials: 'YT', level: 4, levelTitle: 'Blaze', score: '420 pts', change: +1 },
        { rank: 15, name: 'Rachel Green', initials: 'RG', level: 3, levelTitle: 'Flame', score: '350 pts', change: -1 }
    ]
};

/* ═══════════════════════════════════════════════════════════════
   NOTIFICATIONS DATA
   ═══════════════════════════════════════════════════════════════ */
const NotificationsData = [
    { id: 1, icon: '🏆', text: 'You moved up 3 spots on the leaderboard!', time: '1h ago', read: false },
    { id: 2, icon: '🔥', text: 'Your streak is at 14 days! Keep going!', time: '2h ago', read: false },
    { id: 3, icon: '💬', text: 'Sarah replied to your comment on Cell Division', time: '3h ago', read: true },
    { id: 4, icon: '⭐', text: 'You earned the Sharpshooter badge!', time: 'Yesterday', read: true },
    { id: 5, icon: '📚', text: '3 new learn units available in Genetics', time: 'Yesterday', read: true }
];

/* ═══════════════════════════════════════════════════════════════
   QUEUE CARD DEFINITIONS
   ═══════════════════════════════════════════════════════════════
   Each object describes a single learn-queue card:
   type, id, and any content the renderer might need.
   ═══════════════════════════════════════════════════════════════ */
const QueueCards = [
    {
        id: 'audio-digest',
        type: 'audio',
        topic: 'Cell Biology',
        title: 'Mitosis: Cell Division Phases',
        duration: '1:24',
        durationSeconds: 84,
        transcript: 'Mitosis is the process of cell division that results in two genetically identical daughter cells. It occurs in four main phases: Prophase, where chromosomes condense and become visible; Metaphase, where chromosomes align at the cell\'s equator; Anaphase, where sister chromatids separate and move to opposite poles; and Telophase, where nuclear envelopes reform around each set of chromosomes. Cytokinesis then divides the cytoplasm, completing the process.'
    },
    {
        id: 'recall-flashcard',
        type: 'recall',
        topic: 'Genetics',
        title: 'Recall Challenge',
        question: 'Explain the difference between dominant and recessive alleles and how they determine phenotype in a heterozygous organism.',
        answer: 'A dominant allele expresses its phenotype even when paired with a different allele (heterozygous state). A recessive allele only expresses its phenotype when two copies are present (homozygous recessive). In a heterozygous organism (Aa), the dominant allele (A) masks the recessive allele (a), so the organism displays the dominant phenotype.'
    },
    {
        id: 'visual-miniboard',
        type: 'visual',
        topic: 'Cell Biology',
        title: 'Meiosis vs. Mitosis: Comparison',
        columns: ['Mitosis', 'Meiosis'],
        items: [
            { id: 'item-crossing', text: 'Crossing Over', correct: 'Meiosis' },
            { id: 'item-2n2n', text: '2n → 2n', correct: 'Mitosis' },
            { id: 'item-diversity', text: 'Genetic Diversity', correct: 'Meiosis' },
            { id: 'item-growth', text: 'Growth & Repair', correct: 'Mitosis' },
            { id: 'item-2nn', text: '2n → n', correct: 'Meiosis' }
        ]
    },
    {
        id: 'community-pulse',
        type: 'community',
        topic: 'Thermodynamics',
        title: 'Community Pulse',
        question: 'Can entropy ever decrease in a closed system? I\'m confused about local vs global entropy changes.',
        author: 'Jake M.',
        authorInitials: 'JM',
        replies: 4,
        votes: 12
    },
    {
        id: 'micro-read',
        type: 'read',
        topic: 'Cell Biology',
        title: 'Quick Read',
        passage: 'During cell division, animal cells undergo cytokinesis through a process called cleavage. A contractile ring of actin and myosin filaments forms beneath the plasma membrane at the cell equator. This ring contracts, pinching the cell inward to form a cleavage furrow that deepens until the cell is split into two daughter cells.',
        questionText: 'What structure is responsible for pinching the cell during cytokinesis?',
        options: ['Spindle Fibers', 'Cleavage Furrow', 'Cell Plate', 'Centrioles'],
        correctAnswer: 'Cleavage Furrow'
    },
    {
        id: 'concept-link',
        type: 'concept',
        topic: 'Genetics',
        title: 'Concept Link',
        prompt: 'How does crossing over during meiosis I contribute to genetic diversity? Explain the mechanism and its significance for evolution.',
        hint: 'Think about homologous chromosomes, chiasmata, and recombinant gametes.'
    }
];

/* ═══════════════════════════════════════════════════════════════
   COMMONS / COMMUNITY FEED DATA
   ═══════════════════════════════════════════════════════════════ */
const CommonsFeed = [
    {
        id: 'post-1',
        author: 'Sarah Mitchell',
        initials: 'SM',
        level: 7,
        levelTitle: 'Luminary',
        time: '2h ago',
        tag: 'Biology',
        tagColor: 'var(--accent-red)',
        text: 'Just discovered that mitochondrial DNA is inherited exclusively from the mother. This has fascinating implications for tracing maternal lineage. Has anyone explored the "Mitochondrial Eve" concept?',
        likes: 24,
        comments: 8,
        shares: 3,
        liked: false
    },
    {
        id: 'post-2',
        author: 'Dr. Marcus Chen',
        initials: 'MC',
        level: 9,
        levelTitle: 'Stellar',
        time: '4h ago',
        tag: 'Physics',
        tagColor: 'var(--border-navy)',
        text: 'Pro tip: When studying thermodynamics, always start with the zeroth law. It\'s the foundation that makes the other three laws make sense. Think of it as the "hidden prerequisite" that textbooks often gloss over.',
        likes: 42,
        comments: 15,
        shares: 11,
        liked: false
    },
    {
        id: 'post-3',
        author: 'Priya Sharma',
        initials: 'PS',
        level: 6,
        levelTitle: 'Beacon',
        time: '6h ago',
        tag: 'Chemistry',
        tagColor: 'var(--accent-red)',
        text: 'Can someone explain why the Haber process requires high pressure despite being exothermic? I get Le Chatelier\'s principle, but the kinetics vs thermodynamics trade-off is tricky.',
        likes: 18,
        comments: 12,
        shares: 2,
        liked: false
    },
    {
        id: 'post-4',
        author: 'Liu Wei',
        initials: 'LW',
        level: 5,
        levelTitle: 'Torch',
        time: '8h ago',
        tag: 'Biology',
        tagColor: 'var(--accent-red)',
        text: 'Found an incredible interactive visualization for understanding cellular transport mechanisms. It really clicks when you can see active transport vs passive diffusion happening in real-time.',
        likes: 31,
        comments: 6,
        shares: 14,
        liked: false
    },
    {
        id: 'post-5',
        author: 'Emma Davis',
        initials: 'ED',
        level: 5,
        levelTitle: 'Torch',
        time: '1d ago',
        tag: 'Chemistry',
        tagColor: 'var(--accent-red)',
        text: 'Hot take: Organic Chemistry gets a bad reputation but it\'s really just pattern recognition once you learn the major reaction mechanisms. The key is understanding nucleophiles and electrophiles.',
        likes: 56,
        comments: 23,
        shares: 8,
        liked: false
    }
];

/* ═══════════════════════════════════════════════════════════════
   CREATOR PIPELINE DATA
   ═══════════════════════════════════════════════════════════════ */
const CreatorPipeline = [
    { id: 'step-upload', label: 'Upload', status: 'complete', progress: 100 },
    { id: 'step-extract', label: 'Extract', status: 'active', progress: 62 },
    { id: 'step-generate', label: 'Generate', status: 'pending', progress: 0 },
    { id: 'step-review', label: 'Review', status: 'pending', progress: 0 },
    { id: 'step-publish', label: 'Publish', status: 'pending', progress: 0 }
];

/* ═══════════════════════════════════════════════════════════════
   XP THRESHOLDS PER LEVEL
   ═══════════════════════════════════════════════════════════════ */
const XPThresholds = {
    1: 0,
    2: 200,
    3: 600,
    4: 1200,
    5: 2000,
    6: 3000,
    7: 4200,
    8: 5600,
    9: 7200,
    10: 9000
};
